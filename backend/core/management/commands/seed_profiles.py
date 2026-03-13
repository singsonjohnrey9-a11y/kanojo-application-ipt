import random
from django.core.management.base import BaseCommand
from core.models import User, Listing


# Realistic Cebu City properties with coordinates
LISTINGS = [
    # ── Cebu City ──
    {
        'title': 'Modern Studio in IT Park',
        'description': 'Fully furnished studio unit near Cebu IT Park. Walking distance to restaurants, cafes, and BPO offices. Good for solo professionals.',
        'property_type': 'CONDO',
        'monthly_rent': 12000.00,
        'bedrooms': 1, 'bathrooms': 1, 'area_sqm': 24,
        'max_occupants': 2,
        'address': 'Salinas Drive, Cebu IT Park, Cebu City',
        'location': 'Cebu City',
        'latitude': 10.3308, 'longitude': 123.9053,
        'amenities': 'WiFi,Aircon,Kitchen,Parking,Security,Pool',
    },
    {
        'title': '2BR Apartment near Ayala Mall',
        'description': 'Spacious 2-bedroom apartment along Cebu Business Park. Ideal for small families or couples. Near Ayala Center Cebu.',
        'property_type': 'APARTMENT',
        'monthly_rent': 20000.00,
        'bedrooms': 2, 'bathrooms': 1, 'area_sqm': 55,
        'max_occupants': 4,
        'address': 'Cardinal Rosales Ave, Cebu Business Park, Cebu City',
        'location': 'Cebu City',
        'latitude': 10.3195, 'longitude': 123.9054,
        'amenities': 'WiFi,Aircon,Kitchen,Parking,Security,Elevator',
    },
    {
        'title': 'Budget Room near USC Main',
        'description': 'Affordable room for students near University of San Carlos Main Campus. Shared bathroom and kitchen.',
        'property_type': 'ROOM',
        'monthly_rent': 3500.00,
        'bedrooms': 1, 'bathrooms': 1, 'area_sqm': 12,
        'max_occupants': 1,
        'address': 'P. del Rosario St, Cebu City',
        'location': 'Cebu City',
        'latitude': 10.2985, 'longitude': 123.8952,
        'amenities': 'WiFi,Shared Kitchen,Laundry,Near School',
    },
    {
        'title': 'Boarding House at Mango Avenue',
        'description': 'Clean boarding house with multiple rooms. Near the nightlife district and transportation hubs. Monthly or daily rates.',
        'property_type': 'BOARDING_HOUSE',
        'monthly_rent': 5000.00,
        'bedrooms': 1, 'bathrooms': 1, 'area_sqm': 16,
        'max_occupants': 2,
        'address': 'Gen. Maxilom Ave (Mango Avenue), Cebu City',
        'location': 'Cebu City',
        'latitude': 10.3080, 'longitude': 123.8930,
        'amenities': 'WiFi,Shared Kitchen,Laundry,CCTV,Near Transport',
    },
    {
        'title': '3BR House in Banilad',
        'description': 'Standalone 3-bedroom house in a quiet Banilad subdivision. Gated community with 24/7 security. Perfect for families.',
        'property_type': 'HOUSE',
        'monthly_rent': 35000.00,
        'bedrooms': 3, 'bathrooms': 2, 'area_sqm': 120,
        'max_occupants': 6,
        'address': 'Banilad, Cebu City',
        'location': 'Cebu City',
        'latitude': 10.3350, 'longitude': 123.8940,
        'amenities': 'WiFi,Aircon,Kitchen,Parking,Garden,Security,Garage',
    },
    {
        'title': 'Cozy Boarding House near CIT-U',
        'description': 'Budget-friendly boarding near Cebu Institute of Technology. Female only. Curfew at 10PM.',
        'property_type': 'BOARDING_HOUSE',
        'monthly_rent': 3000.00,
        'bedrooms': 1, 'bathrooms': 1, 'area_sqm': 10,
        'max_occupants': 1,
        'address': 'N. Bacalso Ave, Cebu City',
        'location': 'Cebu City',
        'latitude': 10.2920, 'longitude': 123.8870,
        'amenities': 'WiFi,Shared Kitchen,CCTV,Near School,Laundry',
    },
    {
        'title': 'Penthouse Suite at Marco Polo',
        'description': 'Luxurious penthouse-level condo unit at Marco Polo Residences. Stunning city and sea views. Premium amenities included.',
        'property_type': 'CONDO',
        'monthly_rent': 65000.00,
        'bedrooms': 3, 'bathrooms': 2, 'area_sqm': 150,
        'max_occupants': 6,
        'address': 'Nivel Hills, Lahug, Cebu City',
        'location': 'Cebu City',
        'latitude': 10.3260, 'longitude': 123.8880,
        'amenities': 'WiFi,Aircon,Kitchen,Parking,Pool,Gym,Security,Elevator,Balcony,City View',
    },
    {
        'title': 'Studio near Colon Street',
        'description': 'Small studio apartment in downtown Cebu. Walking distance to Carbon Market and Colon Street. Ideal for those on a budget.',
        'property_type': 'APARTMENT',
        'monthly_rent': 6000.00,
        'bedrooms': 1, 'bathrooms': 1, 'area_sqm': 18,
        'max_occupants': 2,
        'address': 'Colon St, Downtown Cebu City',
        'location': 'Cebu City',
        'latitude': 10.2942, 'longitude': 123.8997,
        'amenities': 'WiFi,Aircon,Near Market,Near Transport',
    },

    # ── Mandaue City ──
    {
        'title': '1BR at Northgate Mandaue',
        'description': 'Affordable 1-bedroom unit near Pacific Mall and Insular Square. Quiet area with easy access to highways.',
        'property_type': 'APARTMENT',
        'monthly_rent': 10000.00,
        'bedrooms': 1, 'bathrooms': 1, 'area_sqm': 30,
        'max_occupants': 2,
        'address': 'A.S. Fortuna St, Mandaue City',
        'location': 'Mandaue City',
        'latitude': 10.3303, 'longitude': 123.9225,
        'amenities': 'WiFi,Aircon,Kitchen,Parking,Near Mall',
    },
    {
        'title': 'Boarding House near J Centre',
        'description': 'Spacious boarding house with common areas. Near J Centre Mall and BPO offices. Great for working professionals.',
        'property_type': 'BOARDING_HOUSE',
        'monthly_rent': 4500.00,
        'bedrooms': 1, 'bathrooms': 1, 'area_sqm': 14,
        'max_occupants': 1,
        'address': 'A.S. Fortuna St, Mandaue City',
        'location': 'Mandaue City',
        'latitude': 10.3337, 'longitude': 123.9270,
        'amenities': 'WiFi,Shared Kitchen,CCTV,Laundry,Near Transport',
    },
    {
        'title': '2BR Townhouse in Paknaan',
        'description': 'Two-story townhouse in a gated subdivision. Spacious living area and own parking. Near schools and public market.',
        'property_type': 'HOUSE',
        'monthly_rent': 18000.00,
        'bedrooms': 2, 'bathrooms': 2, 'area_sqm': 80,
        'max_occupants': 4,
        'address': 'Paknaan, Mandaue City',
        'location': 'Mandaue City',
        'latitude': 10.3420, 'longitude': 123.9310,
        'amenities': 'WiFi,Aircon,Kitchen,Parking,Garage,Security',
    },

    # ── Lapu-Lapu City (Mactan) ──
    {
        'title': 'Beachfront Condo at Mactan Newtown',
        'description': 'Premium beachfront condo at Mactan Newtown. Resort-style living with access to private beach, pools, and restaurants.',
        'property_type': 'CONDO',
        'monthly_rent': 30000.00,
        'bedrooms': 1, 'bathrooms': 1, 'area_sqm': 36,
        'max_occupants': 2,
        'address': 'Mactan Newtown, Lapu-Lapu City',
        'location': 'Lapu-Lapu City',
        'latitude': 10.2888, 'longitude': 123.9620,
        'amenities': 'WiFi,Aircon,Kitchen,Pool,Beach Access,Security,Gym,Elevator',
    },
    {
        'title': '3BR House near Airport',
        'description': 'Convenient 3-bedroom house near Mactan-Cebu International Airport. Perfect for frequent travelers or airport staff.',
        'property_type': 'HOUSE',
        'monthly_rent': 22000.00,
        'bedrooms': 3, 'bathrooms': 2, 'area_sqm': 100,
        'max_occupants': 6,
        'address': 'Pusok, Lapu-Lapu City',
        'location': 'Lapu-Lapu City',
        'latitude': 10.3070, 'longitude': 123.9520,
        'amenities': 'WiFi,Aircon,Kitchen,Parking,Garden,Security',
    },
    {
        'title': 'Budget Room near Gaisano Mactan',
        'description': 'Simple but clean room for rent near Gaisano Grand Mall Mactan. Shared bathroom. Utilities included.',
        'property_type': 'ROOM',
        'monthly_rent': 3000.00,
        'bedrooms': 1, 'bathrooms': 1, 'area_sqm': 10,
        'max_occupants': 1,
        'address': 'Pajo, Lapu-Lapu City',
        'location': 'Lapu-Lapu City',
        'latitude': 10.3120, 'longitude': 123.9480,
        'amenities': 'WiFi,Shared Kitchen,Near Mall,Utilities Included',
    },

    # ── Talisay City ──
    {
        'title': '2BR Apartment in Lawaan',
        'description': 'Well-maintained 2-bedroom apartment near SRP. Easy access to malls (SM Seaside, Talisay Public Market).',
        'property_type': 'APARTMENT',
        'monthly_rent': 12000.00,
        'bedrooms': 2, 'bathrooms': 1, 'area_sqm': 45,
        'max_occupants': 4,
        'address': 'Lawaan, Talisay City',
        'location': 'Talisay City',
        'latitude': 10.2450, 'longitude': 123.8490,
        'amenities': 'WiFi,Aircon,Kitchen,Parking,Near Mall',
    },
    {
        'title': 'Brand New House in Citadel Estates',
        'description': 'Brand new 4-bedroom house in a premium Talisay subdivision. Modern design with spacious rooms and garden.',
        'property_type': 'HOUSE',
        'monthly_rent': 45000.00,
        'bedrooms': 4, 'bathrooms': 3, 'area_sqm': 180,
        'max_occupants': 8,
        'address': 'Citadel Estates, Talisay City',
        'location': 'Talisay City',
        'latitude': 10.2510, 'longitude': 123.8390,
        'amenities': 'WiFi,Aircon,Kitchen,Parking,Garden,Security,Garage,Clubhouse,Pool',
    },
    {
        'title': 'Boarding House near Talisay Public Market',
        'description': 'No-frills boarding house along the main road. Perfect for students and workers. Near jeepney routes.',
        'property_type': 'BOARDING_HOUSE',
        'monthly_rent': 2500.00,
        'bedrooms': 1, 'bathrooms': 1, 'area_sqm': 10,
        'max_occupants': 1,
        'address': 'Tabunok, Talisay City',
        'location': 'Talisay City',
        'latitude': 10.2530, 'longitude': 123.8470,
        'amenities': 'WiFi,Shared Kitchen,Near Market,Near Transport',
    },

    # ── Consolacion ──
    {
        'title': '3BR House in Consolacion Heights',
        'description': 'Well-ventilated 3-bedroom house in a quiet subdivision. Mountain views and fresh air. Near public schools.',
        'property_type': 'HOUSE',
        'monthly_rent': 15000.00,
        'bedrooms': 3, 'bathrooms': 2, 'area_sqm': 100,
        'max_occupants': 5,
        'address': 'Consolacion Heights, Consolacion',
        'location': 'Consolacion',
        'latitude': 10.3720, 'longitude': 123.9140,
        'amenities': 'WiFi,Kitchen,Parking,Garden,Mountain View,Security',
    },
    {
        'title': 'Room for Rent near Gaisano Consolacion',
        'description': 'Affordable room in a residential area. Walking distance to Gaisano Grand Consolacion. Quiet neighborhood.',
        'property_type': 'ROOM',
        'monthly_rent': 3000.00,
        'bedrooms': 1, 'bathrooms': 1, 'area_sqm': 12,
        'max_occupants': 1,
        'address': 'Poblacion Oriental, Consolacion',
        'location': 'Consolacion',
        'latitude': 10.3680, 'longitude': 123.9190,
        'amenities': 'WiFi,Shared Kitchen,Near Mall,Laundry',
    },
]


