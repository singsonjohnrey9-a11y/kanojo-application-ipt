from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    # Custom users can be either regular clients or rentable profiles
    is_rentable = models.BooleanField(default=False)

    # Phase 2+3: Verification & Safety
    date_of_birth = models.DateField(blank=True, null=True)
    VERIFICATION_CHOICES = (
        ('UNVERIFIED', 'Unverified'),
        ('PENDING', 'Pending Review'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    )
    verification_status = models.CharField(
        max_length=20, choices=VERIFICATION_CHOICES, default='UNVERIFIED'
    )
    id_document = models.ImageField(upload_to='id_documents/', blank=True, null=True)
    id_document_back = models.ImageField(upload_to='id_documents/', blank=True, null=True)
    ocr_extracted_name = models.CharField(max_length=255, blank=True, default='')
    ocr_extracted_dob = models.CharField(max_length=100, blank=True, default='')
    ocr_confidence = models.FloatField(default=0.0)
    legal_agreements_accepted = models.BooleanField(default=False)
    legal_accepted_at = models.DateTimeField(blank=True, null=True)
    verification_note = models.TextField(blank=True, default='')

    def __str__(self):
        return self.username

    @property
    def is_age_verified(self):
        """Check if user is 20 or older."""
        if not self.date_of_birth:
            return False
        from datetime import date
        today = date.today()
        age = today.year - self.date_of_birth.year - (
            (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
        )
        return age >= 20


# Philippine safety laws that users must agree to
PHILIPPINE_SAFETY_ACTS = [
    {
        'code': 'RA9208',
        'title': 'Anti-Trafficking in Persons Act of 2003',
        'description': (
            'Republic Act No. 9208 criminalizes trafficking in persons, '
            'including recruitment, transportation, or harboring of persons '
            'by means of threat, force, or coercion for the purpose of exploitation. '
            'All users and companions must acknowledge they are engaging in '
            'legitimate, consensual companionship services only.'
        ),
    },
    {
        'code': 'RA10173',
        'title': 'Data Privacy Act of 2012',
        'description': (
            'Republic Act No. 10173 protects individual personal information. '
            'All ID documents, personal data, and user information are securely '
            'stored, encrypted, and only used for identity verification purposes. '
            'Your data is never shared with third parties.'
        ),
    },
    {
        'code': 'RA9262',
        'title': 'Anti-Violence Against Women and Children Act',
        'description': (
            'Republic Act No. 9262 protects women and children from violence, '
            'threats, stalking, and harassment. Any form of abuse, coercion, '
            'or intimidation toward companions will result in immediate account '
            'termination and legal action.'
        ),
    },
    {
        'code': 'RA7610',
        'title': 'Special Protection of Children Against Abuse',
        'description': (
            'Republic Act No. 7610 provides protection for children against abuse '
            'and exploitation. All users must be at least 20 years of age. '
            'Government-issued ID verification is required for all accounts.'
        ),
    },
    {
        'code': 'RA10175',
        'title': 'Cybercrime Prevention Act of 2012',
        'description': (
            'Republic Act No. 10175 penalizes cyberstalking, online harassment, '
            'identity theft, and other cybercrimes. All interactions on this '
            'platform are logged and any violations will be reported to authorities.'
        ),
    },
    {
        'code': 'RA9995',
        'title': 'Anti-Photo and Video Voyeurism Act of 2009',
        'description': (
            'Republic Act No. 9995 prohibits the unauthorized recording, '
            'reproduction, or sharing of intimate images or videos. '
            'Recording or photographing companions without explicit consent '
            'is strictly prohibited and will result in legal prosecution.'
        ),
    },
]


class LegalAgreement(models.Model):
    """Tracks which safety acts a user has agreed to."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='legal_agreements')
    act_code = models.CharField(max_length=20)  # e.g. 'RA9208'
    act_title = models.CharField(max_length=255)
    accepted_at = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)

    class Meta:
        unique_together = ('user', 'act_code')
        ordering = ['accepted_at']

    def __str__(self):
        return f"{self.user.username} accepted {self.act_code}"


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


# ──── Phase 5: Direct Messaging ────


class Conversation(models.Model):
    """DM conversation between two users."""
    user1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='dm_conversations_as_user1')
    user2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='dm_conversations_as_user2')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user1', 'user2')
        ordering = ['-updated_at']

    def __str__(self):
        return f"DM: {self.user1.username} & {self.user2.username}"

    @classmethod
    def get_or_create_conversation(cls, user_a, user_b):
        """Always store with lower user_id as user1 for consistency."""
        u1, u2 = (user_a, user_b) if user_a.id < user_b.id else (user_b, user_a)
        conv, created = cls.objects.get_or_create(user1=u1, user2=u2)
        return conv


class DirectMessage(models.Model):
    """A single message within a DM conversation."""
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_dms')
    content = models.TextField(blank=True, default='')
    image = models.ImageField(upload_to='dm_images/', blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"[{self.timestamp}] {self.sender.username}: {self.content[:30]}"


class MessageReaction(models.Model):
    """Reaction on a direct message."""
    REACTION_CHOICES = (
        ('thumbs_up', 'Thumbs Up'),
        ('heart', 'Heart'),
        ('laugh', 'Laugh'),
        ('fire', 'Fire'),
        ('sad', 'Sad'),
    )
    message = models.ForeignKey(DirectMessage, on_delete=models.CASCADE, related_name='reactions')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='dm_reactions')
    reaction_type = models.CharField(max_length=20, choices=REACTION_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('message', 'user', 'reaction_type')

    def __str__(self):
        return f"{self.user.username} reacted {self.reaction_type} on msg {self.message.id}"


# ──── Phase 6: Ratings & Reviews ────


class Review(models.Model):
    """Review left by a client for a profile after a rental."""
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews_given')
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='reviews')
    rating = models.PositiveIntegerField(default=5)  # 1-5 stars
    comment = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('reviewer', 'profile')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.reviewer.username} rated {self.profile.user.username} {self.rating} stars"

    def save(self, *args, **kwargs):
        if self.rating < 1:
            self.rating = 1
        elif self.rating > 5:
            self.rating = 5
        super().save(*args, **kwargs)

