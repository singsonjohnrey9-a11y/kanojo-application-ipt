from django.contrib import admin
from .models import User, Profile, RentRequest, ChatRoom, Message

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['username', 'email', 'is_rentable', 'is_active']
    list_filter = ['is_rentable', 'is_active']

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'rank', 'hourly_rate', 'location']
    list_filter = ['rank']

@admin.register(RentRequest)
class RentRequestAdmin(admin.ModelAdmin):
    list_display = ['client', 'profile', 'hours', 'status', 'total_cost', 'created_at']
    list_filter = ['status']

@admin.register(ChatRoom)
class ChatRoomAdmin(admin.ModelAdmin):
    list_display = ['user1', 'user2', 'is_active', 'created_at']

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['room', 'sender', 'timestamp']
