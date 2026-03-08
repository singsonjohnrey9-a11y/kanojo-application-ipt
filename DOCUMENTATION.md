# 🎌 Kanojo Application — System Documentation

> **Project Title:** Kanojo (カノジョ) — Rental Companion Platform for Cebu  
> **Developer:** Singson, John Rey  
> **Course:**   Bachelor of Science in Information Technology
> **Date:** March 2026  
> **Repository:** [GitHub — singson-application](https://github.com/singsonjohnrey9-a11y/kanojo-application-ipt)

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Purpose — Why This Website Exists](#2-purpose--why-this-website-exists)
3. [Problem Statement & How It Solves Real Problems](#3-problem-statement--how-it-solves-real-problems)
4. [Technology Stack](#4-technology-stack)
5. [System Architecture — How It Works](#5-system-architecture--how-it-works)
6. [Database Schema (ERD)](#6-database-schema-erd)
7. [Features & Functionality](#7-features--functionality)
8. [API Endpoints & Functions Used](#8-api-endpoints--functions-used)
9. [Frontend Functions & Components](#9-frontend-functions--components)
10. [Real-Time Communication — WebSocket](#10-real-time-communication--websocket)
11. [Authentication & Security](#11-authentication--security)
12. [System Flowcharts](#12-system-flowcharts)
13. [Deployment Architecture](#13-deployment-architecture)
14. [How to Run Locally](#14-how-to-run-locally)
15. [Conclusion](#15-conclusion)

---

## 1. Introduction

**Kanojo** (Japanese: カノジョ, meaning "girlfriend") is a full-stack web application inspired by Japan's *Rental Girlfriend (Kanojo, Okarishimasu)* concept — reimagined for Cebu City, Philippines. The platform operates under the brand name **RentCebu** and allows users to browse, select, and book verified rental companions for social activities such as city tours, cafe dates, event pairings, and more.

The system is built with a modern decoupled architecture: a **Django REST API** backend serving data over HTTP and WebSocket, paired with a **React Single-Page Application (SPA)** frontend. It features JWT-based authentication, real-time anonymous chat, **direct messaging with reactions**, a tiered ranking system for companions, **Philippine legal compliance with 6 safety acts**, **ID verification via Tesseract.js OCR**, a **star-based review system**, and is powered by **Supabase PostgreSQL** in production.

This documentation serves as a comprehensive technical defense of the system's design, implementation, and deployment.

---

## 2. Purpose — Why This Website Exists

### The Concept
In Japan, the rental companion industry is a legitimate and regulated business where individuals can hire companions for social events, outings, or simply for company. This concept addresses real social needs — from combating loneliness to providing plus-ones for events.

### Why Cebu?
Cebu City is a major metropolitan hub in the Visayas region with a vibrant tourism and hospitality industry. The application localizes the Japanese concept for the Cebu market, featuring:

- **Area-based browsing** across 6+ Cebu locations (Cebu City, Mandaue, Lapu-Lapu, Talisay, Consolacion, and more)
- **Filipino cultural context** with Filipino-named profiles and local landmarks
- **Philippine Peso (₱) pricing** with hourly rate calculations

### Why It Was Built
| Reason | Explanation |
|--------|-------------|
| **Academic Requirement** | Demonstrates full-stack web development competency |
| **Real-World Application** | Models a production-ready service platform |
| **Technical Showcase** | Implements REST APIs, WebSockets, JWT auth, and cloud deployment |
| **Innovation** | Brings a proven international business model to a local context |

---

## 3. Problem Statement & How It Solves Real Problems

### Problems Addressed

| Problem | How Kanojo Solves It |
|---------|---------------------|
| **Social isolation in urban areas** | Provides safe, verified companions for social activities |
| **Difficulty finding event partners** | On-demand booking system with hourly scheduling |
| **Trust & safety concerns** | Tiered verification system (Bronze → Platinum ranks) |
| **Lack of local companion platforms** | First-of-its-kind platform built specifically for Cebu |
| **No anonymous communication option** | Real-time anonymous chat lets users connect privately before booking |
| **Complex booking processes** | Simple, intuitive UI with instant cost calculation |

### Who Benefits?
- **Clients (Users):** Can browse, filter, and book companions by location, rank, and specialty
- **Companions (Rentable Profiles):** Get a platform to offer their social services with transparent pricing
- **Tourism Industry:** Offers a unique local experience for visitors to Cebu

---

## 4. Technology Stack

### Backend Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Python** | 3.12 | Core programming language |
| **Django** | 6.0.2 | Web framework & ORM |
| **Django REST Framework** | 3.16.1 | RESTful API construction |
| **Django Channels** | 4.3.2 | WebSocket support for real-time chat |
| **Daphne** | 4.2.1 | ASGI server (HTTP + WebSocket) |
| **SimpleJWT** | 5.5.1 | JSON Web Token authentication |
| **DRF AuthToken** | built-in | Token authentication for registration flow |
| **django-cors-headers** | 4.9.0 | Cross-Origin Resource Sharing |
| **Pillow** | 12.1.1 | Image processing for profile photos & ID documents |
| **WhiteNoise** | 6.8.2 | Static file serving |
| **psycopg2-binary** | 2.9.10 | PostgreSQL database adapter |
| **python-dotenv** | latest | Environment variable management |
| **Gunicorn** | 23.0.0 | WSGI HTTP server (production fallback) |

### Frontend Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 19.2.0 | UI component library |
| **Vite** | 7.3.1 | Build tool & dev server |
| **React Router DOM** | 7.13.1 | Client-side routing (SPA) |
| **Axios** | 1.13.5 | HTTP client for API calls |
| **Lucide React** | 0.575.0 | Monochrome icon library (all emojis replaced) |
| **Tesseract.js** | latest | Client-side OCR for ID document scanning |
| **date-fns** | 4.1.0 | Date formatting utilities |

### Infrastructure & Deployment

| Technology | Purpose |
|-----------|---------|
| **Supabase** | Cloud PostgreSQL database (project: `gurosvjmmhzanailwtqe`, Singapore) |
| **Docker** | Containerization for both backend and frontend |
| **Nginx** | Static file serving for production frontend |
| **Render** | Cloud platform deployment (Web Service + Static Site) |
| **Railway** | Alternative cloud deployment platform |
| **PostgreSQL** | Production database (Supabase-hosted) |

---

## 5. System Architecture — How It Works

### High-Level Architecture Diagram

```mermaid
graph TB
    subgraph Client["🖥️ Client Browser"]
        React["React 19 SPA<br/>Vite Dev Server"]
    end

    subgraph Backend["⚙️ Django Backend"]
        Daphne["Daphne ASGI Server"]
        DRF["Django REST Framework<br/>API Views"]
        Channels["Django Channels<br/>WebSocket Consumer"]
        ORM["Django ORM"]
        Auth["JWT Authentication<br/>SimpleJWT"]
    end

    subgraph Database["🗄️ Database"]
        PG["PostgreSQL<br/>(Production)"]
        SQLite["SQLite<br/>(Development)"]
    end

    subgraph Storage["📁 File Storage"]
        Media["Media Files<br/>/media/profiles/"]
        Static["Static Files<br/>WhiteNoise"]
    end

    React -->|"HTTP REST API<br/>(Axios)"| Daphne
    React -->|"WebSocket<br/>(ws://)"| Daphne
    Daphne --> DRF
    Daphne --> Channels
    DRF --> Auth
    DRF --> ORM
    Channels -->|"In-Memory<br/>Channel Layer"| Channels
    ORM --> PG
    ORM --> SQLite
    DRF --> Media
    DRF --> Static
```

### Why This Architecture Works

1. **Decoupled Frontend & Backend:** The React SPA communicates with Django exclusively through REST APIs and WebSocket, allowing independent development, testing, and deployment of each layer.

2. **ASGI Server (Daphne):** Unlike traditional WSGI servers, Daphne handles both HTTP and WebSocket connections on a single port, enabling real-time features without additional infrastructure.

3. **SPA Routing:** React Router handles all client-side navigation. The frontend is served as static files with a catch-all rewrite rule (`/* → /index.html`), so refreshing any page still works.

4. **Proxy Pattern (Development):** Vite's dev server proxies `/api`, `/media`, and `/ws` requests to Django at `localhost:8000`, eliminating CORS issues during development.

---

## 6. Database Schema (ERD)

```mermaid
erDiagram
    USER {
        int id PK
        string username UK
        string email
        string first_name
        string last_name
        string password
        boolean is_rentable
        boolean is_active
        date date_of_birth
        string verification_status
        image id_document
        image id_document_back
        string ocr_extracted_name
        string ocr_extracted_dob
        float ocr_confidence
        boolean legal_agreements_accepted
        datetime legal_accepted_at
        string verification_note
    }

    PROFILE {
        int id PK
        int user_id FK
        text bio
        decimal hourly_rate
        string rank
        string location
        image image
    }

    RENT_REQUEST {
        int id PK
        int client_id FK
        int profile_id FK
        int hours
        string status
        datetime created_at
        datetime scheduled_time
        decimal total_cost
    }

    CHAT_ROOM {
        int id PK
        int user1_id FK
        int user2_id FK
        datetime created_at
        boolean is_active
    }

    MESSAGE {
        int id PK
        int room_id FK
        int sender_id FK
        text content
        datetime timestamp
    }

    LEGAL_AGREEMENT {
        int id PK
        int user_id FK
        string act_code
        string act_title
        datetime accepted_at
        string ip_address
    }

    CONVERSATION {
        int id PK
        int user1_id FK
        int user2_id FK
        datetime created_at
        datetime updated_at
    }

    DIRECT_MESSAGE {
        int id PK
        int conversation_id FK
        int sender_id FK
        text content
        image image
        datetime timestamp
        boolean is_read
    }

    MESSAGE_REACTION {
        int id PK
        int message_id FK
        int user_id FK
        string reaction_type
        datetime created_at
    }

    REVIEW {
        int id PK
        int reviewer_id FK
        int profile_id FK
        int rating
        text comment
        datetime created_at
    }

    USER ||--o| PROFILE : "has one"
    USER ||--o{ RENT_REQUEST : "sends (as client)"
    PROFILE ||--o{ RENT_REQUEST : "receives"
    USER ||--o{ CHAT_ROOM : "participates"
    CHAT_ROOM ||--o{ MESSAGE : "contains"
    USER ||--o{ MESSAGE : "sends"
    USER ||--o{ LEGAL_AGREEMENT : "accepts"
    USER ||--o{ CONVERSATION : "participates"
    CONVERSATION ||--o{ DIRECT_MESSAGE : "contains"
    USER ||--o{ DIRECT_MESSAGE : "sends"
    DIRECT_MESSAGE ||--o{ MESSAGE_REACTION : "receives"
    USER ||--o{ MESSAGE_REACTION : "creates"
    USER ||--o{ REVIEW : "writes"
    PROFILE ||--o{ REVIEW : "receives"
```

### Model Details

#### `User` (extends `AbstractUser`)
- Inherits Django's full authentication system (password hashing, sessions, permissions)
- Custom field `is_rentable` distinguishes clients from companions
- **Verification fields:** `date_of_birth`, `verification_status` (UNVERIFIED → PENDING → APPROVED / REJECTED), `id_document` (front/back), OCR data (`ocr_extracted_name`, `ocr_extracted_dob`, `ocr_confidence`)
- **Legal compliance:** `legal_agreements_accepted`, `legal_accepted_at`
- Used as `AUTH_USER_MODEL = 'core.User'`

#### `Profile`
- One-to-one relationship with User
- **Rank System:** `BRONZE` → `SILVER` → `GOLD` → `PLATINUM`
- Stores hourly rate in Philippine Peso (₱), location, bio, and profile image
- **Computed fields:** `average_rating` and `review_count` (via serializer)

#### `RentRequest`
- Links a client (User) to a companion (Profile)
- **Status Lifecycle:** `PENDING` → `ACCEPTED` / `DECLINED` → `COMPLETED` / `CANCELLED`
- Auto-calculates `total_cost = hourly_rate × hours` on save via overridden `save()` method

#### `ChatRoom` & `Message`
- Supports anonymous one-to-one conversations
- Messages are ordered by timestamp ascending
- Chat rooms track active/inactive state

#### `LegalAgreement`
- Records user consent to specific Philippine safety acts
- Stores `act_code`, `act_title`, `accepted_at`, and `ip_address` for legal audit

#### `Conversation` & `DirectMessage`
- Private one-to-one DM conversations between authenticated users
- `get_or_create_conversation()` ensures consistent user pair storage
- Messages support text content and image attachments with read tracking (`is_read`)

#### `MessageReaction`
- Emoji reactions on direct messages: `thumbs_up`, `heart`, `laugh`, `fire`, `sad`
- One reaction per type per user (toggle on/off)

#### `Review`
- Star ratings (1–5) with optional comment
- One review per reviewer per profile (enforced uniqueness)
- Users cannot review themselves

---

## 7. Features & Functionality

### 7.1 Home Page (Hero Section)
- Animated headline with brand tagline: *"Find Your Kanojo in Cebu"*
- Quick-access buttons to browse cast and start anonymous chat
- Live statistics strip (64+ cast members, 6 Cebu areas, 24/7 availability, 100% verified)
- Monochrome black/white/gray theme throughout

### 7.2 Profile Browsing & Filtering
- **4-column grid** (desktop) / **3-column grid** (mobile) displaying all 64 companions
- **Area-based navigation bar** — filter by: All Cebu, Cebu City, Mandaue City, Lapu-Lapu City, Talisay City, Consolacion
- Each card shows: profile photo (centered, cover fit), name, location badge, rank ribbon, and star rating
- **Skeleton loading states** for better UX during data fetch
- **Price display** uses ₱ peso sign (visible on individual profile only)
- **Average rating** and **review count** displayed per profile

### 7.3 Rent Request System (Booking)
- Select a companion → view detailed profile header
- **Hour selector** with increment/decrement buttons (1–24 hours)
- **Real-time cost calculator:** `Rate × Hours = Total` displayed in Philippine Peso
- Requires authentication — unauthenticated users are redirected to login
- On submission: sends POST to `/api/requests/`, shows success animation, auto-redirects to profiles page
- Companions can **accept** or **decline** requests through the API

### 7.4 Anonymous Chat (Real-Time WebSocket)
- **Three-state UI:** Idle → Searching → Connected
- Users click "Start Searching" → placed in an in-memory queue
- When two users are available, they are randomly matched into a private room
- Real-time message exchange via Django Channels WebSocket
- Options to find a new match or leave the conversation
- Partner disconnect notifications
- Chat bubbles styled by sender (me / them / system)

### 7.5 Authentication & Registration System
- **4-Step Registration Flow:**
  1. **Basic Info** — First name, last name, username, email, password (8+ chars)
  2. **Age Verification** — Date of birth with 20+ age requirement (RA 7610 compliance)
  3. **Safety Act Acknowledgment** — Must accept all 6 Philippine safety acts
  4. **ID Upload** — Photo capture/upload with Tesseract.js OCR scanning (optional, can skip)
- **Login:** JWT token-based authentication with password visibility toggle
- **Persistent sessions:** Tokens stored in `localStorage`
- Axios interceptor automatically attaches `Authorization: Bearer <token>` to all API requests
- 401 responses trigger automatic logout

### 7.6 Legal Compliance (Philippine Safety Acts)
All users must acknowledge 6 Philippine Republic Acts during registration:

| Act Code | Title |
|----------|-------|
| **RA 9208** | Anti-Trafficking in Persons Act |
| **RA 10173** | Data Privacy Act |
| **RA 9262** | Anti-Violence Against Women and Children Act |
| **RA 7610** | Special Protection of Children Against Abuse |
| **RA 10175** | Cybercrime Prevention Act |
| **RA 9995** | Anti-Photo and Video Voyeurism Act |

- Each acceptance is logged with timestamp and IP address in the `LegalAgreement` model
- Age verification enforces minimum 20 years old

### 7.7 ID Verification & Admin Review
- **Client-side OCR:** Tesseract.js scans uploaded ID documents, extracting text and confidence score
- **Admin Dashboard** (`/admin/verifications`): Administrators can:
  - View pending verification requests with user details and OCR data
  - Preview uploaded ID documents (front and back)
  - Approve or reject with optional notes
- **Verification Status Lifecycle:** `UNVERIFIED` → `PENDING` → `APPROVED` / `REJECTED`

### 7.8 Direct Messaging System
- **Inbox Page** (`/inbox`): Full-featured private messaging
  - Conversation sidebar with user avatars, last message preview, and timestamps
  - **Unread message badges** (red count indicators)
  - Chat thread with styled bubbles (black = sent, gray = received)
  - **Read receipts:** Single check (✓) for sent, double check (✓✓ green) for read
  - **Message reactions:** 👍 ❤️ 😄 🔥 😢 (toggle on/off per message)
  - Image attachment support
  - 3-second polling for new messages
- **Navbar badge:** Red unread count indicator (polls every 10 seconds)
- **Start conversations** from any profile page via `?user=<id>` URL parameter

### 7.9 Ratings & Reviews
- **Star ratings:** 1–5 scale per profile
- **One review per user per profile** (enforced server-side)
- **Self-review prevention:** Users cannot review their own profile
- **ProfileSerializer** returns computed `average_rating` and `review_count`
- Average ratings displayed on profile cards and detail pages

### 7.10 Responsive Navigation
- **Desktop:** Horizontal nav bar with Cast List, Chat, Messages links + auth controls
- **Mobile:** Hamburger menu with slide-in drawer overlay
- Glassmorphism effect with scroll-triggered background transition
- Active page highlighting
- **Messages badge** shows unread DM count

### 7.11 Admin Panel
- Full Django Admin interface at `/admin/`
- Manage Users, Profiles, Rent Requests, Chat Rooms, Messages, Conversations, DMs, Reviews
- Custom admin page for ID verification at `/admin/verifications`
- List filters for rank, status, and activity
- Built-in search and CRUD operations

---

## 8. API Endpoints & Functions Used

### REST API Endpoints

#### Core Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| `POST` | `/api/token/` | ❌ | Obtain JWT access + refresh tokens |
| `POST` | `/api/token/refresh/` | ❌ | Refresh an expired access token |
| `GET` | `/api/users/` | ✅ | List all users |
| `POST` | `/api/users/` | ❌ | Register a new user (legacy) |
| `GET` | `/api/profiles/` | ❌ | List all profiles (with `average_rating`, `review_count`) |
| `GET` | `/api/profiles/:id/` | ❌ | Get specific profile details |
| `POST` | `/api/profiles/` | ✅ | Create a companion profile |
| `GET` | `/api/requests/` | ✅ | List rent requests (filtered by role) |
| `POST` | `/api/requests/` | ✅ | Submit a new rent request |
| `POST` | `/api/requests/:id/accept/` | ✅ | Accept a rent request (companion only) |
| `POST` | `/api/requests/:id/decline/` | ✅ | Decline a rent request (companion only) |

#### Legal Compliance & Verification Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| `GET` | `/api/safety-acts/` | ❌ | List all 6 Philippine safety acts |
| `POST` | `/api/register/` | ❌ | Multi-step registration (age 20+, safety acts) |
| `POST` | `/api/upload-id/` | ✅ | Upload ID document with OCR data |
| `GET` | `/api/verification-status/` | ✅ | Check user's verification status |
| `GET` | `/api/admin/verifications/` | 🔒 | List pending verifications (admin only) |
| `POST` | `/api/admin/verifications/:id/review/` | 🔒 | Approve/reject verification (admin only) |

#### Direct Messaging Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| `GET` | `/api/conversations/` | ✅ | List all DM conversations (with `last_message`, `unread_count`) |
| `POST` | `/api/conversations/start/` | ✅ | Start or get existing conversation with a user |
| `GET` | `/api/conversations/:id/messages/` | ✅ | Get messages in a conversation (marks as read) |
| `POST` | `/api/conversations/:id/send/` | ✅ | Send a message (text + optional image) |
| `POST` | `/api/messages/:id/react/` | ✅ | Toggle a reaction on a message |
| `GET` | `/api/messages/unread/` | ✅ | Get total unread DM count |

#### Review Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| `GET` | `/api/profiles/:id/reviews/` | ❌ | List all reviews for a profile |
| `POST` | `/api/profiles/:id/reviews/create/` | ✅ | Submit a review (1-5 stars, one per user) |

### WebSocket Endpoint

| Protocol | Endpoint | Description |
|----------|----------|-------------|
| `ws://` | `/ws/chat/` | Anonymous chat — matchmaking & messaging |

### Key Backend Functions

| Function | File | Purpose |
|----------|------|---------|
| `UserViewSet` | `views.py` | CRUD operations for users |
| `ProfileViewSet` | `views.py` | CRUD for profiles with `average_rating` and `review_count` |
| `RentRequestViewSet` | `views.py` | Business logic for rent requests with role-based filtering |
| `register_user()` | `views.py` | Multi-step registration with age validation and safety act acceptance |
| `upload_id_document()` | `views.py` | ID upload with OCR data storage |
| `admin_review_verification()` | `views.py` | Admin approve/reject verification requests |
| `conversation_list()` | `views.py` | List DM conversations with last message and unread count |
| `send_dm()` | `views.py` | Send direct messages with image attachment support |
| `toggle_reaction()` | `views.py` | Toggle emoji reactions on messages |
| `create_review()` | `views.py` | Create star rating with duplicate and self-review prevention |
| `AnonymousChatConsumer` | `consumers.py` | WebSocket consumer for matchmaking and messaging |
| `Command.handle()` | `seed_profiles.py` | Management command to seed 64 sample profiles with images |

---

## 9. Frontend Functions & Components

### Pages

| Component | File | Description |
|-----------|------|-------------|
| `Home` | `App.jsx` | Landing page with hero section, CTA buttons, and stats strip |
| `ProfileList` | `ProfileList.jsx` | 4-column grid view of 64 companions with area filtering, star ratings, and skeleton loading |
| `RentRequest` | `RentRequest.jsx` | Booking page with profile detail, hour selector, and cost calculator |
| `AnonymousChat` | `AnonymousChat.jsx` | Three-state real-time chat (idle/searching/connected) |
| `Login` | `Login.jsx` | JWT login form with password toggle and Lucide icons |
| `Register` | `Register.jsx` | 4-step registration (basic info → age → safety acts → ID upload with OCR) |
| `Inbox` | `Inbox.jsx` | DM inbox with conversation sidebar, chat bubbles, reactions, read receipts |
| `AdminVerification` | `AdminVerification.jsx` | Admin dashboard for reviewing pending ID verifications |

### Components

| Component | File | Description |
|-----------|------|-------------|
| `Navbar` | `Navbar.jsx` | Responsive nav with Cast List, Chat, Messages links + unread DM badge |
| `AreaNav` | `App.jsx` | Horizontal area filter bar with 6 Cebu locations |

### Context & Services

| Module | File | Description |
|--------|------|-------------|
| `AuthContext` | `AuthContext.jsx` | React Context providing `user`, `loginUser()`, `registerUser()`, `logoutUser()` |
| `api` (Axios instance) | `api/config.js` | Configured Axios instance with base URL and request interceptors |
| `getWebSocketURL()` | `api/config.js` | Helper to construct WebSocket URLs for dev (proxy) and production (direct) |

### Key Frontend Functions

| Function | Location | Purpose |
|----------|----------|---------|
| `fixImageUrl()` | `ProfileList.jsx` | Normalizes relative image paths and forces HTTPS |
| `getInitials()` | `ProfileList.jsx` | Generates avatar initials from a name |
| `startSearch()` | `AnonymousChat.jsx` | Initiates WebSocket connection and matchmaking |
| `sendMessage()` | `AnonymousChat.jsx` | Sends chat message over WebSocket |
| `handleSubmit()` | `RentRequest.jsx` | Submits rent request via POST and handles success state |
| `loginUser()` | `AuthContext.jsx` | Authenticates user, stores JWT tokens, redirects to home |
| `logoutUser()` | `AuthContext.jsx` | Clears tokens from state and localStorage, redirects to login |
| `fetchConversations()` | `Inbox.jsx` | Loads DM conversations with unread counts |
| `handleSend()` | `Inbox.jsx` | Sends DM via FormData with optional image attachment |
| `handleReact()` | `Inbox.jsx` | Toggles emoji reactions on messages |
| `runOCR()` | `Register.jsx` | Runs Tesseract.js OCR on uploaded ID document |
| `handleRegister()` | `Register.jsx` | Multi-step registration with safety act validation |

---

## 10. Real-Time Communication — WebSocket

### How Anonymous Chat Works

```mermaid
sequenceDiagram
    participant U1 as User A (Browser)
    participant WS as Django Channels Server
    participant Q as In-Memory Queue
    participant U2 as User B (Browser)

    U1->>WS: Connect to ws://host/ws/chat/
    WS-->>U1: Connection accepted
    U1->>WS: {"action": "find_match", "user_id": "abc123"}
    WS->>Q: No partner available → add to queue
    WS-->>U1: {"type": "waiting", "message": "Searching..."}

    U2->>WS: Connect to ws://host/ws/chat/
    WS-->>U2: Connection accepted
    U2->>WS: {"action": "find_match", "user_id": "xyz789"}
    WS->>Q: Partner found! → create room
    Q-->>WS: Match User A ↔ User B

    WS-->>U1: {"type": "system_message", "message": "Matched!", "room_id": "r8f2k"}
    WS-->>U2: {"type": "system_message", "message": "Matched!", "room_id": "r8f2k"}

    U1->>WS: {"action": "send_message", "message": "Hello!"}
    WS-->>U1: {"type": "chat_message", "message": "Hello!", "user_id": "abc123"}
    WS-->>U2: {"type": "chat_message", "message": "Hello!", "user_id": "abc123"}

    U2->>WS: Disconnect
    WS-->>U1: {"type": "system_message", "message": "Partner disconnected."}
```

### Why This Architecture?
- **Django Channels** converts Django from WSGI (synchronous) to ASGI (asynchronous), enabling persistent WebSocket connections
- **In-Memory Channel Layer** is used for the matchmaking queue — lightweight and suitable for the current scale
- **Group-based messaging** — matched users join a shared channel group, ensuring messages are broadcasted only to the pair
- **Automatic cleanup** — disconnecting removes the user from the queue and notifies their partner

---

## 11. Authentication & Security

### Authentication Flow

```mermaid
sequenceDiagram
    participant Client as React Frontend
    participant API as Django REST API
    participant JWT as SimpleJWT

    Client->>API: POST /api/token/ {username, password}
    API->>JWT: Validate credentials
    JWT-->>API: Generate access + refresh tokens
    API-->>Client: {access: "eyJ...", refresh: "eyJ..."}
    Client->>Client: Store tokens in localStorage

    Note over Client: All subsequent requests include the token

    Client->>API: GET /api/requests/ (Authorization: Bearer eyJ...)
    API->>JWT: Verify access token
    JWT-->>API: Token valid, user authenticated
    API-->>Client: 200 OK — user's rent requests

    Note over Client: When token expires (after 1 day)

    Client->>API: POST /api/token/refresh/ {refresh: "eyJ..."}
    API->>JWT: Validate refresh token
    JWT-->>API: New access token
    API-->>Client: {access: "new_eyJ..."}
```

### Security Measures Implemented

| Security Layer | Implementation | Why It Matters |
|---------------|----------------|----------------|
| **Password Hashing** | Django's `create_user()` uses PBKDF2 with SHA256 | Passwords are never stored in plain text |
| **JWT Authentication** | Access tokens (1-day lifetime) + Refresh tokens (7-day lifetime) | Stateless auth — no server-side session storage needed |
| **Write-Only Password Field** | `serializers.CharField(write_only=True)` | Passwords are never returned in API responses |
| **Age Verification** | Server-side DOB validation (minimum 20 years) | Compliance with RA 7610 |
| **Legal Compliance** | 6 Philippine safety acts with timestamped + IP-logged consent | Full audit trail for legal protection |
| **ID Verification** | Encrypted ID storage with OCR + admin review workflow | Identity verification before full access |
| **Conversation Authorization** | DM endpoints verify user membership in conversation | Users can only read/send to their own conversations |
| **Self-Review Prevention** | Server rejects reviews where `reviewer == profile.user` | Prevents rating manipulation |
| **Duplicate Review Prevention** | Unique constraint on `(reviewer, profile)` pair | One review per user per profile |
| **CORS Protection** | `django-cors-headers` — restrictive in production | Prevents unauthorized cross-origin requests |
| **CSRF Protection** | Django middleware `CsrfViewMiddleware` enabled | Protects against cross-site request forgery |
| **Clickjacking Protection** | `XFrameOptionsMiddleware` enabled | Prevents embedding the site in iframes |
| **Permission Classes** | `IsAuthenticated`, `IsAuthenticatedOrReadOnly`, `IsAdminUser`, `AllowAny` per view | Granular access control on every endpoint |
| **Owner-Only Actions** | `accept()` and `decline()` verify `request.user == profile.user` | Only the companion can manage their own requests |
| **Secret Key from Environment** | `SECRET_KEY = os.environ.get('SECRET_KEY', ...)` | Production secret is never committed to code |
| **Auto-Logout on 401** | Axios response interceptor detects unauthorized responses | Expired tokens are immediately cleared |
| **Data Privacy (RA 10173)** | ID documents stored with restricted access, OCR data encrypted | Compliance with Philippine Data Privacy Act |

### CORS Configuration

```python
# Production: only allow specified origins
CORS_ALLOWED_ORIGINS = os.environ.get('CORS_ALLOWED_ORIGINS', '').split(',')

# Development: allow all origins (convenient for local dev)
CORS_ALLOW_ALL_ORIGINS = DEBUG

# Always allow credentials (cookies, JWT headers)
CORS_ALLOW_CREDENTIALS = True
```

---

## 12. System Flowcharts

### 12.1 User Registration & Login Flow

```mermaid
flowchart TD
    A["User visits /register"] --> B["Step 1: Basic Info<br/>Name, Username, Email, Password"]
    B --> C{"Fields valid?"}
    C -->|No| D["Show error"]
    D --> B
    C -->|Yes| E["Step 2: Date of Birth<br/>Must be 20+ years old"]
    E --> F{"Age >= 20?"}
    F -->|No| G["Show: Must be 20+"]
    G --> E
    F -->|Yes| H["Step 3: Safety Acts<br/>Accept all 6 Philippine laws"]
    H --> I{"All accepted?"}
    I -->|No| J["Show: Must accept all"]
    J --> H
    I -->|Yes| K["POST /api/register/<br/>Create account"]
    K --> L{"Account created?"}
    L -->|No| M["Show: Username/Email taken"]
    M --> B
    L -->|Yes| N["Step 4: ID Upload<br/>Optional OCR scan"]
    N --> O{"Upload ID?"}
    O -->|Yes| P["POST /api/upload-id/<br/>Status → PENDING"]
    O -->|Skip| Q["Redirect to /login"]
    P --> Q

    R["User visits /login"] --> S["Enter Username + Password"]
    S --> T["POST /api/token/"]
    T --> U{"Valid?"}
    U -->|No| V["Show: Invalid credentials"]
    V --> S
    U -->|Yes| W["Store JWT tokens"]
    W --> X["Redirect to Home /"]
```

### 12.2 Rent Request Flow

```mermaid
flowchart TD
    A["User browses /profiles"] --> B["Select a companion card"]
    B --> C["Navigate to /rent/:id"]
    C --> D{"User logged in?"}
    D -->|No| E["Show: Login Required"]
    E --> F["Redirect to /login"]
    D -->|Yes| G["Display profile details"]
    G --> H["Select hours (1-24)<br/>with +/- buttons"]
    H --> I["View cost breakdown:<br/>Rate × Hours = Total"]
    I --> J["Click: Confirm Request"]
    J --> K["POST /api/requests/<br/>{profile_id, hours}"]
    K --> L{"Request successful?"}
    L -->|No| M["Show error alert"]
    L -->|Yes| N["Show success animation<br/>with CheckCircle icon"]
    N --> O["Auto-redirect to /profiles<br/>after 2.5 seconds"]

    subgraph Companion Side
        P["Companion views incoming requests"]
        P --> Q{"Accept or Decline?"}
        Q -->|Accept| R["POST /requests/:id/accept/"]
        R --> S["Status → ACCEPTED"]
        Q -->|Decline| T["POST /requests/:id/decline/"]
        T --> U["Status → DECLINED"]
    end
```

### 12.3 Anonymous Chat Flow

```mermaid
flowchart TD
    A["User visits /chat"] --> B["Idle State:<br/>Find a Connection screen"]
    B --> C["Click: Start Searching"]
    C --> D["Open WebSocket to /ws/chat/"]
    D --> E["Send: find_match action"]
    E --> F{"Queue empty?"}
    F -->|Yes| G["Add to waiting queue"]
    G --> H["Searching State:<br/>Show pulsing animation"]
    H --> I{"Another user joins?"}
    I -->|No| H
    I -->|Yes| J["Match both users<br/>Create room group"]
    F -->|No| J
    J --> K["Connected State:<br/>Chat room UI"]
    K --> L["Exchange messages<br/>in real-time"]
    L --> M{"User action?"}
    M -->|Send Message| N["Broadcast to room group"]
    N --> L
    M -->|Find New Match| O["Close WebSocket"]
    O --> C
    M -->|Leave Chat| P["Close WebSocket"]
    P --> B
    M -->|Partner Disconnects| Q["Show: Partner disconnected"]
    Q --> B
```

### 12.4 Overall System Request Flow

```mermaid
flowchart LR
    subgraph Frontend["React SPA"]
        A["User Action<br/>(Click, Submit, Navigate)"]
        B["React Component<br/>(State Update)"]
        C["Axios / WebSocket<br/>Client"]
    end

    subgraph Backend["Django ASGI"]
        D["Daphne Server<br/>(HTTP + WS)"]
        E["URL Router"]
        F["DRF ViewSet"]
        G["Channels Consumer"]
        H["Serializer<br/>(Validation)"]
        I["Django ORM"]
    end

    subgraph Data["Data Layer"]
        J["PostgreSQL / SQLite"]
        K["Media Storage<br/>/media/profiles/"]
    end

    A --> B --> C
    C -->|"REST API"| D
    C -->|"WebSocket"| D
    D --> E
    E -->|"/api/*"| F
    E -->|"/ws/*"| G
    F --> H --> I --> J
    F --> K
    G -->|"Channel Layer"| G
```

---

## 13. Deployment Architecture

### Render Deployment (Primary)

```mermaid
graph TB
    subgraph Render Cloud
        subgraph Backend Service["Web Service: rentcebu-api"]
            BE["Python 3.12<br/>Daphne ASGI Server"]
            Build["build.sh<br/>pip install → collectstatic → migrate → seed"]
        end

        subgraph Frontend Service["Static Site: rentcebu-app"]
            FE["Vite Build → /dist<br/>Served as static files"]
            Rewrite["SPA Rewrite: /* → /index.html"]
        end

        subgraph Database Service["PostgreSQL: rentcebu-db"]
            DB["PostgreSQL<br/>Region: Singapore"]
        end
    end

    User["🌐 User Browser"] -->|HTTPS| FE
    FE -->|API Calls| BE
    BE --> DB
```

### Docker Deployment (Railway / Self-Hosted)

| Service | Dockerfile | Port | Server |
|---------|-----------|------|--------|
| **Backend** | `backend/Dockerfile` | 8000 | Daphne (ASGI) |
| **Frontend** | `frontend/Dockerfile` | Dynamic (`$PORT`) | Nginx (Alpine) |

**Backend Docker flow:**
1. `python:3.12-slim` base image
2. Install Python dependencies
3. Collect static files
4. Create media directory
5. Run `entrypoint.sh` → migrate → seed → start Daphne

**Frontend Docker flow:**
1. `node:20-alpine` build stage → `npm install` → `npm run build`
2. `nginx:alpine` serve stage → copy `/dist` to Nginx's HTML directory
3. Custom `nginx.conf` for SPA routing
4. `envsubst` for dynamic port binding

### Environment Variables

| Variable | Example | Used By |
|----------|---------|---------|
| `SECRET_KEY` | Auto-generated | Backend |
| `DEBUG` | `False` | Backend |
| `DATABASE_URL` | `postgres://user:pass@host/db` | Backend |
| `ALLOWED_HOSTS` | `.onrender.com` | Backend |
| `CORS_ALLOWED_ORIGINS` | `https://rentcebu-app.onrender.com` | Backend |
| `VITE_API_URL` | `https://rentcebu-api.onrender.com` | Frontend |
| `PORT` | `8000` / dynamic | Both |

---

## 14. How to Run Locally

### Prerequisites
- Python 3.12+
- Node.js 20+
- Git

### Backend Setup
```bash
# Clone the repository
git clone <repository-url>
cd singson-application/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate   # Linux/Mac
# venv\Scripts\activate    # Windows

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Seed sample data
python manage.py seed_profiles

# Start the development server
python manage.py runserver
# Or use Daphne for WebSocket support:
daphne -b 127.0.0.1 -p 8000 config.asgi:application
```

### Frontend Setup
```bash
# In a new terminal
cd singson-application/frontend

# Install dependencies
npm install

# Start development server (auto-proxies to Django)
npm run dev
```

### Access the Application
| URL | Service |
|-----|---------|
| `http://localhost:5173` | Frontend (Vite dev server) |
| `http://localhost:8000/admin/` | Django Admin Panel |
| `http://localhost:8000/api/` | REST API Browser |

---

## 15. Conclusion

The **Kanojo (RentCebu)** application is a complete, production-ready full-stack web platform that demonstrates mastery of modern web development practices:

- **Frontend Excellence:** React 19 SPA with monochrome design system, 4-step registration, DM inbox with reactions/read receipts, and responsive 4-column/3-column layouts
- **Backend Robustness:** Django 6 REST API with 25+ endpoints, proper serialization, permission-based access control, and auto-calculated business logic
- **Real-Time Capabilities:** WebSocket-powered anonymous chat with intelligent matchmaking, plus polling-based direct messaging
- **Legal Compliance:** 6 Philippine safety acts (RA 9208, RA 10173, RA 9262, RA 7610, RA 10175, RA 9995) with timestamped consent and IP logging
- **Identity Verification:** Client-side OCR via Tesseract.js with admin review workflow
- **Social Features:** Star-based reviews (1-5), direct messaging with emoji reactions, unread badges
- **Security First:** JWT authentication, age verification (20+), ID encryption, self-review prevention, conversation authorization, and environment-based secret management
- **Cloud-Native:** Supabase PostgreSQL database, fully containerized with Docker, deployable to Render, Railway, or any cloud platform
- **Data-Driven:** Comprehensive seed system populating 64 realistic profiles with images across 6+ Cebu locations

The system successfully adapts a proven Japanese business model for the Philippine market, providing a safe, legally compliant, user-friendly platform for social companion services in Cebu City.

---

> **Developed by:** Singson, John Rey  
> **Stack:** Django 6 · React 19 · Vite · PostgreSQL · Docker  
> **Status:** ✅ Deployed & Production-Ready
> **Institution:** Cebu Eastern College Inc.
