# Litus Taste — Comida Preparada

[![CI](https://github.com/jcampos187/litustasteapp/actions/workflows/playwright.yml/badge.svg)](https://github.com/jcampos187/litustasteapp/actions)

Plataforma web para una empresa de comida preparada (meal prep). Los clientes
invitados pueden ver el menú semanal, hacer pedidos, y el administrador recibe
notificaciones por correo.

## Stack

- **Next.js 16** — App Router, Server Components
- **TypeScript** — Strict mode
- **Tailwind CSS v4** — Styling
- **Drizzle ORM** — Database ORM
- **Neon (PostgreSQL)** — Database
- **Clerk** — Authentication
- **Resend** — Email (invites + notifications)
- **UploadThing** — File uploads (meal photos)
- **Vercel** — Hosting (recommended)

## Getting Started

### 1. Clone and install

```bash
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

Required variables:
- `DATABASE_URL` — Neon PostgreSQL connection string
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — Clerk publishable key
- `CLERK_SECRET_KEY` — Clerk secret key
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/sign-in`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/sign-up`
- `RESEND_API_KEY` — Resend API key for emails
- `ADMIN_EMAIL` — Email where order notifications are sent
- `UPLOADTHING_SECRET` + `UPLOADTHING_APP_ID` — UploadThing credentials
- `NEXT_PUBLIC_APP_URL` — Your deployment URL (http://localhost:3000 for dev)

### 3. Database setup

```bash
# Push schema to your Neon database
npm run db:push

# Seed default data (dietary tags, business settings)
npx tsx src/scripts/seed.ts
```

### 4. Clerk setup

1. Create a Clerk application at https://clerk.com
2. Configure social logins if desired (Google, etc.)
3. Add a webhook endpoint at `/api/auth/webhook` for `user.created`, `user.updated`, `user.deleted` events
4. Create an admin user manually in the Clerk dashboard

### 5. Set admin role

After creating your admin account in Clerk, run a migration to set the role:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

Or use the Drizzle Studio:
```bash
npm run db:studio
```

### 6. Run the app

```bash
npm run dev
```

### 7. Deploy to Vercel

```bash
vercel
```

## Project Structure

```
litus-taste/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Landing page
│   │   ├── menu/             # Weekly menu (customer-facing)
│   │   ├── cart/             # Shopping cart + submit order
│   │   ├── order/            # Order confirmation
│   │   ├── account/          # Orders history, profile
│   │   ├── admin/            # Admin dashboard
│   │   ├── auth/             # Clerk auth pages
│   │   └── api/              # API routes
│   ├── components/           # Reusable components
│   ├── db/
│   │   ├── schema.ts         # Database schema
│   │   └── index.ts          # DB client
│   ├── lib/
│   │   ├── utils.ts          # Utilities
│   │   ├── email.ts          # Email sending
│   │   └── uploadthing.ts    # File upload config
│   └── middleware.ts         # Clerk route protection
├── drizzle/                  # Migration files
└── public/                   # Static assets
```

## Key Features

- 🔐 **Invite-only** — Admin invites customers via email
- 📋 **Weekly Menu** — Publish menus with dietary tags
- 🛒 **Simple Cart** — Add items with quantities, submit orders
- 📧 **Email Notifications** — Admin gets order alerts
- 🏪 **Admin Dashboard** — Manage meals, menus, orders, customers
- 🌿 **Dietary Tags** — Filter by dietary needs (vegan, keto, gluten-free, etc.)
- 🇨🇷 **CRC Prices** — Costa Rican colones formatting