class Command(BaseCommand):
    help = 'Seed the database with sample property listings for Ubecahan'

    def handle(self, *args, **options):
        # Create a landlord user for the seed data
        landlord, created = User.objects.get_or_create(
            username='admin_landlord',
            defaults={
                'email': 'admin@ubecahan.com',
                'first_name': 'Ubecahan',
                'last_name': 'Admin',
                'is_landlord': True,
                'is_staff': True,
                'is_superuser': True,
            }
        )
        if created:
            landlord.set_password('admin123')
            landlord.save()
            self.stdout.write(self.style.SUCCESS(
                f'Created admin landlord user: admin_landlord / admin123'
            ))

        sample_data = {
            "House Rules": [
                "No pets allowed. No smoking indoors. Quiet hours 10 PM to 6 AM.",
                "Pets allowed with deposit. No loud parties.",
                "Male only boarding. 10 PM curfew.",
                "Female only boarding. Visitors allowed until 9 PM only.",
                "No drinking of alcohol inside the premises. Keep common areas clean."
            ]
        }

        created_count = 0
        for data in LISTINGS:
            house_rules = random.choice(sample_data["House Rules"]) # Randomly select house rules
            listing, was_created = Listing.objects.update_or_create(
                title=data['title'],
                user=landlord,
                defaults={
                    'description': data['description'],
                    'property_type': data['property_type'],
                    'monthly_rent': data['monthly_rent'],
                    'bedrooms': data['bedrooms'],
                    'bathrooms': data['bathrooms'],
                    'area_sqm': data['area_sqm'],
                    'max_occupants': data['max_occupants'],
                    'address': data['address'],
                    'location': data['location'],
                    'latitude': data['latitude'],
                    'longitude': data['longitude'],
                    'amenities': data['amenities'],
                    'house_rules': house_rules, # Added house_rules
                    'is_available': True,
                }
            )
            if was_created:
                created_count += 1
                self.stdout.write(f'  Created: {listing.title}')
            else:
                self.stdout.write(f'  Updated: {listing.title}')

        self.stdout.write(self.style.SUCCESS(
            f'\nDone! Created {created_count} new listings, '
            f'{len(LISTINGS) - created_count} updated. '
            f'Total: {Listing.objects.count()} listings.'
        ))
