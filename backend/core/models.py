from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    # Custom users can be either regular clients or rentable profiles
    is_rentable = models.BooleanField(default=False)
    
    def __str__(self):
        return self.username

class Profile(models.Model):
    RANK_CHOICES = (
        ('BRONZE', 'Bronze'),
        ('SILVER', 'Silver'),
        ('GOLD', 'Gold'),
        ('PLATINUM', 'Platinum'),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(blank=True, null=True)
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2, default=500.00)
    rank = models.CharField(max_length=20, choices=RANK_CHOICES, default='BRONZE')
    location = models.CharField(max_length=255, default='Cebu City, Philippines')
    image = models.ImageField(upload_to='profiles/', blank=True, null=True)
    
    def __str__(self):
        return f"{self.user.username}'s Profile - {self.rank}"

class RentRequest(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('ACCEPTED', 'Accepted'),
        ('DECLINED', 'Declined'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    )
    
    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_requests')
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='received_requests')
    hours = models.PositiveIntegerField(default=1)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)
    scheduled_time = models.DateTimeField(blank=True, null=True)
    total_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    def save(self, *args, **kwargs):
        # Calculate total cost based on hours and profile's hourly rate
        if self.profile and self.hours:
            self.total_cost = self.profile.hourly_rate * self.hours
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Request from {self.client.username} to {self.profile.user.username} - {self.status}"

class ChatRoom(models.Model):
    user1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chatrooms_as_user1')
    user2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chatrooms_as_user2')
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"Anon Room: {self.user1.username} & {self.user2.username}"

class Message(models.Model):
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"[{self.timestamp}] {self.sender.username}: {self.content[:20]}"
