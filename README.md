# Roselyra Fashion

A modern luxury fashion e-commerce platform built with Next.js 14, featuring an editorial-inspired design aesthetic.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Database**: MongoDB
- **State Management**: Zustand
- **UI Components**: Radix UI, Framer Motion, GSAP
- **Auth**: JWT with jose, bcryptjs
- **Payments**: Stripe
- **Email**: Nodemailer
- **Image Storage**: Cloudinary
- **File Upload**: Firebase, react-dropzone

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB instance
- Cloudinary account (for image hosting)
- Stripe account (for payments)
- Firebase project (for file uploads)

### Environment Variables

Create `.env.local` with:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/roselyra

# JWT
JWT_SECRET=your-secret-key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Firebase
FIREBASE_API_KEY=...
FIREBASE_AUTH_DOMAIN=...
FIREBASE_PROJECT_ID=...
FIREBASE_STORAGE_BUCKET=...
FIREBASE_MESSAGING_SENDER_ID=...
FIREBASE_APP_ID=...

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

### Build

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── (public)/       # Public routes
│   ├── admin/          # Admin dashboard
│   └── api/            # API routes
├── components/
│   ├── admin/          # Admin UI components
│   ├── animations/      # Animation components
│   ├── layout/          # Layout components
│   └── ui/              # Reusable UI components
├── lib/
│   ├── db.ts           # MongoDB client & queries
│   └── utils.ts        # Utility functions
├── store/              # Zustand stores
└── types/              # TypeScript types
```

## Features

- **Public Storefront**: Editorial-style homepage with hero sections, collections, and featured products
- **Product Catalog**: Filterable product grid with categories, search, and sorting
- **Product Details**: Image gallery, size selection, stock availability
- **Shopping Cart**: Drag-and-drop cart with quantity management
- **Checkout**: Stripe-powered checkout with order confirmation
- **User Accounts**: Registration, login, password reset, order history
- **Admin Dashboard**: Product management, order management, settings, and analytics

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/*` | POST | Authentication endpoints |
| `/api/products/*` | GET/POST/PUT/DELETE | Product management |
| `/api/orders/*` | GET/POST/PUT | Order management |
| `/api/cart/*` | GET/POST | Cart operations |
| `/api/media/*` | GET/POST | File uploads |
| `/api/stripe/*` | POST | Stripe webhooks |
| `/api/admin/*` | Various | Admin operations |