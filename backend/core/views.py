from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes, parser_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Q
from django.shortcuts import get_object_or_404
from .models import (
    User, Listing, BookingRequest, ChatRoom, Message,
    LegalAgreement, PHILIPPINE_SAFETY_ACTS,
    Conversation, DirectMessage, MessageReaction, Review,
)
from .serializers import (
    UserSerializer, ListingSerializer, BookingRequestSerializer,
    ChatRoomSerializer, MessageSerializer,
    LegalAgreementSerializer, LegalActSerializer,
    RegistrationSerializer, IDUploadSerializer, VerificationReviewSerializer,
    ConversationSerializer, DirectMessageSerializer, ReviewSerializer,
)
from .permissions import IsOwnerOrReadOnly


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return super().get_permissions()


class ListingViewSet(viewsets.ModelViewSet):
    queryset = Listing.objects.all()
    serializer_class = ListingSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    def get_queryset(self):
        """Support filtering by user, property_type, location, price range, availability."""
        user_id = self.request.query_params.get('user_id')
        
        # If requesting specifically for a user (e.g., dashboard), show all their listings inc. unavailable
        if user_id:
            qs = Listing.objects.filter(user_id=user_id)
        else:
            qs = Listing.objects.filter(is_available=True)

        property_type = self.request.query_params.get('property_type')
        location = self.request.query_params.get('location')
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        bedrooms = self.request.query_params.get('bedrooms')
        has_amenity = self.request.query_params.get('has_amenity')

        if property_type:
            qs = qs.filter(property_type=property_type)
        if location:
            if location.lower() != 'all cebu':
                qs = qs.filter(location__icontains=location)
        if min_price:
            qs = qs.filter(monthly_rent__gte=min_price)
        if max_price:
            qs = qs.filter(monthly_rent__lte=max_price)
        if bedrooms:
            qs = qs.filter(bedrooms__gte=bedrooms)
        if has_amenity:
            qs = qs.filter(amenities__icontains=has_amenity)

        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class BookingRequestViewSet(viewsets.ModelViewSet):
    serializer_class = BookingRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Show requests the user sent OR requests for listings the user owns
        return BookingRequest.objects.filter(
            Q(tenant=user) | Q(listing__user=user)
        )

    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user)

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        booking = self.get_object()
        if booking.listing.user != request.user:
            return Response({'error': 'Only the property owner can accept.'}, status=status.HTTP_403_FORBIDDEN)
        booking.status = 'ACCEPTED'
        booking.save()
        return Response({'status': 'accepted'})

    @action(detail=True, methods=['post'])
    def decline(self, request, pk=None):
        booking = self.get_object()
        if booking.listing.user != request.user:
            return Response({'error': 'Only the property owner can decline.'}, status=status.HTTP_403_FORBIDDEN)
        booking.status = 'DECLINED'
        booking.save()
        return Response({'status': 'declined'})


