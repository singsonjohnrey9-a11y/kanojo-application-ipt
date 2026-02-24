from django.core.management.base import BaseCommand
from django.core.files import File
from core.models import User, Profile
import os


PROFILES = [
    # Cebu City Area (Central Hub)
    {
        'username': 'maria_cebu',
        'email': 'maria@rentcebu.com',
        'first_name': 'Maria',
        'last_name': 'Santos',
        'bio': 'Friendly companion for cafe dates, movie nights, and city tours! I know the best hidden spots in IT Park.',
        'hourly_rate': 600.00,
        'rank': 'BRONZE',
        'location': 'Cebu City, Philippines',
        'image_path': '../frontend/src/assets/imgs/a1.jpeg',
    },
    {
        'username': 'sofia_gamer',
        'email': 'sofia@rentcebu.com',
        'first_name': 'Sofia',
        'last_name': 'Reyes',
        'bio': 'Gamer girl & anime enthusiast. Let\'s binge-watch or do a gaming marathon!',
        'hourly_rate': 800.00,
        'rank': 'SILVER',
        'location': 'Cebu City, Philippines',
        'image_path': '../frontend/src/assets/imgs/a2.jpeg',
    },
    {
        'username': 'jasmine_elite',
        'email': 'jasmine@rentcebu.com',
        'first_name': 'Jasmine',
        'last_name': 'Cruz',
        'bio': 'Premium companion for formal events, galas, and business dinners. Fluent in English and Japanese.',
        'hourly_rate': 2500.00,
        'rank': 'PLATINUM',
        'location': 'Cebu City, Philippines',
        'image_path': '../frontend/src/assets/imgs/a3.jpeg',
    },
    {
        'username': 'chloe_nightlife',
        'email': 'chloe@rentcebu.com',
        'first_name': 'Chloe',
        'last_name': 'Mendoza',
        'bio': 'A certified night owl! Let me show you the vibrant nightlife and best clubs around the city!',
        'hourly_rate': 1000.00,
        'rank': 'GOLD',
        'location': 'Cebu City, Philippines',
        'image_path': '../frontend/src/assets/imgs/a4.jpeg',
    },
    {
        'username': 'anna_creative',
        'email': 'anna@rentcebu.com',
        'first_name': 'Anna',
        'last_name': 'Lim',
        'bio': 'Artist & photographer. I\'ll make your day Instagram-worthy around Ayala and SM Seaside!',
        'hourly_rate': 600.00,
        'rank': 'BRONZE',
        'location': 'Cebu City, Philippines',
        'image_path': '../frontend/src/assets/imgs/a5.jpeg',
    },

    # Mandaue City Area
    {
        'username': 'ken_adventurer',
        'email': 'ken@rentcebu.com',
        'first_name': 'Ken',
        'last_name': 'Villanueva',
        'bio': 'Road trip buddy & foodie. I\'ll take you on the best food crawl in Visayas!',
        'hourly_rate': 1200.00,
        'rank': 'GOLD',
        'location': 'Mandaue City, Philippines',
        'image_path': '../frontend/src/assets/imgs/a6.jpeg',
    },
    {
        'username': 'isabella_cafe',
        'email': 'isabella@rentcebu.com',
        'first_name': 'Isabella',
        'last_name': 'Garcia',
        'bio': 'Loves quiet cafe hopping and deep conversations. Let\'s relax with good coffee!',
        'hourly_rate': 700.00,
        'rank': 'SILVER',
        'location': 'Mandaue City, Philippines',
        'image_path': '../frontend/src/assets/imgs/a7.jpeg',
    },
    {
        'username': 'diego_music',
        'email': 'diego@rentcebu.com',
        'first_name': 'Diego',
        'last_name': 'Alvarez',
        'bio': 'Local musician and acoustic guitarist. I can serenade you or take you to live gigs!',
        'hourly_rate': 900.00,
        'rank': 'SILVER',
        'location': 'Mandaue City, Philippines',
        'image_path': '../frontend/src/assets/imgs/a8.jpeg',
    },

    # Lapu-Lapu City Area (Mactan)
    {
        'username': 'miguel_fitness',
        'email': 'miguel@rentcebu.com',
        'first_name': 'Miguel',
        'last_name': 'Torres',
        'bio': 'Fitness coach & hiking guide. Let\'s do some water sports or hit the gym!',
        'hourly_rate': 850.00,
        'rank': 'SILVER',
        'location': 'Lapu-Lapu City, Philippines',
        'image_path': '../frontend/src/assets/imgs/a9.jpg',
    },
    {
        'username': 'leah_resort',
        'email': 'leah@rentcebu.com',
        'first_name': 'JohnRey',
        'last_name': 'Singson',
        'bio': 'Your perfect Mactan Island guide! Let\'s go resort hopping or island hopping.',
        'hourly_rate': 1500.00,
        'rank': 'GOLD',
        'location': 'Lapu-Lapu City, Philippines',
        'image_path': '../frontend/src/assets/imgs/a10.jpg',
    },
    {
        'username': 'bianca_scuba',
        'email': 'bianca@rentcebu.com',
        'first_name': 'Bianca',
        'last_name': 'Dela Cruz',
        'bio': 'Certified divemaster! I can be your dive buddy exploring the beautiful corals of Mactan.',
        'hourly_rate': 1800.00,
        'rank': 'PLATINUM',
        'location': 'Lapu-Lapu City, Philippines',
        'image_path': '../frontend/src/assets/imgs/a11.jpg',
    },

    # Talisay City Area (South)
    {
        'username': 'roberto_food',
        'email': 'roberto@rentcebu.com',
        'first_name': 'Roberto',
        'last_name': 'Bautista',
        'bio': 'Let\'s hunt for the legendary Talisay Lechon! Im a hardcore local foodie.',
        'hourly_rate': 550.00,
        'rank': 'BRONZE',
        'location': 'Talisay City, Philippines',
        'image_path': '../frontend/src/assets/imgs/a12.jpg',
    },
    {
        'username': 'claire_history',
        'email': 'claire@rentcebu.com',
        'first_name': 'Claire',
        'last_name': 'Nunez',
        'bio': 'History buff and calm soul. Let me tell you stories about old Cebu while we stroll.',
        'hourly_rate': 750.00,
        'rank': 'SILVER',
        'location': 'Talisay City, Philippines',
        'image_path': '../frontend/src/assets/imgs/a13.jpg',
    },

    # Consolacion Area (North)
    {
        'username': 'paulo_nature',
        'email': 'paulo@rentcebu.com',
        'first_name': 'Paulo',
        'last_name': 'Ramos',
        'bio': 'Nature lover. I can take you on scenic drives up north for a breath of fresh air!',
        'hourly_rate': 800.00,
        'rank': 'SILVER',
        'location': 'Consolacion, Philippines',
        'image_path': '../frontend/src/assets/imgs/a14.jpg',
    },
    {
        'username': 'maya_baker',
        'email': 'maya@rentcebu.com',
        'first_name': 'Maya',
        'last_name': 'Sy',
        'bio': 'A sweet tooth who knows all the best pastry shops in the north! Let\'s eat sweets!',
        'hourly_rate': 650.00,
        'rank': 'BRONZE',
        'location': 'Consolacion, Philippines',
        'image_path': '../frontend/src/assets/imgs/a1.jpeg',
    },
    
    # New Profiles
    {
        'username': 'yumi_beach',
        'email': 'yumi@rentcebu.com',
        'first_name': 'Yumi',
        'last_name': 'Kato',
        'bio': 'Beach lover and snorkeling enthusiast in Moalboal. Let\'s swim with the turtles!',
        'hourly_rate': 700.00,
        'rank': 'BRONZE',
        'location': 'Moalboal, Philippines',
        'image_path': '../frontend/src/assets/imgs/a16.jpeg',
    },
    {
        'username': 'kenji_oslob',
        'email': 'kenji@rentcebu.com',
        'first_name': 'Kenji',
        'last_name': 'Tanaka',
        'bio': 'Whale shark watching buddy. I\'ll make sure you have a safe and fun trip down south.',
        'hourly_rate': 900.00,
        'rank': 'SILVER',
        'location': 'Oslob, Philippines',
        'image_path': '../frontend/src/assets/imgs/a17.jpeg',
    },
    {
        'username': 'rin_city',
        'email': 'rin@rentcebu.com',
        'first_name': 'Rin',
        'last_name': 'Yamanaka',
        'bio': 'Up for a high-end shopping spree or elegant fine dining at Nustar.',
        'hourly_rate': 1200.00,
        'rank': 'GOLD',
        'location': 'Cebu City, Philippines',
        'image_path': '../frontend/src/assets/imgs/a18.jpeg',
    },
    {
        'username': 'sakura_mountain',
        'email': 'sakura@rentcebu.com',
        'first_name': 'Sakura',
        'last_name': 'Hasegawa',
        'bio': 'Let\'s drive up to Tops Lookout for a breathtaking city view and cozy dinner.',
        'hourly_rate': 2000.00,
        'rank': 'PLATINUM',
        'location': 'Cebu City, Philippines',
        'image_path': '../frontend/src/assets/imgs/a19.jpeg',
    }
]


