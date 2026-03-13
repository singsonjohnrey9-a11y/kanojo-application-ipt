from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    UserViewSet, ListingViewSet, BookingRequestViewSet,
    get_safety_acts, register_user, upload_id_document,
    verification_status,
    admin_pending_verifications, admin_review_verification,
    # DM
    conversation_list, start_conversation, conversation_messages,
    send_dm, toggle_reaction, unread_count,
    # Reviews
    listing_reviews, create_review,
)

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'listings', ListingViewSet)
router.register(r'bookings', BookingRequestViewSet, basename='bookingrequest')

urlpatterns = [
    # Auth
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Safety & Verification
    path('safety-acts/', get_safety_acts, name='safety_acts'),
    path('register/', register_user, name='register_user'),
    path('upload-id/', upload_id_document, name='upload_id'),
    path('verification-status/', verification_status, name='verification_status'),

    # Admin verification
    path('admin/verifications/', admin_pending_verifications, name='admin_verifications'),
    path('admin/verifications/<int:user_id>/review/', admin_review_verification, name='admin_review'),

    # Direct Messaging
    path('conversations/', conversation_list, name='conversation_list'),
    path('conversations/start/', start_conversation, name='start_conversation'),
    path('conversations/<int:conversation_id>/messages/', conversation_messages, name='conversation_messages'),
    path('conversations/<int:conversation_id>/send/', send_dm, name='send_dm'),
    path('messages/<int:message_id>/react/', toggle_reaction, name='toggle_reaction'),
    path('messages/unread/', unread_count, name='unread_count'),

    # Reviews
    path('listings/<int:listing_id>/reviews/', listing_reviews, name='listing_reviews'),
    path('listings/<int:listing_id>/reviews/create/', create_review, name='create_review'),

    # Router URLs
    path('', include(router.urls)),
]