# ──── Safety & Verification ────


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_safety_acts(request):
    return Response(PHILIPPINE_SAFETY_ACTS)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_user(request):
    serializer = RegistrationSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data

    user = User.objects.create_user(
        username=data['username'],
        password=data['password'],
        email=data['email'],
        first_name=data['first_name'],
        last_name=data['last_name'],
        date_of_birth=data['date_of_birth'],
        is_landlord=data.get('is_landlord', False),
        legal_agreements_accepted=True,
    )

    # Log each accepted act
    for act in PHILIPPINE_SAFETY_ACTS:
        if act['code'] in data['accepted_acts']:
            LegalAgreement.objects.create(
                user=user,
                act_code=act['code'],
                act_title=act['title'],
                ip_address=request.META.get('REMOTE_ADDR'),
            )

    # Return an auth token for immediate login
    from rest_framework.authtoken.models import Token
    token, _ = Token.objects.get_or_create(user=user)
    return Response({
        'token': token.key,
        'user_id': user.id,
        'username': user.username,
        'is_landlord': user.is_landlord,
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def upload_id_document(request):
    serializer = IDUploadSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data

    user = request.user
    user.id_document = data['id_front']
    if data.get('id_back'):
        user.id_document_back = data['id_back']
    user.ocr_extracted_name = data.get('ocr_extracted_name', '')
    user.ocr_extracted_dob = data.get('ocr_extracted_dob', '')
    user.ocr_confidence = data.get('ocr_confidence', 0.0)
    user.verification_status = 'PENDING'
    user.save()

    return Response({'status': 'pending', 'message': 'ID uploaded. Awaiting admin review.'})


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def verification_status(request):
    user = request.user
    return Response({
        'verification_status': user.verification_status,
        'verification_note': user.verification_note,
        'ocr_extracted_name': user.ocr_extracted_name,
        'ocr_extracted_dob': user.ocr_extracted_dob,
        'ocr_confidence': user.ocr_confidence,
    })


@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def admin_pending_verifications(request):
    pending = User.objects.filter(verification_status='PENDING')
    data = []
    for u in pending:
        data.append({
            'id': u.id, 'username': u.username,
            'first_name': u.first_name, 'last_name': u.last_name,
            'email': u.email, 'date_of_birth': str(u.date_of_birth) if u.date_of_birth else None,
            'id_document': u.id_document.url if u.id_document else None,
            'id_document_back': u.id_document_back.url if u.id_document_back else None,
            'ocr_extracted_name': u.ocr_extracted_name,
            'ocr_extracted_dob': u.ocr_extracted_dob,
            'ocr_confidence': u.ocr_confidence,
            'verification_status': u.verification_status,
        })
    return Response(data)


@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def admin_review_verification(request, user_id):
    user = get_object_or_404(User, id=user_id)
    serializer = VerificationReviewSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    action_type = serializer.validated_data['action']
    note = serializer.validated_data.get('note', '')

    if action_type == 'approve':
        user.verification_status = 'APPROVED'
    else:
        user.verification_status = 'REJECTED'

    user.verification_note = note
    user.save()

    return Response({
        'status': user.verification_status,
        'note': note,
    })


# ──── Direct Messaging ────


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def conversation_list(request):
    """Get all conversations for the current user."""
    convs = Conversation.objects.filter(
        Q(user1=request.user) | Q(user2=request.user)
    )
    serializer = ConversationSerializer(convs, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def start_conversation(request):
    """Start or get an existing conversation with another user."""
    other_user_id = request.data.get('user_id')
    listing_id = request.data.get('listing_id')

    if not other_user_id:
        return Response({'error': 'user_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        other_user = User.objects.get(id=other_user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

    if other_user == request.user:
        return Response({'error': 'Cannot start conversation with yourself.'}, status=status.HTTP_400_BAD_REQUEST)

    listing = None
    if listing_id:
        try:
            listing = Listing.objects.get(id=listing_id)
        except Listing.DoesNotExist:
            pass

    conv = Conversation.get_or_create_conversation(request.user, other_user, listing=listing)
    serializer = ConversationSerializer(conv, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def conversation_messages(request, conversation_id):
    """Get messages for a conversation. Marks them as read."""
    conv = get_object_or_404(Conversation, id=conversation_id)

    # Verify user is a participant
    if request.user not in [conv.user1, conv.user2]:
        return Response({'error': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)

    messages = conv.messages.all()

    # Mark unread messages from the other person as read
    conv.messages.filter(is_read=False).exclude(sender=request.user).update(is_read=True)

    serializer = DirectMessageSerializer(messages, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def send_dm(request, conversation_id):
    """Send a message in a conversation."""
    conv = get_object_or_404(Conversation, id=conversation_id)

    if request.user not in [conv.user1, conv.user2]:
        return Response({'error': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)

    content = request.data.get('content', '')
    image = request.data.get('image', None)

    if not content and not image:
        return Response({'error': 'Message cannot be empty.'}, status=status.HTTP_400_BAD_REQUEST)

    dm = DirectMessage.objects.create(
        conversation=conv,
        sender=request.user,
        content=content,
    )
    if image:
        dm.image = image
        dm.save()

    # Update conversation timestamp
    conv.save()

    serializer = DirectMessageSerializer(dm)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def toggle_reaction(request, message_id):
    """Toggle a reaction on a message."""
    dm = get_object_or_404(DirectMessage, id=message_id)

    # Verify user is in the conversation
    conv = dm.conversation
    if request.user not in [conv.user1, conv.user2]:
        return Response({'error': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)

    reaction_type = request.data.get('reaction_type')
    VALID_REACTIONS = ['thumbs_up', 'heart', 'laugh', 'fire', 'sad']
    if reaction_type not in VALID_REACTIONS:
        return Response(
            {'error': f'Invalid reaction. Must be one of: {", ".join(VALID_REACTIONS)}'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    existing = MessageReaction.objects.filter(
        message=dm, user=request.user, reaction_type=reaction_type
    ).first()

    if existing:
        existing.delete()
        return Response({'status': 'removed'})
    else:
        MessageReaction.objects.create(
            message=dm, user=request.user, reaction_type=reaction_type
        )
        return Response({'status': 'added'})


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def unread_count(request):
    """Get total unread DM count for the current user."""
    convs = Conversation.objects.filter(
        Q(user1=request.user) | Q(user2=request.user)
    )
    total = 0
    for conv in convs:
        total += conv.messages.filter(is_read=False).exclude(sender=request.user).count()
    return Response({'unread_count': total})


# ──── Reviews ────


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def listing_reviews(request, listing_id):
    """Get all reviews for a listing."""
    listing = get_object_or_404(Listing, id=listing_id)
    reviews = Review.objects.filter(listing=listing)
    serializer = ReviewSerializer(reviews, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_review(request, listing_id):
    """Create a review for a listing."""
    listing = get_object_or_404(Listing, id=listing_id)

    # Cannot review your own listing
    if listing.user == request.user:
        return Response(
            {'error': 'You cannot review your own listing.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Check for existing review
    if Review.objects.filter(reviewer=request.user, listing=listing).exists():
        return Response(
            {'error': 'You have already reviewed this listing.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    rating = request.data.get('rating', 5)
    comment = request.data.get('comment', '')

    try:
        rating = int(rating)
    except (ValueError, TypeError):
        return Response({'error': 'Rating must be a number.'}, status=status.HTTP_400_BAD_REQUEST)

    if rating < 1 or rating > 5:
        return Response({'error': 'Rating must be between 1 and 5.'}, status=status.HTTP_400_BAD_REQUEST)

    review = Review.objects.create(
        reviewer=request.user,
        listing=listing,
        rating=rating,
        comment=comment,
    )

    serializer = ReviewSerializer(review)
    return Response(serializer.data, status=status.HTTP_201_CREATED)
