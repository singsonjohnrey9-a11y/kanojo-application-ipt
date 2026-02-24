from rest_framework import serializers
from .models import User, Profile, RentRequest, ChatRoom, Message

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'password', 'is_rentable']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            is_rentable=validated_data.get('is_rentable', False)
        )
        return user

class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Profile
        fields = ['id', 'user', 'bio', 'hourly_rate', 'rank', 'location', 'image']

class RentRequestSerializer(serializers.ModelSerializer):
    client = UserSerializer(read_only=True)
    profile_id = serializers.PrimaryKeyRelatedField(
        queryset=Profile.objects.all(), source='profile', write_only=True
    )
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = RentRequest
        fields = ['id', 'client', 'profile', 'profile_id', 'hours', 'status', 'created_at', 'scheduled_time', 'total_cost']
        read_only_fields = ['total_cost', 'status', 'created_at']

class ChatRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatRoom
        fields = '__all__'

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = '__all__'
