This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Database Setup

### Requirements

- PostgreSQL 18
- Node.js 22
- Prisma ORM 7

### 1. Create PostgreSQL user and database

Connect to PostgreSQL as an administrator:

```sql
CREATE ROLE learnify_app
WITH LOGIN PASSWORD 'YOUR_LOCAL_PASSWORD';

CREATE DATABASE learnify_db OWNER learnify_app;
```

### 2. Configure environment

Copy `.env.example` to `.env` and update `DATABASE_URL`
with your local PostgreSQL credentials.

Never commit `.env` to Git.

### 3. Install dependencies

```bash
npm install
```

### 4. Generate Prisma Client

```bash
npx prisma validate
npx prisma generate
```

### 5. Verify database connectivity

```bash
npx tsx scripts/check-db.ts
```

Expected result:

`DB-01 connection: PASS`

### Scope

DB-01 configures PostgreSQL and Prisma connectivity only.
Business models and migrations belong to DB-02.