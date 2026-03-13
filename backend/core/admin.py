from django.contrib import admin
from .models import (
    User, Listing, BookingRequest, ChatRoom, Message,
    Conversation, DirectMessage, Review,
)


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['username', 'email', 'is_landlord', 'is_active', 'verification_status']
    list_filter = ['is_landlord', 'is_active', 'verification_status']
    search_fields = ['username', 'email', 'first_name', 'last_name']


@admin.register(Listing)
class ListingAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'property_type', 'monthly_rent', 'location', 'is_available', 'created_at']
    list_filter = ['property_type', 'is_available', 'location']
    search_fields = ['title', 'address', 'location']


@admin.register(BookingRequest)
class BookingRequestAdmin(admin.ModelAdmin):
    list_display = ['tenant', 'listing', 'status', 'occupants', 'move_in_date', 'created_at']
    list_filter = ['status']
    search_fields = ['tenant__username', 'listing__title']


@admin.register(ChatRoom)
class ChatRoomAdmin(admin.ModelAdmin):
    list_display = ['user1', 'user2', 'is_active', 'created_at']


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['room', 'sender', 'timestamp']


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ['user1', 'user2', 'created_at', 'updated_at']


@admin.register(DirectMessage)
class DirectMessageAdmin(admin.ModelAdmin):
    list_display = ['conversation', 'sender', 'timestamp', 'is_read']
    list_filter = ['is_read']


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['reviewer', 'listing', 'rating', 'created_at']
    list_filter = ['rating']
