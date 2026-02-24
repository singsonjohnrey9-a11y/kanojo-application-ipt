from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import User, Profile, RentRequest, ChatRoom, Message
from .serializers import UserSerializer, ProfileSerializer, RentRequestSerializer, ChatRoomSerializer, MessageSerializer

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
