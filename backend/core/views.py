from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes, parser_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Q
from django.utils import timezone
from .models import (
    User, Profile, RentRequest, ChatRoom, Message,
    LegalAgreement, PHILIPPINE_SAFETY_ACTS,
    Conversation, DirectMessage, MessageReaction, Review,
)
from .serializers import (
    UserSerializer, ProfileSerializer, RentRequestSerializer,
    ChatRoomSerializer, MessageSerializer,
    LegalAgreementSerializer, LegalActSerializer,
    RegistrationSerializer, IDUploadSerializer, VerificationReviewSerializer,
    ConversationSerializer, DirectMessageSerializer, ReviewSerializer,
)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create']:
            return [permissions.AllowAny()]
        return super().get_permissions()


class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class RentRequestViewSet(viewsets.ModelViewSet):
    serializer_class = RentRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_rentable:
            return RentRequest.objects.filter(profile__user=user)
        return RentRequest.objects.filter(client=user)

    def perform_create(self, serializer):
        serializer.save(client=self.request.user)

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        rent_request = self.get_object()
        if request.user != rent_request.profile.user:
            return Response({'status': 'not authorized'}, status=status.HTTP_403_FORBIDDEN)
        rent_request.status = 'ACCEPTED'
        rent_request.save()
        return Response({'status': 'request accepted'})

    @action(detail=True, methods=['post'])
    def decline(self, request, pk=None):
        rent_request = self.get_object()
        if request.user != rent_request.profile.user:
            return Response({'status': 'not authorized'}, status=status.HTTP_403_FORBIDDEN)
        rent_request.status = 'DECLINED'
        rent_request.save()
        return Response({'status': 'request declined'})


