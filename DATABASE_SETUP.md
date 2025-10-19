# Database Setup Guide

This project uses **PostgreSQL** with **Prisma ORM** for production.

## Quick Setup Options

### Option 1: Supabase (Recommended - Free Tier Available)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to **Settings** → **Database**
4. Copy the **Connection String** (URI format)
5. Paste it into your `.env` file:
   ```
   DATABASE_URL="postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
   ```

### Option 2: Neon (Serverless PostgreSQL)

1. Go to [neon.tech](https://neon.tech) and sign up
2. Create a new project
3. Copy the connection string
4. Add to `.env`:
   ```
   DATABASE_URL="postgresql://[USER]:[PASSWORD]@ep-xxxxx.us-east-2.aws.neon.tech/neondb"
   ```

### Option 3: Railway

1. Go to [railway.app](https://railway.app)
2. Create a new PostgreSQL database
3. Copy the connection string from the database settings
4. Add to `.env`

### Option 4: Local PostgreSQL

1. Install PostgreSQL locally:
   ```bash
   # macOS
   brew install postgresql@15
   brew services start postgresql@15
   
   # Create database
   createdb splitwise_dev
   ```

2. Add to `.env`:
   ```
   DATABASE_URL="postgresql://postgres:password@localhost:5432/splitwise_dev"
   ```

## Setup Steps

1. **Copy environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Add your database URL to `.env`**

3. **Generate Prisma Client:**
   ```bash
   npm run db:generate
   ```

4. **Run migrations:**
   ```bash
   npm run db:migrate
   ```

5. **Verify setup:**
   ```bash
   npm run db:studio
   ```
   This opens Prisma Studio at http://localhost:5555

## Available Commands

- `npm run db:generate` - Generate Prisma Client
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio (database GUI)

## Database Schema

The database includes the following tables for authentication:
- **User** - User accounts
- **Session** - Active user sessions
- **Account** - OAuth provider accounts
- **Verification** - Email verification tokens

## Production Deployment

When deploying to production:

1. Set `DATABASE_URL` environment variable in your hosting platform
2. Run migrations: `npm run db:migrate`
3. Ensure your database accepts connections from your hosting IP

## Security Notes

- ✅ `.env` is gitignored to protect credentials
- ✅ Never commit database URLs to version control
- ✅ Use different databases for development and production
- ✅ Enable SSL for production databases (most cloud providers do this by default)
