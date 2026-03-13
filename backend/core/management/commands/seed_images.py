from django.core.management.base import BaseCommand
from core.models import Listing
from supabase import create_client, Client
import os
import requests
import tempfile
import random

class Command(BaseCommand):
    help = 'Seed Supabase storage with sample house images and attach to listings'

    def handle(self, *args, **options):
        supabase_url = os.environ.get("SUPABASE_URL")
        supabase_key = os.environ.get("SUPABASE_ANON_KEY")

        if not supabase_url or not supabase_key:
            self.stdout.write(self.style.ERROR("Supabase credentials not found in environment variables."))
            return

        supabase: Client = create_client(supabase_url, supabase_key)

        # 5 Sample Unsplash Image URLs for Real Estate/Rooms
        SAMPLE_IMAGES = [
            "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1502672260266-1c1de2d93688?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80"
        ]

        uploaded_urls = []
        bucket_name = "listings"

        self.stdout.write("Downloading images and uploading to Supabase Storage...")

        for idx, img_url in enumerate(SAMPLE_IMAGES):
            try:
                # 1. Download image
                response = requests.get(img_url)
                response.raise_for_status()
                
                # 2. Save locally to temp file
                filename = f"sample_house_{idx}.jpg"
                filepath = os.path.join(tempfile.gettempdir(), filename)
                with open(filepath, 'wb') as f:
                    f.write(response.content)

                # 3. Upload to Supabase Storage
                with open(filepath, 'rb') as f:
                    file_bytes = f.read()

                res = supabase.storage.from_(bucket_name).upload(
                    path=filename,
                    file=file_bytes,
                    file_options={"content-type": "image/jpeg"}
                )
                
                # 4. Get public URL
                public_url = supabase.storage.from_(bucket_name).get_public_url(filename)
                uploaded_urls.append(public_url)
                self.stdout.write(self.style.SUCCESS(f"Uploaded {filename} -> {public_url}"))
                
                # Cleanup
                os.remove(filepath)

            except Exception as e:
                # If file already exists, just get public url
                if "Duplicate" in str(e) or "already exists" in str(e):
                    public_url = supabase.storage.from_(bucket_name).get_public_url(f"sample_house_{idx}.jpg")
                    uploaded_urls.append(public_url)
                    self.stdout.write(f"File sample_house_{idx}.jpg already exists. Using URL.")
                else:
                    self.stdout.write(self.style.ERROR(f"Failed to upload {img_url}: {str(e)}"))

        if not uploaded_urls:
            self.stdout.write(self.style.ERROR("No images were successfully uploaded."))
            return

        # 5. Assign URLs randomly to all listings
        listings = Listing.objects.all()
        updated_count = 0
        for listing in listings:
            random_url = random.choice(uploaded_urls)
            # Django sets this as a generic CharField path or ImageField.
            # If it's an ImageField, setting it to a URL might require custom storage,
            # but since we are migrating to Supabase, we can just save the absolute URL string.
            listing.image = random_url
            listing.save()
            updated_count += 1
            
        self.stdout.write(self.style.SUCCESS(f"Successfully populated {updated_count} listings with Supabase Storage images!"))
