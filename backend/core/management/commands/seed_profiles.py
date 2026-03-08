from django.core.management.base import BaseCommand
from django.core.files import File
from core.models import User, Profile
import os


# Image directory -- inside the backend Docker container
SEED_IMG_DIR = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'seed_images')


PROFILES = [
    # ----------------------------------------
    #  Cebu City Area (Central Hub)
    # ----------------------------------------
    {
        'username': 'sophia_cebu',
        'email': 'sophia@rentcebu.com',
        'first_name': 'Sophia',
        'last_name': 'Reyes',
        'bio': 'Friendly companion for cafe dates, movie nights, and city tours! I know the best hidden spots in IT Park.',
        'hourly_rate': 600.00,
        'rank': 'BRONZE',
        'location': 'Cebu City, Philippines',
        'image': '1.jpg',
    },
    {
        'username': 'emma_gamer',
        'email': 'emma@rentcebu.com',
        'first_name': 'Emma',
        'last_name': 'Cruz',
        'bio': 'Gamer girl and anime enthusiast. Let us binge-watch or do a gaming marathon together!',
        'hourly_rate': 800.00,
        'rank': 'SILVER',
        'location': 'Cebu City, Philippines',
        'image': '2.jpg',
    },
    {
        'username': 'olivia_elite',
        'email': 'olivia@rentcebu.com',
        'first_name': 'Olivia',
        'last_name': 'Santos',
        'bio': 'Premium companion for formal events, galas, and business dinners. Fluent in English and Japanese.',
        'hourly_rate': 2500.00,
        'rank': 'PLATINUM',
        'location': 'Cebu City, Philippines',
        'image': '3.jpg',
    },
    {
        'username': 'isabella_nightlife',
        'email': 'isabella@rentcebu.com',
        'first_name': 'Isabella',
        'last_name': 'Garcia',
        'bio': 'A certified night owl! Let me show you the vibrant nightlife and best clubs around the city!',
        'hourly_rate': 1000.00,
        'rank': 'GOLD',
        'location': 'Cebu City, Philippines',
        'image': '4.jpg',
    },
    {
        'username': 'mia_creative',
        'email': 'mia@rentcebu.com',
        'first_name': 'Mia',
        'last_name': 'Fernandez',
        'bio': 'Artist and photographer. I will make your day Instagram-worthy around Ayala and SM Seaside!',
        'hourly_rate': 600.00,
        'rank': 'BRONZE',
        'location': 'Cebu City, Philippines',
        'image': '5.jpg',
    },
    {
        'username': 'charlotte_city',
        'email': 'charlotte@rentcebu.com',
        'first_name': 'Charlotte',
        'last_name': 'Lim',
        'bio': 'Up for a high-end shopping spree or elegant fine dining at Nustar.',
        'hourly_rate': 1200.00,
        'rank': 'GOLD',
        'location': 'Cebu City, Philippines',
        'image': '6.jpg',
    },
    {
        'username': 'amelia_mountain',
        'email': 'amelia@rentcebu.com',
        'first_name': 'Amelia',
        'last_name': 'Torres',
        'bio': 'Let us drive up to Tops Lookout for a breathtaking city view and cozy dinner.',
        'hourly_rate': 2000.00,
        'rank': 'PLATINUM',
        'location': 'Cebu City, Philippines',
        'image': '7.jpg',
    },
    {
        'username': 'harper_wellness',
        'email': 'harper@rentcebu.com',
        'first_name': 'Harper',
        'last_name': 'Navarro',
        'bio': 'Yoga instructor and wellness advocate. Let us have a relaxing spa day or sunrise meditation at Tops!',
        'hourly_rate': 900.00,
        'rank': 'SILVER',
        'location': 'Cebu City, Philippines',
        'image': '8.jpg',
    },
    {
        'username': 'evelyn_fashion',
        'email': 'evelyn@rentcebu.com',
        'first_name': 'Evelyn',
        'last_name': 'Ramos',
        'bio': 'Personal stylist and fashion blogger. I will help you pick the perfect outfit for any occasion!',
        'hourly_rate': 1100.00,
        'rank': 'GOLD',
        'location': 'Cebu City, Philippines',
        'image': '9.jpg',
    },
    {
        'username': 'abigail_bookworm',
        'email': 'abigail@rentcebu.com',
        'first_name': 'Abigail',
        'last_name': 'Villanueva',
        'bio': 'Bookworm and tea lover. Let us visit cozy bookshops and have deep meaningful conversations.',
        'hourly_rate': 550.00,
        'rank': 'BRONZE',
        'location': 'Cebu City, Philippines',
        'image': '10.jpg',
    },
    {
        'username': 'emily_karaoke',
        'email': 'emily@rentcebu.com',
        'first_name': 'Emily',
        'last_name': 'Dela Cruz',
        'bio': 'Karaoke queen! Let us sing our hearts out at the best KTV bars in Cebu!',
        'hourly_rate': 600.00,
        'rank': 'BRONZE',
        'location': 'Cebu City, Philippines',
        'image': '11.jpg',
    },
    {
        'username': 'elizabeth_art',
        'email': 'elizabeth@rentcebu.com',
        'first_name': 'Elizabeth',
        'last_name': 'Bautista',
        'bio': 'Painter and art gallery hopper. Let us explore Cebu\'s hidden art scene together!',
        'hourly_rate': 800.00,
        'rank': 'SILVER',
        'location': 'Cebu City, Philippines',
        'image': '12.jpg',
    },
    {
        'username': 'sofia_garden',
        'email': 'sofia@rentcebu.com',
        'first_name': 'Sofia',
        'last_name': 'Mendoza',
        'bio': 'Plant mom and garden lover. Let us visit Sirao Flower Garden and the beautiful farms of Busay!',
        'hourly_rate': 700.00,
        'rank': 'BRONZE',
        'location': 'Cebu City, Philippines',
        'image': '13.jpg',
    },
    {
        'username': 'avery_dance',
        'email': 'avery@rentcebu.com',
        'first_name': 'Avery',
        'last_name': 'Aquino',
        'bio': 'Professional dancer and choreographer. Let me teach you some moves or hit the coolest dance clubs!',
        'hourly_rate': 850.00,
        'rank': 'SILVER',
        'location': 'Cebu City, Philippines',
        'image': '14.jpg',
    },
    {
        'username': 'ella_gourmet',
        'email': 'ella@rentcebu.com',
        'first_name': 'Ella',
        'last_name': 'Rivera',
        'bio': 'Fine dining connoisseur. I know the best restaurants and hidden culinary gems in Cebu.',
        'hourly_rate': 1500.00,
        'rank': 'GOLD',
        'location': 'Cebu City, Philippines',
        'image': '15.jpg',
    },

    # ----------------------------------------
    #  Mandaue City Area
    # ----------------------------------------
    {
        'username': 'scarlett_adventurer',
        'email': 'scarlett@rentcebu.com',
        'first_name': 'Scarlett',
        'last_name': 'Tan',
        'bio': 'Road trip buddy and foodie. I will take you on the best food crawl in Visayas!',
        'hourly_rate': 1200.00,
        'rank': 'GOLD',
        'location': 'Mandaue City, Philippines',
        'image': '16.jpg',
    },
    {
        'username': 'grace_cafe',
        'email': 'grace@rentcebu.com',
        'first_name': 'Grace',
        'last_name': 'Ong',
        'bio': 'Loves quiet cafe hopping and deep conversations. Let us relax with good coffee!',
        'hourly_rate': 700.00,
        'rank': 'SILVER',
        'location': 'Mandaue City, Philippines',
        'image': '17.jpg',
    },
    {
        'username': 'chloe_music',
        'email': 'chloe@rentcebu.com',
        'first_name': 'Chloe',
        'last_name': 'Sy',
        'bio': 'Local musician and acoustic guitarist. I can serenade you or take you to live gigs!',
        'hourly_rate': 900.00,
        'rank': 'SILVER',
        'location': 'Mandaue City, Philippines',
        'image': '18.jpg',
    },
    {
        'username': 'penelope_foodtrip',
        'email': 'penelope@rentcebu.com',
        'first_name': 'Penelope',
        'last_name': 'Chua',
        'bio': 'Local foodie expert. I know every hidden carinderia and street food gem in Mandaue!',
        'hourly_rate': 650.00,
        'rank': 'BRONZE',
        'location': 'Mandaue City, Philippines',
        'image': '19.jpg',
    },
    {
        'username': 'layla_cosplay',
        'email': 'layla@rentcebu.com',
        'first_name': 'Layla',
        'last_name': 'Gonzales',
        'bio': 'Cosplayer and pop culture enthusiast! Let us hit up cons, arcades, or do a themed photoshoot.',
        'hourly_rate': 1100.00,
        'rank': 'GOLD',
        'location': 'Mandaue City, Philippines',
        'image': '20.jpg',
    },

    # ----------------------------------------
    #  Lapu-Lapu City Area (Mactan)
    # ----------------------------------------
    {
        'username': 'riley_fitness',
        'email': 'riley@rentcebu.com',
        'first_name': 'Riley',
        'last_name': 'Santos',
        'bio': 'Fitness coach and hiking guide. Let us do some water sports or hit the gym!',
        'hourly_rate': 850.00,
        'rank': 'SILVER',
        'location': 'Lapu-Lapu City, Philippines',
        'image': '21.jpg',
    },
    {
        'username': 'zoey_resort',
        'email': 'zoey@rentcebu.com',
        'first_name': 'Zoey',
        'last_name': 'Reyes',
        'bio': 'Your perfect Mactan Island guide! Let us go resort hopping or island hopping.',
        'hourly_rate': 1500.00,
        'rank': 'GOLD',
        'location': 'Lapu-Lapu City, Philippines',
        'image': '22.jpg',
    },
    {
        'username': 'nora_scuba',
        'email': 'nora@rentcebu.com',
        'first_name': 'Nora',
        'last_name': 'Castillo',
        'bio': 'Certified divemaster! I can be your dive buddy exploring the beautiful corals of Mactan.',
        'hourly_rate': 1800.00,
        'rank': 'PLATINUM',
        'location': 'Lapu-Lapu City, Philippines',
        'image': '23.jpg',
    },
    {
        'username': 'lily_island',
        'email': 'lily@rentcebu.com',
        'first_name': 'Lily',
        'last_name': 'Pascual',
        'bio': 'Island hopping expert! I will guide you to secret beaches and the best snorkeling spots.',
        'hourly_rate': 1400.00,
        'rank': 'GOLD',
        'location': 'Lapu-Lapu City, Philippines',
        'image': '24.jpg',
    },
    {
        'username': 'hannah_premium',
        'email': 'hannah@rentcebu.com',
        'first_name': 'Hannah',
        'last_name': 'Vergara',
        'bio': 'VIP companion for yacht parties, exclusive events, and luxury experiences around Mactan.',
        'hourly_rate': 3000.00,
        'rank': 'PLATINUM',
        'location': 'Lapu-Lapu City, Philippines',
        'image': '25.jpg',
    },

    # ----------------------------------------
    #  Talisay City Area (South)
    # ----------------------------------------
    {
        'username': 'addison_food',
        'email': 'addison@rentcebu.com',
        'first_name': 'Addison',
        'last_name': 'Lopez',
        'bio': 'Let us hunt for the legendary Talisay Lechon! I am a hardcore local foodie.',
        'hourly_rate': 550.00,
        'rank': 'BRONZE',
        'location': 'Talisay City, Philippines',
        'image': '26.jpg',
    },
    {
        'username': 'eleanor_history',
        'email': 'eleanor@rentcebu.com',
        'first_name': 'Eleanor',
        'last_name': 'Diaz',
        'bio': 'History buff and calm soul. Let me tell you stories about old Cebu while we stroll.',
        'hourly_rate': 750.00,
        'rank': 'SILVER',
        'location': 'Talisay City, Philippines',
        'image': '27.jpg',
    },
    {
        'username': 'stella_sunset',
        'email': 'stella@rentcebu.com',
        'first_name': 'Stella',
        'last_name': 'Morales',
        'bio': 'Sunset chaser! I know the most romantic sunset spots in SRP and along the coast.',
        'hourly_rate': 700.00,
        'rank': 'SILVER',
        'location': 'Talisay City, Philippines',
        'image': '29.jpg',
    },

    # ----------------------------------------
    #  Consolacion Area (North)
    # ----------------------------------------
    {
        'username': 'natalie_nature',
        'email': 'natalie@rentcebu.com',
        'first_name': 'Natalie',
        'last_name': 'Flores',
        'bio': 'Nature lover. I can take you on scenic drives up north for a breath of fresh air!',
        'hourly_rate': 800.00,
        'rank': 'SILVER',
        'location': 'Consolacion, Philippines',
        'image': '30.jpg',
    },
    {
        'username': 'leah_baker',
        'email': 'leah@rentcebu.com',
        'first_name': 'Leah',
        'last_name': 'Santiago',
        'bio': 'A sweet tooth who knows all the best pastry shops in the north! Let us eat sweets!',
        'hourly_rate': 650.00,
        'rank': 'BRONZE',
        'location': 'Consolacion, Philippines',
        'image': '31.jpg',
    },
    {
        'username': 'savannah_hiker',
        'email': 'savannah@rentcebu.com',
        'first_name': 'Savannah',
        'last_name': 'Perez',
        'bio': 'Hiking and trekking companion. Let us conquer Mt. Manunggal and Camp Sawi!',
        'hourly_rate': 850.00,
        'rank': 'SILVER',
        'location': 'Consolacion, Philippines',
        'image': '32.jpg',
    },

    # ----------------------------------------
    #  Other Cebu Areas
    # ----------------------------------------
    {
        'username': 'aurora_beach',
        'email': 'aurora@rentcebu.com',
        'first_name': 'Aurora',
        'last_name': 'Aguilar',
        'bio': 'Beach lover and snorkeling enthusiast in Moalboal. Let us swim with the turtles!',
        'hourly_rate': 700.00,
        'rank': 'BRONZE',
        'location': 'Moalboal, Philippines',
        'image': '1.jpg',
    },
    {
        'username': 'claire_oslob',
        'email': 'claire@rentcebu.com',
        'first_name': 'Claire',
        'last_name': 'Padilla',
        'bio': 'Whale shark watching buddy. I will make sure you have a safe and fun trip down south.',
        'hourly_rate': 900.00,
        'rank': 'SILVER',
        'location': 'Oslob, Philippines',
        'image': '2.jpg',
    },
    {
        'username': 'hazel_waterfall',
        'email': 'hazel@rentcebu.com',
        'first_name': 'Hazel',
        'last_name': 'Velasco',
        'bio': 'Adventure seeker! Let us chase waterfalls in Kawasan, Badian and canyoneer through Alegria!',
        'hourly_rate': 1000.00,
        'rank': 'GOLD',
        'location': 'Badian, Philippines',
        'image': '3.jpg',
    },
    {
        'username': 'violet_explorer',
        'email': 'violet@rentcebu.com',
        'first_name': 'Violet',
        'last_name': 'Enriquez',
        'bio': 'Motorcycle explorer! I will tour you around Toledo, Barili, and the scenic west coast of Cebu.',
        'hourly_rate': 800.00,
        'rank': 'SILVER',
        'location': 'Toledo, Philippines',
        'image': '4.jpg',
    },
    {
        'username': 'aurora_heritage',
        'email': 'aurora.h@rentcebu.com',
        'first_name': 'Ruby',
        'last_name': 'Domingo',
        'bio': 'Heritage tour guide. Visit Simala Shrine, Carcar Church, and the old houses of Argao with me!',
        'hourly_rate': 750.00,
        'rank': 'SILVER',
        'location': 'Carcar, Philippines',
        'image': '5.jpg',
    },
    {
        'username': 'ivy_surfing',
        'email': 'ivy@rentcebu.com',
        'first_name': 'Ivy',
        'last_name': 'Marcos',
        'bio': 'Surfer and beach lover! Catch the waves with me or chill by the shore in Bantayan Island.',
        'hourly_rate': 950.00,
        'rank': 'SILVER',
        'location': 'Bantayan Island, Philippines',
        'image': '6.jpg',
    },
    {
        'username': 'luna_motorbike',
        'email': 'luna@rentcebu.com',
        'first_name': 'Luna',
        'last_name': 'Salazar',
        'bio': 'Motorcycle tour guide! Let me take you on an epic road trip through the mountains of Cebu.',
        'hourly_rate': 900.00,
        'rank': 'SILVER',
        'location': 'Dalaguete, Philippines',
        'image': '7.jpg',
    },

    # ----------------------------------------
    #  Additional Cast (using alternate images)
    # ----------------------------------------

    # -- Cebu City --
    {
        'username': 'alice_nightowl',
        'email': 'alice@rentcebu.com',
        'first_name': 'Alice',
        'last_name': 'Yap',
        'bio': 'Late night adventures are my specialty. Let us explore Cebu after dark with bar crawls and night markets!',
        'hourly_rate': 850.00,
        'rank': 'SILVER',
        'location': 'Cebu City, Philippines',
        'image': 'a1.jpeg',
    },
    {
        'username': 'sarah_traveler',
        'email': 'sarah@rentcebu.com',
        'first_name': 'Sarah',
        'last_name': 'Tan',
        'bio': 'Frequent traveler and tour planner. I will organize the perfect day trip for us!',
        'hourly_rate': 950.00,
        'rank': 'SILVER',
        'location': 'Cebu City, Philippines',
        'image': 'a2.jpeg',
    },
    {
        'username': 'rachel_vip',
        'email': 'rachel@rentcebu.com',
        'first_name': 'Rachel',
        'last_name': 'Lim',
        'bio': 'Elegant and sophisticated. Perfect companion for upscale events, corporate galas, and VIP gatherings.',
        'hourly_rate': 2800.00,
        'rank': 'PLATINUM',
        'location': 'Cebu City, Philippines',
        'image': 'a3.jpeg',
    },
    {
        'username': 'jessica_party',
        'email': 'jessica@rentcebu.com',
        'first_name': 'Jessica',
        'last_name': 'Uy',
        'bio': 'Life of the party! I know the best rooftop bars and exclusive spots around the city!',
        'hourly_rate': 1100.00,
        'rank': 'GOLD',
        'location': 'Cebu City, Philippines',
        'image': 'a4.jpeg',
    },
    {
        'username': 'maria_photo',
        'email': 'maria@rentcebu.com',
        'first_name': 'Maria',
        'last_name': 'Go',
        'bio': 'Street photographer with an eye for beauty. Let us capture stunning shots of Cebu together!',
        'hourly_rate': 650.00,
        'rank': 'BRONZE',
        'location': 'Cebu City, Philippines',
        'image': 'a5.jpeg',
    },
    {
        'username': 'victoria_spa',
        'email': 'victoria@rentcebu.com',
        'first_name': 'Victoria',
        'last_name': 'Cheng',
        'bio': 'Spa and wellness enthusiast. I know the most relaxing retreats and hot springs near the city.',
        'hourly_rate': 1000.00,
        'rank': 'GOLD',
        'location': 'Cebu City, Philippines',
        'image': 'a8.jpeg',
    },
    {
        'username': 'katherine_museum',
        'email': 'katherine@rentcebu.com',
        'first_name': 'Katherine',
        'last_name': 'Wu',
        'bio': 'Culture lover and museum hopper. Let us visit heritage sites and learn about Cebu history!',
        'hourly_rate': 600.00,
        'rank': 'BRONZE',
        'location': 'Cebu City, Philippines',
        'image': 'a21.png',
    },
    {
        'username': 'diana_concert',
        'email': 'diana@rentcebu.com',
        'first_name': 'Diana',
        'last_name': 'Co',
        'bio': 'Music festival lover and concert buddy. I will find us the best live shows in town!',
        'hourly_rate': 750.00,
        'rank': 'SILVER',
        'location': 'Cebu City, Philippines',
        'image': 'a22.png',
    },
    {
        'username': 'samantha_coffee',
        'email': 'samantha@rentcebu.com',
        'first_name': 'Samantha',
        'last_name': 'Lee',
        'bio': 'Certified coffee snob and brunch expert. I have mapped every specialty coffee shop in Cebu!',
        'hourly_rate': 550.00,
        'rank': 'BRONZE',
        'location': 'Cebu City, Philippines',
        'image': 'a25.jpg',
    },
    {
        'username': 'madison_sing',
        'email': 'madison@rentcebu.com',
        'first_name': 'Madison',
        'last_name': 'Ng',
        'bio': 'Vocal coach and karaoke champion. Whether it is KTV or open mic night, I am your girl!',
        'hourly_rate': 700.00,
        'rank': 'BRONZE',
        'location': 'Cebu City, Philippines',
        'image': 'a26.jpg',
    },
    {
        'username': 'nicole_sketch',
        'email': 'nicole@rentcebu.com',
        'first_name': 'Nicole',
        'last_name': 'Chan',
        'bio': 'Sketch artist and creative soul. I will draw your portrait while we explore the city!',
        'hourly_rate': 800.00,
        'rank': 'SILVER',
        'location': 'Cebu City, Philippines',
        'image': 'a27.jpg',
    },

    # -- Mandaue City --
    {
        'username': 'andrea_food',
        'email': 'andrea@rentcebu.com',
        'first_name': 'Andrea',
        'last_name': 'Dee',
        'bio': 'Food vlogger with 10k followers. Let me take you to the most viral restaurants in Mandaue!',
        'hourly_rate': 1200.00,
        'rank': 'GOLD',
        'location': 'Mandaue City, Philippines',
        'image': 'a6.jpeg',
    },
    {
        'username': 'michelle_quiet',
        'email': 'michelle@rentcebu.com',
        'first_name': 'Michelle',
        'last_name': 'Ong',
        'bio': 'Introverted but warm. Perfect for quiet walks, board game cafes, and meaningful one-on-one time.',
        'hourly_rate': 600.00,
        'rank': 'BRONZE',
        'location': 'Mandaue City, Philippines',
        'image': 'a7.jpeg',
    },
    {
        'username': 'kate_cosplay2',
        'email': 'kate@rentcebu.com',
        'first_name': 'Kate',
        'last_name': 'Dy',
        'bio': 'Anime cosplayer and manga collector. Let us hit the gaming arcades and geek out together!',
        'hourly_rate': 900.00,
        'rank': 'SILVER',
        'location': 'Mandaue City, Philippines',
        'image': 'A29.jpg',
    },

    # -- Lapu-Lapu City --
    {
        'username': 'jenny_dive',
        'email': 'jenny@rentcebu.com',
        'first_name': 'Jenny',
        'last_name': 'Reyes',
        'bio': 'PADI certified diver and underwater photographer. The reefs of Mactan are my second home!',
        'hourly_rate': 1600.00,
        'rank': 'PLATINUM',
        'location': 'Lapu-Lapu City, Philippines',
        'image': 'a9.jpg',
    },
    {
        'username': 'christine_resort',
        'email': 'christine@rentcebu.com',
        'first_name': 'Christine',
        'last_name': 'Santos',
        'bio': 'Resort reviewer and beach connoisseur. I know which resorts have the best pools and views!',
        'hourly_rate': 1300.00,
        'rank': 'GOLD',
        'location': 'Lapu-Lapu City, Philippines',
        'image': 'a10.jpg',
    },
    {
        'username': 'anna_snorkel',
        'email': 'anna@rentcebu.com',
        'first_name': 'Anna',
        'last_name': 'Cruz',
        'bio': 'Snorkeling guide and marine life enthusiast. Let us explore the colorful underwater world!',
        'hourly_rate': 1100.00,
        'rank': 'GOLD',
        'location': 'Lapu-Lapu City, Philippines',
        'image': 'a11.jpg',
    },
    {
        'username': 'patricia_luxury',
        'email': 'patricia@rentcebu.com',
        'first_name': 'Patricia',
        'last_name': 'Garcia',
        'bio': 'Luxury travel planner. Private yachts, sunset cruises, and exclusive island getaways are my thing.',
        'hourly_rate': 3500.00,
        'rank': 'PLATINUM',
        'location': 'Lapu-Lapu City, Philippines',
        'image': 'a31.jpg',
    },
    {
        'username': 'daphne_island',
        'email': 'daphne@rentcebu.com',
        'first_name': 'Daphne',
        'last_name': 'Vega',
        'bio': 'Island hopping pro! I will plan the perfect multi-island adventure around Mactan.',
        'hourly_rate': 1400.00,
        'rank': 'GOLD',
        'location': 'Lapu-Lapu City, Philippines',
        'image': 'a16.jpeg',
    },

    # -- Talisay City --
    {
        'username': 'karen_lechon',
        'email': 'karen@rentcebu.com',
        'first_name': 'Karen',
        'last_name': 'Tan',
        'bio': 'Lechon connoisseur and local food guide. I will take you to the best carinderia in Talisay!',
        'hourly_rate': 500.00,
        'rank': 'BRONZE',
        'location': 'Talisay City, Philippines',
        'image': 'a12.jpg',
    },
    {
        'username': 'monica_heritage',
        'email': 'monica@rentcebu.com',
        'first_name': 'Monica',
        'last_name': 'Diaz',
        'bio': 'Local historian and storyteller. I bring old Cebu to life with fascinating tales and tours.',
        'hourly_rate': 750.00,
        'rank': 'SILVER',
        'location': 'Talisay City, Philippines',
        'image': 'a13.jpg',
    },
    {
        'username': 'angela_coastal',
        'email': 'angela@rentcebu.com',
        'first_name': 'Angela',
        'last_name': 'Flores',
        'bio': 'Coastal road trip enthusiast. Let us drive along SRP at golden hour and find the best viewpoints!',
        'hourly_rate': 800.00,
        'rank': 'SILVER',
        'location': 'Talisay City, Philippines',
        'image': 'a17.jpeg',
    },

    # -- Consolacion --
    {
        'username': 'bianca_trail',
        'email': 'bianca@rentcebu.com',
        'first_name': 'Bianca',
        'last_name': 'Torres',
        'bio': 'Trail runner and nature photographer. The mountain trails up north are my playground!',
        'hourly_rate': 850.00,
        'rank': 'SILVER',
        'location': 'Consolacion, Philippines',
        'image': 'a14.jpg',
    },
    {
        'username': 'giselle_pastry',
        'email': 'giselle@rentcebu.com',
        'first_name': 'Giselle',
        'last_name': 'Lim',
        'bio': 'Pastry chef and dessert hunter. I know every hidden bakeshop and sweet spot in the north!',
        'hourly_rate': 600.00,
        'rank': 'BRONZE',
        'location': 'Consolacion, Philippines',
        'image': 'a18.jpeg',
    },

    # -- Other areas --
    {
        'username': 'jasmine_sunset',
        'email': 'jasmine@rentcebu.com',
        'first_name': 'Jasmine',
        'last_name': 'Pascual',
        'bio': 'Sunset photographer and coastal explorer. The west coast of Cebu has the most stunning views!',
        'hourly_rate': 700.00,
        'rank': 'BRONZE',
        'location': 'Toledo, Philippines',
        'image': 'a19.jpeg',
    },
    {
        'username': 'fiona_shrine',
        'email': 'fiona@rentcebu.com',
        'first_name': 'Fiona',
        'last_name': 'Santos',
        'bio': 'Spiritual guide and heritage enthusiast. Simala Shrine, old churches, and peaceful retreats await!',
        'hourly_rate': 650.00,
        'rank': 'BRONZE',
        'location': 'Carcar, Philippines',
        'image': 'a19.jpeg',
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
                        self.stdout.write(f'  [IMG] Image saved for {user.username}')
                    except Exception as e:
                        self.stdout.write(self.style.WARNING(f'  [WARN] Image error for {user.username}: {e}'))
                else:
                    self.stdout.write(self.style.WARNING(f'  [WARN] Image not found: {img_path}'))

            if user_created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(
                    f'  [OK] Created: {user.first_name} {user.last_name} ({data["location"]})'
                ))
            else:
                self.stdout.write(f'  [UPDATE] Updated: {user.username} ({data["location"]})')

        # Clean up old seed profiles that are no longer in the PROFILES list
        current_usernames = [p['username'] for p in PROFILES]
        # Only delete users with @rentcebu.com emails (seed accounts) that aren't in current list
        old_users = User.objects.filter(
            email__endswith='@rentcebu.com'
        ).exclude(username__in=current_usernames)
        if old_users.exists():
            count = old_users.count()
            old_users.delete()
            self.stdout.write(self.style.WARNING(f'\n[CLEANUP] Removed {count} old seed profiles'))

        self.stdout.write(self.style.SUCCESS(
            f'\n[DONE] {created_count} new profiles created. {len(PROFILES)} total profiles in database.'
        ))
