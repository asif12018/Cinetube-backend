# 🎬 CineTube Backend

A robust, production-ready REST API for the **CineTube** streaming platform — built with **Express.js**, **Prisma ORM**, **PostgreSQL** (Neon), and **TypeScript**. It handles everything from authentication and media management to payments and real-time notifications.

---

## 🌐 Live Deployment

| Service | URL |
|---|---|
| **API Base URL** | `https://cinehub-backend-z65f.onrender.com` |
| **Frontend** | `https://cinetube-frontend-seven.vercel.app` |
| **Auth Endpoint** | `/api/auth` |
| **API Prefix** | `/api/v1` |

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| **Runtime** | Node.js |
| **Framework** | Express.js v5 |
| **Language** | TypeScript |
| **ORM** | Prisma v7 |
| **Database** | PostgreSQL (Neon serverless) |
| **Authentication** | Better Auth |
| **Payments** | Stripe |
| **File Uploads** | Cloudinary + Multer |
| **Email** | Nodemailer + Gmail OAuth2 |
| **Validation** | Zod |
| **Deployment** | Render / Vercel |

---

## 📋 Prerequisites

- **Node.js** >= 18
- **npm** >= 9
- A **PostgreSQL** database (e.g., [Neon](https://neon.tech))
- A **Cloudinary** account
- A **Stripe** account
- A **Gmail** account with OAuth2 credentials (for email sending)

---

## ⚙️ Environment Setup

Create a `.env` file in the project root and populate it with the following variables:

```env
# ── Server ──────────────────────────────────────────
NODE_ENV=development
PORT=5000

# ── Database ─────────────────────────────────────────
DATABASE_URL="postgresql://<user>:<password>@<host>/<db>?sslmode=require"

# ── URLs ─────────────────────────────────────────────
FRONTEND_URL=http://localhost:3000
BETTER_AUTH_URL=http://localhost:5000

# ── Better Auth ───────────────────────────────────────
BETTER_AUTH_SECRET=<your_secret>
BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN=1d
BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE=1d

# ── JWT (custom tokens) ───────────────────────────────
ACCESS_TOKEN_SECRET=<your_access_secret>
REFRESH_TOKEN_SECRET=<your_refresh_secret>
ACCESS_TOKEN_EXPIRES_IN=1d
REFRESH_TOKEN_EXPIRES_IN=7d

# ── Email (Nodemailer / SMTP) ─────────────────────────
EMAIL_SENDER_SMTP_HOST=smtp.gmail.com
EMAIL_SENDER_SMTP_PORT=465
EMAIL_SENDER_SMTP_USER=<your_gmail>
EMAIL_SENDER_SMTP_PASS=<your_app_password>
EMAIL_SENDER_SMTP_FROM=<your_gmail>

# ── Gmail OAuth2 (alternative email sender) ───────────
GMAIL_USER=<your_gmail>
GMAIL_CLIENT_ID=<oauth_client_id>
GMAIL_CLIENT_SECRET=<oauth_client_secret>
GMAIL_REFRESH_TOKEN=<oauth_refresh_token>

# ── Cloudinary ────────────────────────────────────────
CLOUDINARY_CLOUD_NAME=<your_cloud_name>
CLOUDINARY_API_KEY=<your_api_key>
CLOUDINARY_SECRET=<your_api_secret>

# ── Stripe ────────────────────────────────────────────
STRIPE_SECRET_KEY=<your_stripe_secret>
STRIPE_WEBHOOK_SECRET=<your_webhook_secret>
```

---

## 🚀 Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/asif12018/Cinetube-backend.git
cd CineHub-backend-main
npm install
```

### 2. Generate Prisma Client

```bash
npm run generate
```

### 3. Run Database Migrations

```bash
npm run migrate
```

### 4. Start Development Server

```bash
npm run dev
```

The server will start at `http://localhost:5000`.

---

## 📜 Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server with hot reload (`tsx watch`) |
| `npm run build` | Compile TypeScript & generate Prisma client for production |
| `npm start` | Run compiled production build (`dist/server.js`) |
| `npm run migrate` | Run Prisma database migrations |
| `npm run generate` | Regenerate the Prisma client |
| `npm run studio` | Open Prisma Studio (visual DB browser) |
| `npm run push` | Push schema changes directly to DB (no migration file) |
| `npm run pull` | Pull DB schema into Prisma schema file |
| `npm run lint` | Run ESLint on all TypeScript source files |
| `npm run lint:fix` | Auto-fix lint errors |
| `npm run format` | Format all files with Prettier |
| `npm run stripe:webhook` | Forward Stripe webhooks to local server |

---

## 🗂️ Project Structure

```
src/
├── app.ts                  # Express app setup (middleware, routes, error handlers)
├── server.ts               # HTTP server bootstrap & graceful shutdown
└── app/
    ├── config/             # Environment config loader
    ├── lib/                # Better Auth setup
    ├── middlewares/        # Global error handler, 404 handler, auth guards
    ├── routes/             # Central route aggregator (index.ts)
    ├── modules/            # Feature modules (each has routes, controller, service)
    │   ├── auth/           # Authentication endpoints
    │   ├── user/           # User profile management
    │   ├── media/          # Movies & series CRUD
    │   ├── genre/          # Genre management
    │   ├── actor/          # Actor & cast management
    │   ├── tags/           # Review tags
    │   ├── reviews/        # User reviews (with moderation)
    │   ├── comment/        # Nested comments on reviews
    │   ├── reviewLike/     # Review likes/unlikes
    │   ├── watchList/      # User watchlist
    │   ├── notification/   # In-app notifications
    │   ├── purchase/       # Stripe payments & webhook
    │   └── adminStats/     # Admin dashboard statistics
    ├── helperFunciton/     # Shared helpers (e.g. notification helper)
    ├── shared/             # Shared utilities (pagination, query builder, etc.)
    ├── errorHelpers/       # Custom error classes
    ├── interface/          # Global TypeScript interfaces
    ├── types/              # Global type augmentations
    ├── utils/              # Utility functions (JWT, Cloudinary, email, etc.)
    └── templates/          # EJS email templates

prisma/
└── schema/
    ├── base.prisma         # Generator, datasource, and all Enums
    ├── auth.prisma         # User, Session, Account, Verification
    ├── media.prisma        # Media, Genre, Actor, Cast, StreamingPlatform
    ├── review.prisma       # Review, Tag, ReviewLike, Comment
    ├── subscription.prisma # Purchase, Subscription
    └── activity.prisma     # Notifications & activity log
```

---

## 🔌 API Endpoints

All routes are prefixed with `/api/v1` unless otherwise noted.

### 🔐 Authentication — `/api/auth/*`
Handled by **Better Auth** library. Supports:
- Email/password sign-up & login
- Session management (cookie-based)
- Google OAuth (configurable)

### 👤 Users — `/api/v1/user`
| Method | Path | Description |
|---|---|---|
| `GET` | `/` | Get all users (admin) |
| `GET` | `/:id` | Get user profile |
| `PATCH` | `/:id` | Update user profile |
| `DELETE` | `/:id` | Delete/ban user (admin) |

### 🎬 Media — `/api/v1/media`
| Method | Path | Description |
|---|---|---|
| `GET` | `/` | List all published media (paginated, filterable) |
| `GET` | `/:slug` | Get media details by slug |
| `POST` | `/` | Create new media (admin) |
| `PATCH` | `/:id` | Update media (admin) |
| `DELETE` | `/:id` | Delete media (admin) |

### 🎭 Actors — `/api/v1/actor`
| Method | Path | Description |
|---|---|---|
| `GET` | `/` | List all actors |
| `POST` | `/` | Create actor (admin) |
| `PATCH` | `/:id` | Update actor (admin) |
| `DELETE` | `/:id` | Delete actor (admin) |

### 🏷️ Genres — `/api/v1/genre`
| Method | Path | Description |
|---|---|---|
| `GET` | `/` | List all genres |
| `POST` | `/` | Create genre (admin) |
| `DELETE` | `/:id` | Delete genre (admin) |

### ⭐ Reviews — `/api/v1/reviews`
| Method | Path | Description |
|---|---|---|
| `GET` | `/` | Get all reviews (admin, with filters) |
| `GET` | `/media/:mediaId` | Get published reviews for a media |
| `POST` | `/` | Submit a review (auth required) |
| `PATCH` | `/:id` | Update own review |
| `DELETE` | `/:id` | Delete review |
| `PATCH` | `/:id/approve` | Approve review (admin) |
| `PATCH` | `/:id/unpublish` | Unpublish review (admin) |

### 💬 Comments — `/api/v1/comment`
| Method | Path | Description |
|---|---|---|
| `GET` | `/review/:reviewId` | Get comments for a review |
| `POST` | `/` | Add a comment or reply |
| `DELETE` | `/:id` | Delete a comment |

### 👍 Review Likes — `/api/v1/like`
| Method | Path | Description |
|---|---|---|
| `POST` | `/` | Toggle like on a review |

### 📋 Watchlist — `/api/v1/watchList`
| Method | Path | Description |
|---|---|---|
| `GET` | `/` | Get current user's watchlist |
| `POST` | `/` | Add media to watchlist |
| `DELETE` | `/:id` | Remove from watchlist |

### 🏷️ Tags — `/api/v1/tags`
| Method | Path | Description |
|---|---|---|
| `GET` | `/` | List all tags |
| `POST` | `/` | Create tag (admin) |

### 🔔 Notifications — `/api/v1/notification`
| Method | Path | Description |
|---|---|---|
| `GET` | `/` | Get user notifications |
| `PATCH` | `/:id/read` | Mark notification as read |
| `PATCH` | `/read-all` | Mark all notifications as read |

### 💳 Payments — `/api/v1/payment`
| Method | Path | Description |
|---|---|---|
| `POST` | `/stripe/create-checkout` | Create Stripe checkout session |
| `POST` | `/stripe/webhook` | Stripe webhook receiver |
| `GET` | `/my-purchases` | Get user's purchase history |

### 📊 Admin Stats — `/api/v1/admin`
| Method | Path | Description |
|---|---|---|
| `GET` | `/stats` | Get platform-wide statistics |

---

## 🗄️ Database Schema Overview

The database is split across multiple Prisma schema files for clarity:

```
User ──< Session
     ──< Account
     ──< Review ──< ReviewLike
               ──< Comment ──< Comment (nested replies)
               ──< ReviewTag >── Tag
     ──< WatchlistItem >── Media
     ──< Purchase >── Media
     ──< Subscription
     ──< Notification

Media >── MediaGenre >── Genre
      >── MediaCast >── Actor
      >── MediaStreamingLink >── StreamingPlatform
```

### Key Enums

| Enum | Values |
|---|---|
| `Role` | `USER`, `ADMIN`, `SUPER_ADMIN` |
| `MediaType` | `MOVIE`, `SERIES` |
| `MediaStatus` | `PUBLISHED`, `DRAFT`, `ARCHIVED` |
| `PricingTier` | `FREE`, `PREMIUM` |
| `ReviewStatus` | `PENDING`, `PUBLISHED`, `UNPUBLISHED` |
| `PurchaseType` | `RENTAL`, `ONE_TIME_BUY` |
| `PaymentStatus` | `PENDING`, `COMPLETED`, `FAILED`, `REFUNDED` |
| `SubscriptionStatus` | `PENDING`, `ACTIVE`, `CANCELLED`, `EXPIRED`, `PAST_DUE` |

---

## 💰 Payment & Subscription Flow

1. User selects a **RENTAL** or **ONE_TIME_BUY** option on a media item.
2. Frontend calls `POST /api/v1/payment/stripe/create-checkout` → receives a Stripe Checkout URL.
3. User completes payment on Stripe's hosted page.
4. Stripe sends a webhook to `POST /api/v1/payment/stripe/webhook`.
5. Backend verifies the signature, updates the `Purchase` record to `COMPLETED`, and grants access.
6. For rentals, `accessExpiresAt` is set (48-hour window).

> **Local Webhook Testing:**
> ```bash
> npm run stripe:webhook
> ```
> This forwards Stripe events to `http://localhost:5000/api/v1/payment/stripe/webhook`.

---

## 📧 Email System

Transactional emails (e.g., review approval, account notifications) are sent via:
- **Nodemailer** with SMTP (Gmail App Password), or
- **Gmail API** with OAuth2 for more reliable delivery.

Email templates are rendered using **EJS** and stored in `src/app/templates/`.

---

## ☁️ Media Uploads

Images (posters, backdrops, actor photos) are uploaded directly to **Cloudinary** using:
- `multer` for handling `multipart/form-data`
- `multer-storage-cloudinary` for piping uploads to Cloudinary

Resulting `secure_url` values are saved to the database.

---

## 🚢 Deployment

### Render (Current)
The backend is deployed on **Render**. Push to the main branch to trigger auto-deploy.

- **Build Command:** `npm run build`
- **Start Command:** `npm start`

### Vercel (Alternative)
A `vercel.json` is included for serverless deployment:

```json
{
  "builds": [{ "src": "src/server.ts", "use": "@vercel/node" }],
  "rewrites": [{ "source": "/(.*)", "destination": "/src/server.ts" }]
}
```

Deploy with:
```bash
vercel --prod
```

---

## 🛡️ Error Handling

- All errors pass through the `globalErrorHandler` middleware.
- Unhandled routes return a `404` via the `notFound` middleware.
- Uncaught exceptions and unhandled promise rejections trigger a graceful server shutdown with process exit.

---

## 🔒 CORS Configuration

The server accepts requests from the configured `FRONTEND_URL` and `BETTER_AUTH_URL`:

```typescript
cors({
  origin: [BETTER_AUTH_URL, FRONTEND_URL],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
})
```

---

## 📄 License

ISC © CineTube
