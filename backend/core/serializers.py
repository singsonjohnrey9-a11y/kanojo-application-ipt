from rest_framework import serializers
from .models import (
    User, Listing, BookingRequest, ChatRoom, Message,
    LegalAgreement, PHILIPPINE_SAFETY_ACTS,
    Conversation, DirectMessage, MessageReaction, Review,
)


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'password', 'is_landlord', 'date_of_birth',
            'verification_status', 'legal_agreements_accepted',
            'phone_number',
        ]
        read_only_fields = ['verification_status', 'legal_agreements_accepted']

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserMiniSerializer(serializers.ModelSerializer):
    """Lightweight user serializer for DM/review contexts."""
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name']


class ListingSerializer(serializers.ModelSerializer):
    user = UserMiniSerializer(read_only=True)
    average_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()

    class Meta:
        model = Listing
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

    def get_average_rating(self, obj):
        reviews = obj.reviews.all()
        if not reviews:
            return 0
        return round(sum(r.rating for r in reviews) / len(reviews), 1)

    def get_review_count(self, obj):
        return obj.reviews.count()


class BookingRequestSerializer(serializers.ModelSerializer):
    tenant_info = UserMiniSerializer(source='tenant', read_only=True)
    listing_info = serializers.SerializerMethodField()

    class Meta:
        model = BookingRequest
        fields = '__all__'
        read_only_fields = ['created_at']

    def get_listing_info(self, obj):
        return {
            'id': obj.listing.id,
            'title': obj.listing.title,
            'image': obj.listing.image.url if obj.listing.image else None,
            'monthly_rent': obj.listing.monthly_rent,
            'property_type': obj.listing.property_type,
            'location': obj.listing.location,
            'landlord_id': obj.listing.user.id,
            'landlord_name': f"{obj.listing.user.first_name} {obj.listing.user.last_name}"
        }


class ChatRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatRoom
        fields = '__all__'


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = '__all__'


class LegalAgreementSerializer(serializers.ModelSerializer):
    class Meta:
        model = LegalAgreement
        fields = ['id', 'act_code', 'act_title', 'accepted_at']
        read_only_fields = ['accepted_at']


class LegalActSerializer(serializers.Serializer):
    code = serializers.CharField()
    title = serializers.CharField()
    description = serializers.CharField()


class RegistrationSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True)
    email = serializers.EmailField()
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    date_of_birth = serializers.DateField()
    is_landlord = serializers.BooleanField(default=False)
    accepted_acts = serializers.ListField(
        child=serializers.CharField(), min_length=6
    )

    def validate_date_of_birth(self, value):
        from datetime import date
        today = date.today()
        age = today.year - value.year - (
            (today.month, today.day) < (value.month, value.day)
        )
        if age < 18:
            raise serializers.ValidationError(
                'You must be at least 18 years old to register.'
            )
        return value

    def validate_accepted_acts(self, value):
        required_codes = {act['code'] for act in PHILIPPINE_SAFETY_ACTS}
        missing = required_codes - set(value)
        if missing:
            raise serializers.ValidationError(
                f'Missing: {", ".join(missing)}'
            )
        return value

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('This username is already taken.')
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('This email address is already registered.')
        return value


class IDUploadSerializer(serializers.Serializer):
    id_front = serializers.ImageField()
    id_back = serializers.ImageField(required=False)
    ocr_extracted_name = serializers.CharField(max_length=255, required=False, default='')
    ocr_extracted_dob = serializers.CharField(max_length=100, required=False, default='')
    ocr_confidence = serializers.FloatField(required=False, default=0.0)


class VerificationReviewSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=['approve', 'reject'])
    note = serializers.CharField(required=False, default='')


# ──── DM Serializers ────


class MessageReactionSerializer(serializers.ModelSerializer):
    user = UserMiniSerializer(read_only=True)

    class Meta:
        model = MessageReaction
        fields = ['id', 'user', 'reaction_type', 'created_at']
        read_only_fields = ['created_at']


class DirectMessageSerializer(serializers.ModelSerializer):
    sender = UserMiniSerializer(read_only=True)
    reactions = MessageReactionSerializer(many=True, read_only=True)

    class Meta:
        model = DirectMessage
        fields = [
            'id', 'conversation', 'sender', 'content', 'image',
            'timestamp', 'is_read', 'reactions',
        ]
        read_only_fields = ['timestamp', 'is_read']


class ConversationSerializer(serializers.ModelSerializer):
    user1 = UserMiniSerializer(read_only=True)
    user2 = UserMiniSerializer(read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    listing_info = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = [
            'id', 'user1', 'user2', 'listing_info', 'created_at', 'updated_at',
            'last_message', 'unread_count',
        ]

    def get_listing_info(self, obj):
        if obj.listing:
            return {
                'id': obj.listing.id,
                'title': obj.listing.title,
                'image': obj.listing.image.url if obj.listing.image else None,
                'price': str(obj.listing.monthly_rent),
                'property_type': obj.listing.property_type
            }
        return None

    def get_last_message(self, obj):
        msg = obj.messages.order_by('-timestamp').first()
        if msg:
            return {
                'content': msg.content[:100],
                'sender_id': msg.sender_id,
                'timestamp': msg.timestamp.isoformat(),
                'is_read': msg.is_read,
            }
        return None

    def get_unread_count(self, obj):
        request = self.context.get('request')
        if request and request.user:
            return obj.messages.filter(is_read=False).exclude(sender=request.user).count()
        return 0


# ──── Review Serializers ────


class ReviewSerializer(serializers.ModelSerializer):
    reviewer = UserMiniSerializer(read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'reviewer', 'listing', 'rating', 'comment', 'created_at']
        read_only_fields = ['created_at']

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError('Rating must be between 1 and 5.')
        return value
