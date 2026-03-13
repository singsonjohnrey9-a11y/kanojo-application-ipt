from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    # is_landlord replaces is_rentable — distinguishes landlords from tenants
    is_landlord = models.BooleanField(default=False)

    # Verification & Safety
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
    phone_number = models.CharField(max_length=20, blank=True, default='')

    def __str__(self):
        return self.username

    @property
    def is_age_verified(self):
        """Check if user is 18 or older."""
        if not self.date_of_birth:
            return False
        from datetime import date
        today = date.today()
        age = today.year - self.date_of_birth.year - (
            (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
        )
        return age >= 18


# Philippine safety laws that users must agree to
PHILIPPINE_SAFETY_ACTS = [
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
        'code': 'RA9653',
        'title': 'Rent Control Act of 2009',
        'description': (
            'Republic Act No. 9653 protects residential tenants by regulating '
            'rental increases, security deposits, and eviction processes for '
            'residential units with monthly rent not exceeding a certain threshold. '
            'All landlords must comply with these provisions.'
        ),
    },
    {
        'code': 'RA9514',
        'title': 'Fire Code of the Philippines of 2008',
        'description': (
            'Republic Act No. 9514 mandates fire safety compliance for all '
            'residential and commercial properties. Landlords must ensure all '
            'listed properties meet fire safety standards and have valid fire '
            'safety inspection certificates.'
        ),
    },
    {
        'code': 'RA7279',
        'title': 'Urban Development and Housing Act of 1992',
        'description': (
            'Republic Act No. 7279 provides for a comprehensive and continuing '
            'urban development and housing program. It protects tenants from '
            'illegal demolitions and ensures access to affordable housing.'
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
        'code': 'RA386',
        'title': 'Civil Code of the Philippines — Lease Provisions',
        'description': (
            'Articles 1654-1688 of the Civil Code govern lease contracts in the '
            'Philippines. Both landlords and tenants must uphold their obligations '
            'under the lease agreement, including proper notice for termination '
            'and maintenance of the property.'
        ),
    },
]


class LegalAgreement(models.Model):
    """Tracks which safety/rental acts a user has agreed to."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='legal_agreements')
    act_code = models.CharField(max_length=20)
    act_title = models.CharField(max_length=255)
    accepted_at = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)

    class Meta:
        unique_together = ('user', 'act_code')
        ordering = ['accepted_at']

    def __str__(self):
        return f"{self.user.username} accepted {self.act_code}"


class Listing(models.Model):
    """A property listing — house, boarding house, apartment, condo, or room for rent."""
    PROPERTY_TYPE_CHOICES = (
        ('HOUSE', 'House'),
        ('BOARDING_HOUSE', 'Boarding House'),
        ('APARTMENT', 'Apartment'),
        ('CONDO', 'Condo'),
        ('ROOM', 'Room'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='listings')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    property_type = models.CharField(max_length=20, choices=PROPERTY_TYPE_CHOICES, default='HOUSE')
    monthly_rent = models.DecimalField(max_digits=10, decimal_places=2, default=5000.00)
    bedrooms = models.PositiveIntegerField(default=1)
    bathrooms = models.PositiveIntegerField(default=1)
    area_sqm = models.FloatField(default=0.0, blank=True)
    max_occupants = models.PositiveIntegerField(default=1)

    # Location
    address = models.TextField(default='Cebu City, Philippines')
    location = models.CharField(max_length=255, default='Cebu City')
    house_rules = models.TextField(blank=True, default='') # Added for restrictions (pets, curfew, etc)
    latitude = models.FloatField(default=10.3157)   # Cebu City default
    longitude = models.FloatField(default=123.8854)  # Cebu City default

    # Media
    image = models.ImageField(upload_to='listings/', blank=True, null=True)

    # Amenities (comma-separated or JSON)
    amenities = models.TextField(blank=True, default='')

    # Availability
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} — ₱{self.monthly_rent}/mo ({self.property_type})"


class BookingRequest(models.Model):
    """A rental inquiry / booking request from a tenant to a landlord."""
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('ACCEPTED', 'Accepted'),
        ('DECLINED', 'Declined'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    )

    tenant = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_bookings')
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='booking_requests')
    message = models.TextField(blank=True, default='')
    occupants = models.PositiveIntegerField(default=1)
    move_in_date = models.DateField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Booking from {self.tenant.username} for {self.listing.title} — {self.status}"


class ChatRoom(models.Model):
    user1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chatrooms_as_user1')
    user2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chatrooms_as_user2')
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Chat Room: {self.user1.username} & {self.user2.username}"


class Message(models.Model):
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"[{self.timestamp}] {self.sender.username}: {self.content[:20]}"


# ──── Direct Messaging ────


class Conversation(models.Model):
    """DM conversation between two users (landlord ↔ tenant)."""
    user1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='dm_conversations_as_user1')
    user2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='dm_conversations_as_user2')
    listing = models.ForeignKey('Listing', on_delete=models.SET_NULL, null=True, blank=True, related_name='conversations')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user1', 'user2')
        ordering = ['-updated_at']

    def __str__(self):
        return f"DM: {self.user1.username} & {self.user2.username}"

    @classmethod
    def get_or_create_conversation(cls, user_a, user_b, listing=None):
        """Always store with lower user_id as user1 for consistency."""
        u1, u2 = (user_a, user_b) if user_a.id < user_b.id else (user_b, user_a)
        conv, created = cls.objects.get_or_create(user1=u1, user2=u2, listing=listing)
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


# ──── Ratings & Reviews ────


class Review(models.Model):
    """Review left by a tenant for a listing."""
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews_given')
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='reviews')
    rating = models.PositiveIntegerField(default=5)  # 1-5 stars
    comment = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('reviewer', 'listing')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.reviewer.username} rated {self.listing.title} {self.rating} stars"

    def save(self, *args, **kwargs):
        if self.rating < 1:
            self.rating = 1
        elif self.rating > 5:
            self.rating = 5
        super().save(*args, **kwargs)
