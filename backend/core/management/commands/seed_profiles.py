from django.core.management.base import BaseCommand
from django.core.files import File
from core.models import User, Profile
import os


# Image directory — inside the backend Docker container
SEED_IMG_DIR = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'seed_images')


PROFILES = [
    # ────────────────────────────────────
    #  Cebu City Area (Central Hub)
    # ────────────────────────────────────
    {
        'username': 'maria_cebu',
        'email': 'maria@rentcebu.com',
        'first_name': 'Maria',
        'last_name': 'Santos',
        'bio': 'Friendly companion for cafe dates, movie nights, and city tours! I know the best hidden spots in IT Park.',
        'hourly_rate': 600.00,
        'rank': 'BRONZE',
        'location': 'Cebu City, Philippines',
        'image': 'a1.jpeg',
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
        'image': 'a2.jpeg',
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
        'image': 'a3.jpeg',
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
        'image': 'a4.jpeg',
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
        'image': 'a5.jpeg',
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
        'image': 'a18.jpeg',
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
        'image': 'a19.jpeg',
    },
    {
        'username': 'elena_wellness',
        'email': 'elena@rentcebu.com',
        'first_name': 'Elena',
        'last_name': 'Romero',
        'bio': 'Yoga instructor & wellness advocate. Let\'s have a relaxing spa day or sunrise meditation at Tops!',
        'hourly_rate': 900.00,
        'rank': 'SILVER',
        'location': 'Cebu City, Philippines',
        'image': 'a1.jpeg',
    },
    {
        'username': 'mika_fashionista',
        'email': 'mika@rentcebu.com',
        'first_name': 'Mika',
        'last_name': 'Uy',
        'bio': 'Personal stylist & fashion blogger. I\'ll help you pick the perfect outfit for any occasion!',
        'hourly_rate': 1100.00,
        'rank': 'GOLD',
        'location': 'Cebu City, Philippines',
        'image': 'a5.jpeg',
    },
    {
        'username': 'hana_bookworm',
        'email': 'hana@rentcebu.com',
        'first_name': 'Hana',
        'last_name': 'Ito',
        'bio': 'Bookworm & tea lover. Let\'s visit cozy bookshops and have deep meaningful conversations.',
        'hourly_rate': 550.00,
        'rank': 'BRONZE',
        'location': 'Cebu City, Philippines',
        'image': 'a3.jpeg',
    },

    # ────────────────────────────────────
    #  Mandaue City Area
    # ────────────────────────────────────
    {
        'username': 'ken_adventurer',
        'email': 'ken@rentcebu.com',
        'first_name': 'Ken',
        'last_name': 'Villanueva',
        'bio': 'Road trip buddy & foodie. I\'ll take you on the best food crawl in Visayas!',
        'hourly_rate': 1200.00,
        'rank': 'GOLD',
        'location': 'Mandaue City, Philippines',
        'image': 'a6.jpeg',
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
        'image': 'a7.jpeg',
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
        'image': 'a8.jpeg',
    },
    {
        'username': 'lena_foodtrip',
        'email': 'lena@rentcebu.com',
        'first_name': 'Lena',
        'last_name': 'Tan',
        'bio': 'Local foodie expert. I know every hidden carinderia and street food gem in Mandaue!',
        'hourly_rate': 650.00,
        'rank': 'BRONZE',
        'location': 'Mandaue City, Philippines',
        'image': 'a2.jpeg',
    },

    # ────────────────────────────────────
    #  Lapu-Lapu City Area (Mactan)
    # ────────────────────────────────────
    {
        'username': 'miguel_fitness',
        'email': 'miguel@rentcebu.com',
        'first_name': 'Miguel',
        'last_name': 'Torres',
        'bio': 'Fitness coach & hiking guide. Let\'s do some water sports or hit the gym!',
        'hourly_rate': 850.00,
        'rank': 'SILVER',
        'location': 'Lapu-Lapu City, Philippines',
        'image': 'a9.jpg',
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
        'image': 'a10.jpg',
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
        'image': 'a11.jpg',
    },
    {
        'username': 'aiko_island',
        'email': 'aiko@rentcebu.com',
        'first_name': 'Aiko',
        'last_name': 'Nakamura',
        'bio': 'Island hopping expert! I\'ll guide you to secret beaches and the best snorkeling spots.',
        'hourly_rate': 1400.00,
        'rank': 'GOLD',
        'location': 'Lapu-Lapu City, Philippines',
        'image': 'a16.jpeg',
    },

    # ────────────────────────────────────
    #  Talisay City Area (South)
    # ────────────────────────────────────
    {
        'username': 'roberto_food',
        'email': 'roberto@rentcebu.com',
        'first_name': 'Roberto',
        'last_name': 'Bautista',
        'bio': 'Let\'s hunt for the legendary Talisay Lechon! Im a hardcore local foodie.',
        'hourly_rate': 550.00,
        'rank': 'BRONZE',
        'location': 'Talisay City, Philippines',
        'image': 'a12.jpg',
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
        'image': 'a13.jpg',
    },
    {
        'username': 'nina_sunset',
        'email': 'nina@rentcebu.com',
        'first_name': 'Nina',
        'last_name': 'Aquino',
        'bio': 'Sunset chaser! I know the most romantic sunset spots in SRP and along the coast.',
        'hourly_rate': 700.00,
        'rank': 'SILVER',
        'location': 'Talisay City, Philippines',
        'image': 'a4.jpeg',
    },

    # ────────────────────────────────────
    #  Consolacion Area (North)
    # ────────────────────────────────────
    {
        'username': 'paulo_nature',
        'email': 'paulo@rentcebu.com',
        'first_name': 'Paulo',
        'last_name': 'Ramos',
        'bio': 'Nature lover. I can take you on scenic drives up north for a breath of fresh air!',
        'hourly_rate': 800.00,
        'rank': 'SILVER',
        'location': 'Consolacion, Philippines',
        'image': 'a14.jpg',
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
        'image': 'a1.jpeg',
    },
    {
        'username': 'riku_hiker',
        'email': 'riku@rentcebu.com',
        'first_name': 'Riku',
        'last_name': 'Suzuki',
        'bio': 'Hiking and trekking companion. Let\'s conquer Mt. Manunggal and Camp Sawi!',
        'hourly_rate': 850.00,
        'rank': 'SILVER',
        'location': 'Consolacion, Philippines',
        'image': 'a8.jpeg',
    },

    # ────────────────────────────────────
    #  Other Cebu Areas
    # ────────────────────────────────────
    {
        'username': 'yumi_beach',
        'email': 'yumi@rentcebu.com',
        'first_name': 'Yumi',
        'last_name': 'Kato',
        'bio': 'Beach lover and snorkeling enthusiast in Moalboal. Let\'s swim with the turtles!',
        'hourly_rate': 700.00,
        'rank': 'BRONZE',
        'location': 'Moalboal, Philippines',
        'image': 'a16.jpeg',
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
        'image': 'a17.jpeg',
    },
    {
        'username': 'jade_waterfall',
        'email': 'jade@rentcebu.com',
        'first_name': 'Jade',
        'last_name': 'Rivera',
        'bio': 'Adventure seeker! Let\'s chase waterfalls in Kawasan, Badian and canyoneer through Alegria!',
        'hourly_rate': 1000.00,
        'rank': 'GOLD',
        'location': 'Badian, Philippines',
        'image': 'a7.jpeg',
    },
    {
        'username': 'marco_explorer',
        'email': 'marco@rentcebu.com',
        'first_name': 'Marco',
        'last_name': 'Santos',
        'bio': 'Motorcycle explorer! I\'ll tour you around Toledo, Barili, and the scenic west coast of Cebu.',
        'hourly_rate': 800.00,
        'rank': 'SILVER',
        'location': 'Toledo, Philippines',
        'image': 'a6.jpeg',
    },
    {
        'username': 'luna_heritage',
        'email': 'luna@rentcebu.com',
        'first_name': 'Luna',
        'last_name': 'Fernandez',
        'bio': 'Heritage tour guide. Visit Simala Shrine, Carcar Church, and the old houses of Argao with me!',
        'hourly_rate': 750.00,
        'rank': 'SILVER',
        'location': 'Carcar, Philippines',
        'image': 'a19.jpeg',
    },

    # ────────────────────────────────────
    #  Additional Profiles (New Batch)
    # ────────────────────────────────────
    {
        'username': 'rei_surfing',
        'email': 'rei@rentcebu.com',
        'first_name': 'Rei',
        'last_name': 'Watanabe',
        'bio': 'Surfer and beach bum! Catch the waves with me in Baler or chill by the shore in Bantayan Island.',
        'hourly_rate': 950.00,
        'rank': 'SILVER',
        'location': 'Bantayan Island, Philippines',
        'image': '15.jpg',
    },
    {
        'username': 'angela_dance',
        'email': 'angela@rentcebu.com',
        'first_name': 'Angela',
        'last_name': 'De Leon',
        'bio': 'Professional dancer & choreographer. Let me teach you some moves or take you to the coolest dance clubs!',
        'hourly_rate': 850.00,
        'rank': 'SILVER',
        'location': 'Cebu City, Philippines',
        'image': '16.jpg',
    },
    {
        'username': 'kira_cosplay',
        'email': 'kira@rentcebu.com',
        'first_name': 'Kira',
        'last_name': 'Nakano',
        'bio': 'Cosplayer & pop culture enthusiast! Let\'s hit up cons, arcades, or do a themed photoshoot.',
        'hourly_rate': 1100.00,
        'rank': 'GOLD',
        'location': 'Mandaue City, Philippines',
        'image': 'A29.jpg',
    },
    {
        'username': 'tina_karaoke',
        'email': 'tina@rentcebu.com',
        'first_name': 'Tina',
        'last_name': 'Chua',
        'bio': 'Karaoke queen! Let\'s sing our hearts out at the best KTV bars in Cebu!',
        'hourly_rate': 600.00,
        'rank': 'BRONZE',
        'location': 'Cebu City, Philippines',
        'image': 'a21.png',
    },
    {
        'username': 'vanessa_art',
        'email': 'vanessa@rentcebu.com',
        'first_name': 'Vanessa',
        'last_name': 'Tan',
        'bio': 'Painter and art gallery hopper. Let\'s explore Cebu\'s hidden art scene together!',
        'hourly_rate': 800.00,
        'rank': 'SILVER',
        'location': 'Cebu City, Philippines',
        'image': 'a22.png',
    },
    {
        'username': 'daisy_garden',
        'email': 'daisy@rentcebu.com',
        'first_name': 'Daisy',
        'last_name': 'Flores',
        'bio': 'Plant mom & garden lover. Let\'s visit Sirao Flower Garden and the beautiful farms of Busay!',
        'hourly_rate': 700.00,
        'rank': 'BRONZE',
        'location': 'Cebu City, Philippines',
        'image': 'a25.jpg',
    },
    {
        'username': 'yuki_gourmet',
        'email': 'yuki@rentcebu.com',
        'first_name': 'Yuki',
        'last_name': 'Mori',
        'bio': 'Fine dining connoisseur. I know the best Japanese restaurants and hidden gems in Cebu.',
        'hourly_rate': 1500.00,
        'rank': 'GOLD',
        'location': 'Cebu City, Philippines',
        'image': 'a26.jpg',
    },
    {
        'username': 'gio_motorbike',
        'email': 'gio@rentcebu.com',
        'first_name': 'Gio',
        'last_name': 'Reyes',
        'bio': 'Motorcycle tour guide! Let me take you on an epic road trip through the mountains of Cebu.',
        'hourly_rate': 900.00,
        'rank': 'SILVER',
        'location': 'Dalaguete, Philippines',
        'image': 'a27.jpg',
    },
    {
        'username': 'sora_premium',
        'email': 'sora@rentcebu.com',
        'first_name': 'Sora',
        'last_name': 'Takahashi',
        'bio': 'VIP companion for yacht parties, exclusive events, and luxury experiences around Mactan.',
        'hourly_rate': 3000.00,
        'rank': 'PLATINUM',
        'location': 'Lapu-Lapu City, Philippines',
        'image': 'a31.jpg',
    },
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

            # Always re-attach images (Docker containers lose files on redeploy)
            if 'image' in data:
                img_path = os.path.join(SEED_IMG_DIR, data['image'])
                # Check if actual file exists on disk (not just DB reference)
                needs_image = not profile.image or not os.path.exists(profile.image.path) if profile.image else True
                if needs_image and os.path.exists(img_path):
                    # Clear old DB reference
                    if profile.image:
                        profile.image.delete(save=False)
                    with open(img_path, 'rb') as f:
                        profile.image.save(
                            f"{user.username}_{data['image']}",
                            File(f),
                            save=True
                        )
                    self.stdout.write(f'  📷 Image attached for {user.username}')
                elif not os.path.exists(img_path):
                    self.stdout.write(self.style.WARNING(f'  ⚠ Image not found: {img_path}'))

            if user_created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(
                    f'  ✅ Created: {user.first_name} {user.last_name} ({data["location"]})'
                ))
            else:
                self.stdout.write(f'  Updated: {user.username} ({data["location"]})')

        self.stdout.write(self.style.SUCCESS(
            f'\n🎉 Done! {created_count} new profiles created. {len(PROFILES)} total profiles in database.'
        ))
