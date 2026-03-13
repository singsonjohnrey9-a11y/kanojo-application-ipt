# 🏠 Ubecahan — House & Boarding House Rental Platform

> **Project Title:** Ubecahan — Rental Platform for Cebu  
> **Developer:** Singson, John Rey  
> **Course:** Bachelor of Science in Information Technology  
> **Date:** March 2026  
> **Repository:** [GitHub — singson-application](https://github.com/singsonjohnrey9-a11y/kanojo-application-ipt)

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Purpose — Why This Platform Exists](#2-purpose--why-this-platform-exists)
3. [Problem Statement & How It Solves Real Problems](#3-problem-statement--how-it-solves-real-problems)
4. [Technology Stack](#4-technology-stack)
5. [System Architecture — How It Works](#5-system-architecture--how-it-works)
6. [Database Schema (ERD)](#6-database-schema-erd)
7. [Features & Functionality](#7-features--functionality)
8. [API Endpoints](#8-api-endpoints)
9. [Frontend Components](#9-frontend-components)
10. [Real-Time Communication](#10-real-time-communication)
11. [Authentication & Security](#11-authentication--security)
12. [Legal Compliance](#12-legal-compliance)
13. [Deployment Architecture](#13-deployment-architecture)
14. [How to Run Locally](#14-how-to-run-locally)

---

## 1. Introduction

**Ubecahan** is a full-stack, map-centric web application designed specifically for the Cebu real estate market. It connects landlords with prospective tenants looking for houses, apartments, condominiums, boarding houses, and rooms for rent across Cebu City and neighboring areas.

The system features a **split-screen marketplace interface powered by Mapbox**, allowing users to visually discover properties. It operates on a **Django REST API** backend paired with a **React** frontend, utilizing **Supabase PostgreSQL** for robust data management. Core functionalities include JWT authentication, real-time Community Chat, Direct Messaging between landlords and tenants, strict ID verification via Tesseract.js OCR, and a verified review system.

---

## 2. Purpose — Why This Platform Exists

Finding affordable and reliable housing or boarding in Cebu can be a fragmented and frustrating process, often relying on word-of-mouth or unorganized social media groups. Ubecahan provides a centralized, geographic-based solution tailored to the Visayan lifestyle.

### Why Built for Cebu?
- **Map-Driven Discovery:** Visualizes available properties across Cebu City, Mandaue, Lapu-Lapu, Talisay, and Consolacion.
- **Student & Professional Focus:** Includes granular filtering for Boarding Houses and Rooms, which are critical for the large student and BPO populations in Cebu.
- **Landlord Verification:** Enforces ID and age verification (18+) to ensure safety and prevent scams.

---

## 3. Problem Statement & How It Solves Real Problems

| Problem in Current Market | How Ubecahan Solves It |
|---------------------------|------------------------|
| **Fragmented property listings** | Centralized marketplace with robust filtering by property type, price, and location. |
| **Lack of geographic context** | Interactive Mapbox integration showing exact coordinates of properties. |
| **Rampant rental scams** | Landlord verification via OCR, plus visual badges. |
| **Poor communication channels** | Built-in Direct Messaging (DM) keeps tenant-landlord communication organized. |
| **Lack of neighborhood context**| *Community Chat* allows users to ask locals about specific areas anonymously before renting. |

---

## 4. Technology Stack

### Backend
- **Python 3.12 & Django 6.0.2:** Core framework and ORM.
- **Django REST Framework (DRF):** API generation.
- **Django Channels & Daphne:** WebSocket support for real-time chat.
- **PostgreSQL (Supabase):** Primary relational database.
- **SimpleJWT:** Secure token-based authentication.

### Frontend
- **React (Vite):** Fast, modern UI development.
- **Mapbox GL JS:** Interactive maps and geographic plotting.
- **React Router DOM:** Client-side routing.
- **Axios:** API communication.
- **Lucide React:** Consistent iconography.
- **Tesseract.js:** Client-side Optical Character Recognition (OCR) for ID scanning.

---

## 5. System Architecture — How It Works

The system uses a decoupled client-server architecture:

1. **Client (React SPA):** Renders the UI and manages local state. It communicates with the backend via HTTPS for standard requests and WSS (WebSocket Secure) for real-time chat.
2. **Map Provider (Mapbox):** Renders the geographic tiles and map controls directly on the client.
3. **Backend (Django/Daphne):** Processes business logic, validates data, handles database queries, and routes WebSocket messages.
4. **Database (Supabase PostgreSQL):** Persistently stores all models, including geospatial coordinate data (`latitude`, `longitude`).

---

## 6. Database Schema (ERD)

The core domain revolves around Users, Listings, and Inquiries.

### `User` Model
- Extends Django's `AbstractUser`.
- `is_landlord` (Boolean): Defines if the user can post `Listings`.
- `verification_status` (PENDING, ON_REVIEW, APPROVED, REJECTED).
- `id_document`, `date_of_birth`, `phone_number`.

### `Listing` Model
- Represents a rental property.
- Fields: `title`, `description`, `property_type` (HOUSE, APARTMENT, CONDO, BOARDING_HOUSE, ROOM), `monthly_rent` (Decimal), `bedrooms`, `bathrooms`, `area_sqm`, `max_occupants`.
- Geospatial: `address`, `latitude`, `longitude`, `location` (Area/City).
- Relations: `FK -> User` (Landlord).

### `BookingRequest` Model
- A tenant's formal inquiry to rent a property.
- Fields: `message`, `move_in_date`, `occupants`, `status` (PENDING, ACCEPTED, DECLINED).
- Relations: `FK -> User` (Tenant), `FK -> Listing`.

### Communication Models
- **`Conversation` & `DirectMessage`**: Private 1-on-1 messaging between a tenant and a landlord.
- **`ChatRoom` & `Message`**: Public/Anonymous WebSockets for the Community Chat.

### Evaluation Models
- **`Review`**: Tenant reviews of a `Listing`. Tracks a 1-5 `rating` and `comment`.

---

## 7. Features & Functionality

1. **Split-Screen Marketplace:** Real-time synchronization between the Mapbox map and the scrollable list of property cards.
2. **Property Filtering:** Filter by property type, search by keyword, and view exact pricing.
3. **Direct Inquiries:** Tenants can send structured booking requests stating their desired move-in date and occupant count directly to landlords.
4. **Direct Messaging (Inbox):** After inquiring, tenants and landlords can negotiate terms smoothly in the built-in Inbox.
5. **Community Chat:** A real-time, WebSocket-powered anonymous chat room where prospective renters can ask locals about neighborhoods.
6. **Property Reviews:** Verified reviews tied directly to properties, calculating aggregate "average ratings" for listings.
7. **Role-Based Workflows:** Landlords have distinct capabilities from standard tenants, enforced at the API level.

---

## 8. API Endpoints

### Auth & Users
- `POST /api/auth/register/` - Register as tenant or landlord.
- `POST /api/auth/login/` - JWT login.
- `GET /api/users/me/` - Retrieve own profile.

### Listings
- `GET /api/listings/` - Fetch all listings (supports `?property_type=X&search=Y`).
- `GET /api/listings/{id}/` - Fetch detailed view.
- `POST /api/listings/` - Create a listing (Landlords only).

### Bookings (Inquiries)
- `GET /api/bookings/` - List user's sent inquiries or landlord's received inquiries.
- `POST /api/bookings/` - Submit an inquiry for a property.
- `POST /api/bookings/{id}/accept/` - Landlord accepts the inquiry.

### Messaging
- `GET /api/conversations/` - List all active DMs.
- `GET /api/conversations/{id}/messages/` - Load chat history.
- `POST /api/conversations/start/` - Initiate a DM with a landlord.

### Reviews
- `GET /api/listings/{id}/reviews/` - Fetch property reviews.
- `POST /api/listings/{id}/reviews/create/` - Submit a review.

---

## 9. Frontend Components

- **`Marketplace.jsx`**: The core view featuring Mapbox GL JS on the left and listing cards on the right. Handles marker clustering, popups, and fly-to animations.
- **`ListingDetail.jsx`**: A comprehensive property page with a mini-map, amenities grid, and a sticky sidebar for submitting inquiries.
- **`Navbar.jsx`**: Global navigation with dynamic links based on authentication state, featuring the Ubecahan brand logo (Building icon).
- **`Inbox.jsx`**: Real-time DM interface pulling conversation history and listening to new messages.
- **`AnonymousChat.jsx`**: The "Community Chat" feature, utilizing `locate_match` WebSockets to pair users trying to learn about Cebu.

---

## 10. Real-Time Communication

The platform leverages **Django Channels** and **Redis/InMemory Channel Layers** for instantaneous communication.

1. **WebSocket Endpoints**: Addressed at `ws://localhost:8000/ws/chat/` and `ws://localhost:8000/ws/dm/<uuid>/`.
2. **Action Payloads**: The frontend sends JSON objects with `{"action": "send_message", "message": "..."}`.
3. **Broadcasting**: The ASGI server broadcasts incoming messages to the designated room group, instantly reflecting updates in the React DOM without a page reload.

---

## 11. Authentication & Security

1. **JWT (JSON Web Tokens):** Short-lived access tokens (1 day) and long-lived refresh tokens (7 days).
2. **CORS Validation:** `CORS_ALLOWED_ORIGINS` restricts API access strictly to the production frontend domain.
3. **Environment Isolation:** Sensitive credentials (like `SECRET_KEY`, `DATABASE_URL`, `VITE_MAPBOX_TOKEN`) are strictly managed via `.env` files.
4. **Permissions:** DRF Permission classes (`IsAuthenticated`, custom Object-level permissions) ensure tenants cannot modify landlord listings, and only listing owners can accept/decline booking requests.

---

## 12. Legal Compliance

During the landlord registration process, users must accept the **Philippine Property & Safety Acts**:
1. **Republic Act No. 9653 (Rent Control Act)** - Regulates rent increases for residential units.
2. **Republic Act No. 9514 (Fire Code of the Philippines)** - Enforces fire safety standards.
3. **Civil Code of the Philippines (Lease Provisions)** - Governs the rights and obligations of lessors and lessees.
4. **Republic Act No. 10173 (Data Privacy Act)** - Mandates the protection of tenant personal data.
5. **Republic Act No. 7279 (UDHA)** - Urban development and housing guidelines.
6. **Anti-Discrimination Ordinances (Cebu City)** - Ensures fair housing regardless of gender, religion, or ethnicity.

Users digitally accept these terms, stored persistently in the `LegalAgreement` model.

---

## 13. Deployment Architecture

- **Backend (API):** Hosted on **Railway** via Dockerfile/Nixpacks. Configured with Daphne for ASGI protocol support.
- **Frontend (SPA):** Hosted on **Vercel**, optimized with Vite's build tooling.
- **Database:** Hosted on **Supabase** (PostgreSQL).
- **Static files:** Served efficiently by Django WhiteNoise.

---

## 14. How to Run Locally

### 1. Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create .env file with your local database or generic settings
echo "DEBUG=True" > .env

# Run migrations and seed the database with 20 sample properties
python manage.py migrate
python manage.py seed_profiles

# Start the ASGI development server
python manage.py runserver
```

### 2. Frontend Setup
```bash
cd frontend
npm install

# Create .env to configure the proxy and Mapbox token
echo "VITE_MAPBOX_TOKEN=your_mapbox_public_token_here" > .env

# Start the Vite development server
npm run dev
```

Visit `http://localhost:5173` to explore **Ubecahan**.