class Command(BaseCommand):
    help = 'Seed the database with sample rentable profiles'

    def handle(self, *args, **options):
        created_count = 0
        for data in PROFILES:
            user, user_created = User.objects.get_or_create(
                username=data['username'],
                defaults={
                    'email': data['email'],
                    'first_name': data['first_name'],
                    'last_name': data['last_name'],
                    'is_rentable': True,
                }
            )
            if user_created:
                user.set_password('testpass123')
                user.save()

            # Always update the profile to ensure locations and bios are fresh
            profile, _ = Profile.objects.update_or_create(
                user=user,
                defaults={
                    'bio': data['bio'],
                    'hourly_rate': data['hourly_rate'],
                    'rank': data['rank'],
                    'location': data['location'],
                }
            )

            # Assign image if the file exists
            if 'image_path' in data:
                img_path = os.path.join(os.path.dirname(__file__), '../../..', data['image_path'])
                if os.path.exists(img_path):
                    with open(img_path, 'rb') as f:
                        file_name = os.path.basename(img_path)
                        # To prevent massive duplicate files on re-seed, clear old image
                        if profile.image:
                            profile.image.delete(save=False)
                        profile.image.save(f"{user.username}_{file_name}", File(f), save=True)
                        

            
            if user_created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'  Created profile: {user.first_name} {user.last_name} ({data["location"]})'))
            else:
                self.stdout.write(f'  Updated profile: {user.username} ({data["location"]})')

        self.stdout.write(self.style.SUCCESS(f'\nDone! {created_count} new profiles created. All profiles updated.'))