# ──── Phase 2+3: Safety & Verification ────


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_safety_acts(request):
    serializer = LegalActSerializer(PHILIPPINE_SAFETY_ACTS, many=True)
    return Response(serializer.data)


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
        legal_agreements_accepted=True,
        legal_accepted_at=timezone.now(),
    )

    ip_address = request.META.get('REMOTE_ADDR', None)
    for act in PHILIPPINE_SAFETY_ACTS:
        if act['code'] in data['accepted_acts']:
            LegalAgreement.objects.create(
                user=user, act_code=act['code'],
                act_title=act['title'], ip_address=ip_address,
            )

    from rest_framework.authtoken.models import Token
    token, _ = Token.objects.get_or_create(user=user)

    return Response({
        'user': UserSerializer(user).data,
        'token': token.key,
        'message': 'Registration successful.',
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

    return Response({
        'status': 'ID uploaded successfully',
        'verification_status': 'PENDING',
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def verification_status(request):
    user = request.user
    return Response({
        'verification_status': user.verification_status,
        'is_age_verified': user.is_age_verified,
        'legal_agreements_accepted': user.legal_agreements_accepted,
        'has_id_document': bool(user.id_document),
    })


@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def admin_pending_verifications(request):
    pending_users = User.objects.filter(verification_status='PENDING').order_by('-date_joined')
    results = []
    for u in pending_users:
        results.append({
            'id': u.id, 'username': u.username, 'email': u.email,
            'first_name': u.first_name, 'last_name': u.last_name,
            'date_of_birth': str(u.date_of_birth) if u.date_of_birth else None,
            'date_joined': u.date_joined.isoformat(),
            'ocr_extracted_name': u.ocr_extracted_name,
            'ocr_extracted_dob': u.ocr_extracted_dob,
            'ocr_confidence': u.ocr_confidence,
            'id_document_url': request.build_absolute_uri(u.id_document.url) if u.id_document else None,
            'id_document_back_url': (
                request.build_absolute_uri(u.id_document_back.url) if u.id_document_back else None
            ),
            'verification_status': u.verification_status,
            'verification_note': u.verification_note,
        })
    return Response(results)


@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def admin_review_verification(request, user_id):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    serializer = VerificationReviewSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data

    user.verification_status = 'APPROVED' if data['action'] == 'approve' else 'REJECTED'
    user.verification_note = data.get('note', '')
    user.save()

    return Response({
        'status': f'User {user.username} has been {user.verification_status.lower()}',
        'verification_status': user.verification_status,
    })


# ──── Phase 5: Direct Messaging ────


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def conversation_list(request):
    """Get all conversations for the current user."""
    user = request.user
    convos = Conversation.objects.filter(
        Q(user1=user) | Q(user2=user)
    ).order_by('-updated_at')
    serializer = ConversationSerializer(convos, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def start_conversation(request):
    """Start or get an existing conversation with another user."""
    other_user_id = request.data.get('user_id')
    if not other_user_id:
        return Response({'error': 'user_id is required'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        other_user = User.objects.get(id=other_user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    if other_user == request.user:
        return Response({'error': 'Cannot message yourself'}, status=status.HTTP_400_BAD_REQUEST)

    conv = Conversation.get_or_create_conversation(request.user, other_user)
    serializer = ConversationSerializer(conv, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def conversation_messages(request, conversation_id):
    """Get messages for a conversation. Marks them as read."""
    try:
        conv = Conversation.objects.get(id=conversation_id)
    except Conversation.DoesNotExist:
        return Response({'error': 'Conversation not found'}, status=status.HTTP_404_NOT_FOUND)

    # Ensure user is part of this conversation
    if request.user not in [conv.user1, conv.user2]:
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)

    # Mark unread messages as read
    DirectMessage.objects.filter(
        conversation=conv, is_read=False
    ).exclude(sender=request.user).update(is_read=True)

    messages = conv.messages.all().order_by('timestamp')
    serializer = DirectMessageSerializer(messages, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def send_dm(request, conversation_id):
    """Send a message in a conversation."""
    try:
        conv = Conversation.objects.get(id=conversation_id)
    except Conversation.DoesNotExist:
        return Response({'error': 'Conversation not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.user not in [conv.user1, conv.user2]:
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)

    content = request.data.get('content', '')
    image = request.data.get('image', None)

    if not content and not image:
        return Response({'error': 'Message content or image is required'}, status=status.HTTP_400_BAD_REQUEST)

    msg = DirectMessage.objects.create(
        conversation=conv, sender=request.user,
        content=content, image=image,
    )
    conv.updated_at = timezone.now()
    conv.save(update_fields=['updated_at'])

    serializer = DirectMessageSerializer(msg)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def toggle_reaction(request, message_id):
    """Toggle a reaction on a message."""
    try:
        msg = DirectMessage.objects.get(id=message_id)
    except DirectMessage.DoesNotExist:
        return Response({'error': 'Message not found'}, status=status.HTTP_404_NOT_FOUND)

    reaction_type = request.data.get('reaction_type')
    if reaction_type not in dict(MessageReaction.REACTION_CHOICES):
        return Response({'error': 'Invalid reaction type'}, status=status.HTTP_400_BAD_REQUEST)

    existing = MessageReaction.objects.filter(
        message=msg, user=request.user, reaction_type=reaction_type
    ).first()

    if existing:
        existing.delete()
        return Response({'status': 'removed'})
    else:
        MessageReaction.objects.create(
            message=msg, user=request.user, reaction_type=reaction_type
        )
        return Response({'status': 'added'})


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def unread_count(request):
    """Get total unread DM count for the current user."""
    count = DirectMessage.objects.filter(
        conversation__in=Conversation.objects.filter(
            Q(user1=request.user) | Q(user2=request.user)
        ),
        is_read=False,
    ).exclude(sender=request.user).count()
    return Response({'unread_count': count})


# ──── Phase 6: Reviews ────


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def profile_reviews(request, profile_id):
    """Get all reviews for a profile."""
    reviews = Review.objects.filter(profile_id=profile_id)
    serializer = ReviewSerializer(reviews, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_review(request, profile_id):
    """Create a review for a profile."""
    try:
        profile = Profile.objects.get(id=profile_id)
    except Profile.DoesNotExist:
        return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)

    if profile.user == request.user:
        return Response({'error': 'Cannot review yourself'}, status=status.HTTP_400_BAD_REQUEST)

    # Check if already reviewed
    if Review.objects.filter(reviewer=request.user, profile=profile).exists():
        return Response({'error': 'You already reviewed this profile'}, status=status.HTTP_400_BAD_REQUEST)

    rating = request.data.get('rating', 5)
    comment = request.data.get('comment', '')

    review = Review.objects.create(
        reviewer=request.user, profile=profile,
        rating=rating, comment=comment,
    )
    serializer = ReviewSerializer(review)
    return Response(serializer.data, status=status.HTTP_201_CREATED)
