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
        'username': 'diwata_cebu',
        'email': 'diwata@rentcebu.com',
        'first_name': 'Diwata',
        'last_name': 'Magbanua',
        'bio': 'Friendly companion for cafe dates, movie nights, and city tours! I know the best hidden spots in IT Park.',
        'hourly_rate': 600.00,
        'rank': 'BRONZE',
        'location': 'Cebu City, Philippines',
        'image': 'a1.jpeg',
    },
    {
        'username': 'ligaya_gamer',
        'email': 'ligaya@rentcebu.com',
        'first_name': 'Ligaya',
        'last_name': 'Dimaculangan',
        'bio': 'Gamer girl & anime enthusiast. Let\'s binge-watch or do a gaming marathon!',
        'hourly_rate': 800.00,
        'rank': 'SILVER',
        'location': 'Cebu City, Philippines',
        'image': 'a2.jpeg',
    },
    {
        'username': 'mayumi_elite',
        'email': 'mayumi@rentcebu.com',
        'first_name': 'Mayumi',
        'last_name': 'Lakandula',
        'bio': 'Premium companion for formal events, galas, and business dinners. Fluent in English and Japanese.',
        'hourly_rate': 2500.00,
        'rank': 'PLATINUM',
        'location': 'Cebu City, Philippines',
        'image': 'a3.jpeg',
    },
    {
        'username': 'bituin_nightlife',
        'email': 'bituin@rentcebu.com',
        'first_name': 'Bituin',
        'last_name': 'Macapagal',
        'bio': 'A certified night owl! Let me show you the vibrant nightlife and best clubs around the city!',
        'hourly_rate': 1000.00,
        'rank': 'GOLD',
        'location': 'Cebu City, Philippines',
        'image': 'a4.jpeg',
    },
    {
        'username': 'hiraya_creative',
        'email': 'hiraya@rentcebu.com',
        'first_name': 'Hiraya',
        'last_name': 'Magtanggol',
        'bio': 'Artist & photographer. I\'ll make your day Instagram-worthy around Ayala and SM Seaside!',
        'hourly_rate': 600.00,
        'rank': 'BRONZE',
        'location': 'Cebu City, Philippines',
        'image': 'a5.jpeg',
    },
    {
        'username': 'amihan_city',
        'email': 'amihan@rentcebu.com',
        'first_name': 'Amihan',
        'last_name': 'Soliman',
        'bio': 'Up for a high-end shopping spree or elegant fine dining at Nustar.',
        'hourly_rate': 1200.00,
        'rank': 'GOLD',
        'location': 'Cebu City, Philippines',
        'image': 'a18.jpeg',
    },
    {
        'username': 'tala_mountain',
        'email': 'tala@rentcebu.com',
        'first_name': 'Tala',
        'last_name': 'Balagtas',
        'bio': 'Let\'s drive up to Tops Lookout for a breathtaking city view and cozy dinner.',
        'hourly_rate': 2000.00,
        'rank': 'PLATINUM',
        'location': 'Cebu City, Philippines',
        'image': 'a19.jpeg',
    },
    {
        'username': 'malaya_wellness',
        'email': 'malaya@rentcebu.com',
        'first_name': 'Malaya',
        'last_name': 'Bonifacio',
        'bio': 'Yoga instructor & wellness advocate. Let\'s have a relaxing spa day or sunrise meditation at Tops!',
        'hourly_rate': 900.00,
        'rank': 'SILVER',
        'location': 'Cebu City, Philippines',
        'image': 'a21.png',
    },
    {
        'username': 'mutya_fashionista',
        'email': 'mutya@rentcebu.com',
        'first_name': 'Mutya',
        'last_name': 'Rizal',
        'bio': 'Personal stylist & fashion blogger. I\'ll help you pick the perfect outfit for any occasion!',
        'hourly_rate': 1100.00,
        'rank': 'GOLD',
        'location': 'Cebu City, Philippines',
        'image': 'a22.png',
    },
    {
        'username': 'sampaguita_bookworm',
        'email': 'sampaguita@rentcebu.com',
        'first_name': 'Sampaguita',
        'last_name': 'Del Pilar',
        'bio': 'Bookworm & tea lover. Let\'s visit cozy bookshops and have deep meaningful conversations.',
        'hourly_rate': 550.00,
        'rank': 'BRONZE',
        'location': 'Cebu City, Philippines',
        'image': 'a25.jpg',
    },
    {
        'username': 'luningning_karaoke',
        'email': 'luningning@rentcebu.com',
        'first_name': 'Luningning',
        'last_name': 'Makapagal',
        'bio': 'Karaoke queen! Let\'s sing our hearts out at the best KTV bars in Cebu!',
        'hourly_rate': 600.00,
        'rank': 'BRONZE',
        'location': 'Cebu City, Philippines',
        'image': 'a26.jpg',
    },
    {
        'username': 'paraluman_art',
        'email': 'paraluman@rentcebu.com',
        'first_name': 'Paraluman',
        'last_name': 'Mabini',
        'bio': 'Painter and art gallery hopper. Let\'s explore Cebu\'s hidden art scene together!',
        'hourly_rate': 800.00,
        'rank': 'SILVER',
        'location': 'Cebu City, Philippines',
        'image': 'a27.jpg',
    },
    {
        'username': 'bulaklak_garden',
        'email': 'bulaklak@rentcebu.com',
        'first_name': 'Bulaklak',
        'last_name': 'Luna',
        'bio': 'Plant mom & garden lover. Let\'s visit Sirao Flower Garden and the beautiful farms of Busay!',
        'hourly_rate': 700.00,
        'rank': 'BRONZE',
        'location': 'Cebu City, Philippines',
        'image': '15.jpg',
    },

    # ────────────────────────────────────
    #  Mandaue City Area
    # ────────────────────────────────────
    {
        'username': 'bathala_adventurer',
        'email': 'bathala@rentcebu.com',
        'first_name': 'Bathala',
        'last_name': 'Tupas',
        'bio': 'Road trip buddy & foodie. I\'ll take you on the best food crawl in Visayas!',
        'hourly_rate': 1200.00,
        'rank': 'GOLD',
        'location': 'Mandaue City, Philippines',
        'image': 'a6.jpeg',
    },
    {
        'username': 'diwa_cafe',
        'email': 'diwa@rentcebu.com',
        'first_name': 'Diwa',
        'last_name': 'Silang',
        'bio': 'Loves quiet cafe hopping and deep conversations. Let\'s relax with good coffee!',
        'hourly_rate': 700.00,
        'rank': 'SILVER',
        'location': 'Mandaue City, Philippines',
        'image': 'a7.jpeg',
    },
    {
        'username': 'kidlat_music',
        'email': 'kidlat@rentcebu.com',
        'first_name': 'Kidlat',
        'last_name': 'Dagohoy',
        'bio': 'Local musician and acoustic guitarist. I can serenade you or take you to live gigs!',
        'hourly_rate': 900.00,
        'rank': 'SILVER',
        'location': 'Mandaue City, Philippines',
        'image': 'a8.jpeg',
    },
    {
        'username': 'liwanag_foodtrip',
        'email': 'liwanag@rentcebu.com',
        'first_name': 'Liwanag',
        'last_name': 'Katipunan',
        'bio': 'Local foodie expert. I know every hidden carinderia and street food gem in Mandaue!',
        'hourly_rate': 650.00,
        'rank': 'BRONZE',
        'location': 'Mandaue City, Philippines',
        'image': '16.jpg',
    },
    {
        'username': 'lakas_cosplay',
        'email': 'lakas@rentcebu.com',
        'first_name': 'Lakas',
        'last_name': 'Magdiwang',
        'bio': 'Cosplayer & pop culture enthusiast! Let\'s hit up cons, arcades, or do a themed photoshoot.',
        'hourly_rate': 1100.00,
        'rank': 'GOLD',
        'location': 'Mandaue City, Philippines',
        'image': 'A29.jpg',
    },

    # ────────────────────────────────────
    #  Lapu-Lapu City Area (Mactan)
    # ────────────────────────────────────
    {
        'username': 'datu_fitness',
        'email': 'datu@rentcebu.com',
        'first_name': 'Datu',
        'last_name': 'Lapulapu',
        'bio': 'Fitness coach & hiking guide. Let\'s do some water sports or hit the gym!',
        'hourly_rate': 850.00,
        'rank': 'SILVER',
        'location': 'Lapu-Lapu City, Philippines',
        'image': 'a9.jpg',
    },
    {
        'username': 'lakan_resort',
        'email': 'lakan@rentcebu.com',
        'first_name': 'JohnRey',
        'last_name': 'Singson',
        'bio': 'Your perfect Mactan Island guide! Let\'s go resort hopping or island hopping.',
        'hourly_rate': 1500.00,
        'rank': 'GOLD',
        'location': 'Lapu-Lapu City, Philippines',
        'image': 'a10.jpg',
    },
    {
        'username': 'sinag_scuba',
        'email': 'sinag@rentcebu.com',
        'first_name': 'Sinag',
        'last_name': 'Magalona',
        'bio': 'Certified divemaster! I can be your dive buddy exploring the beautiful corals of Mactan.',
        'hourly_rate': 1800.00,
        'rank': 'PLATINUM',
        'location': 'Lapu-Lapu City, Philippines',
        'image': 'a11.jpg',
    },
    {
        'username': 'haliya_island',
        'email': 'haliya@rentcebu.com',
        'first_name': 'Haliya',
        'last_name': 'Magsaysay',
        'bio': 'Island hopping expert! I\'ll guide you to secret beaches and the best snorkeling spots.',
        'hourly_rate': 1400.00,
        'rank': 'GOLD',
        'location': 'Lapu-Lapu City, Philippines',
        'image': 'a16.jpeg',
    },
    {
        'username': 'apolaki_premium',
        'email': 'apolaki@rentcebu.com',
        'first_name': 'Apolaki',
        'last_name': 'Magat',
        'bio': 'VIP companion for yacht parties, exclusive events, and luxury experiences around Mactan.',
        'hourly_rate': 3000.00,
        'rank': 'PLATINUM',
        'location': 'Lapu-Lapu City, Philippines',
        'image': 'a31.jpg',
    },

    # ────────────────────────────────────
    #  Talisay City Area (South)
    # ────────────────────────────────────
    {
        'username': 'makisig_food',
        'email': 'makisig@rentcebu.com',
        'first_name': 'Makisig',
        'last_name': 'Aguinaldo',
        'bio': 'Let\'s hunt for the legendary Talisay Lechon! Im a hardcore local foodie.',
        'hourly_rate': 550.00,
        'rank': 'BRONZE',
        'location': 'Talisay City, Philippines',
        'image': 'a12.jpg',
    },
    {
        'username': 'lakambini_history',
        'email': 'lakambini@rentcebu.com',
        'first_name': 'Lakambini',
        'last_name': 'Quezon',
        'bio': 'History buff and calm soul. Let me tell you stories about old Cebu while we stroll.',
        'hourly_rate': 750.00,
        'rank': 'SILVER',
        'location': 'Talisay City, Philippines',
        'image': 'a13.jpg',
    },
    {
        'username': 'dayang_sunset',
        'email': 'dayang@rentcebu.com',
        'first_name': 'Dayang',
        'last_name': 'Kalayaan',
        'bio': 'Sunset chaser! I know the most romantic sunset spots in SRP and along the coast.',
        'hourly_rate': 700.00,
        'rank': 'SILVER',
        'location': 'Talisay City, Philippines',
        'image': 'a17.jpeg',
    },

    # ────────────────────────────────────
    #  Consolacion Area (North)
    # ────────────────────────────────────
    {
        'username': 'bayani_nature',
        'email': 'bayani@rentcebu.com',
        'first_name': 'Bayani',
        'last_name': 'Tandang',
        'bio': 'Nature lover. I can take you on scenic drives up north for a breath of fresh air!',
        'hourly_rate': 800.00,
        'rank': 'SILVER',
        'location': 'Consolacion, Philippines',
        'image': 'a14.jpg',
    },
    {
        'username': 'hiyas_baker',
        'email': 'hiyas@rentcebu.com',
        'first_name': 'Hiyas',
        'last_name': 'Gabriela',
        'bio': 'A sweet tooth who knows all the best pastry shops in the north! Let\'s eat sweets!',
        'hourly_rate': 650.00,
        'rank': 'BRONZE',
        'location': 'Consolacion, Philippines',
        'image': 'a1.jpeg',
    },
    {
        'username': 'lawin_hiker',
        'email': 'lawin@rentcebu.com',
        'first_name': 'Lawin',
        'last_name': 'Maliksi',
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
        'username': 'dagat_beach',
        'email': 'dagat@rentcebu.com',
        'first_name': 'Dagat',
        'last_name': 'Magsalin',
        'bio': 'Beach lover and snorkeling enthusiast in Moalboal. Let\'s swim with the turtles!',
        'hourly_rate': 700.00,
        'rank': 'BRONZE',
        'location': 'Moalboal, Philippines',
        'image': 'a16.jpeg',
    },
    {
        'username': 'agila_oslob',
        'email': 'agila@rentcebu.com',
        'first_name': 'Agila',
        'last_name': 'Magdangal',
        'bio': 'Whale shark watching buddy. I\'ll make sure you have a safe and fun trip down south.',
        'hourly_rate': 900.00,
        'rank': 'SILVER',
        'location': 'Oslob, Philippines',
        'image': 'a17.jpeg',
    },
    {
        'username': 'alon_waterfall',
        'email': 'alon@rentcebu.com',
        'first_name': 'Alon',
        'last_name': 'Katigbak',
        'bio': 'Adventure seeker! Let\'s chase waterfalls in Kawasan, Badian and canyoneer through Alegria!',
        'hourly_rate': 1000.00,
        'rank': 'GOLD',
        'location': 'Badian, Philippines',
        'image': 'a7.jpeg',
    },
    {
        'username': 'hangin_explorer',
        'email': 'hangin@rentcebu.com',
        'first_name': 'Hangin',
        'last_name': 'Magbanua',
        'bio': 'Motorcycle explorer! I\'ll tour you around Toledo, Barili, and the scenic west coast of Cebu.',
        'hourly_rate': 800.00,
        'rank': 'SILVER',
        'location': 'Toledo, Philippines',
        'image': 'a6.jpeg',
    },
    {
        'username': 'habagat_heritage',
        'email': 'habagat@rentcebu.com',
        'first_name': 'Habagat',
        'last_name': 'Panganiban',
        'bio': 'Heritage tour guide. Visit Simala Shrine, Carcar Church, and the old houses of Argao with me!',
        'hourly_rate': 750.00,
        'rank': 'SILVER',
        'location': 'Carcar, Philippines',
        'image': 'a19.jpeg',
    },
    {
        'username': 'ulap_surfing',
        'email': 'ulap@rentcebu.com',
        'first_name': 'Ulap',
        'last_name': 'Masipag',
        'bio': 'Surfer and beach bum! Catch the waves with me or chill by the shore in Bantayan Island.',
        'hourly_rate': 950.00,
        'rank': 'SILVER',
        'location': 'Bantayan Island, Philippines',
        'image': '15.jpg',
    },
    {
        'username': 'sayaw_dance',
        'email': 'sayaw@rentcebu.com',
        'first_name': 'Sayaw',
        'last_name': 'Dalupan',
        'bio': 'Professional dancer & choreographer. Let me teach you some moves or hit the coolest dance clubs!',
        'hourly_rate': 850.00,
        'rank': 'SILVER',
        'location': 'Cebu City, Philippines',
        'image': '16.jpg',
    },
    {
        'username': 'ginto_gourmet',
        'email': 'ginto@rentcebu.com',
        'first_name': 'Ginto',
        'last_name': 'Dalisay',
        'bio': 'Fine dining connoisseur. I know the best restaurants and hidden culinary gems in Cebu.',
        'hourly_rate': 1500.00,
        'rank': 'GOLD',
        'location': 'Cebu City, Philippines',
        'image': 'A29.jpg',
    },
    {
        'username': 'bundok_motorbike',
        'email': 'bundok@rentcebu.com',
        'first_name': 'Bundok',
        'last_name': 'Magalang',
        'bio': 'Motorcycle tour guide! Let me take you on an epic road trip through the mountains of Cebu.',
        'hourly_rate': 900.00,
        'rank': 'SILVER',
        'location': 'Dalaguete, Philippines',
        'image': 'a27.jpg',
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

            # ALWAYS write image files (Docker containers lose files on every redeploy)
            if 'image' in data:
                img_path = os.path.join(SEED_IMG_DIR, data['image'])
                if os.path.exists(img_path):
                    try:
                        with open(img_path, 'rb') as f:
                            # Force overwrite: clear name so Django writes a fresh file
                            profile.image.name = ''
                            profile.image.save(
                                f"{user.username}_{data['image']}",
                                File(f),
                                save=True
                            )
                        self.stdout.write(f'  📷 Image saved for {user.username}')
                    except Exception as e:
                        self.stdout.write(self.style.WARNING(f'  ⚠ Image error for {user.username}: {e}'))
                else:
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
