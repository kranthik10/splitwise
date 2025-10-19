# Better Auth Implementation for Splitwise

This document explains the Better Auth authentication system implemented in this Splitwise Expo app.

## 🎯 Overview

I've successfully integrated **Better Auth** with **Expo** for your Splitwise project. The implementation follows the official [Expo + Better Auth example](https://github.com/expo/examples/tree/master/with-better-auth) from the Expo examples repository.

## 📦 Dependencies Installed

The following packages were added to your project:

- `better-auth` - The authentication framework
- `@better-auth/expo` - Expo-specific Better Auth plugin
- `expo-secure-store` - Secure storage for authentication tokens
- `prisma` - Database ORM
- `@prisma/client` - Prisma client for database operations

## 🗂️ Project Structure

### New Files Created

```
splitwise/
├── lib/
│   ├── auth.ts              # Better Auth server configuration
│   └── auth-client.ts       # Better Auth React client
├── prisma/
│   ├── schema.prisma        # Database schema with auth tables
│   ├── dev.db              # SQLite database (gitignored)
│   └── migrations/         # Database migrations
├── app/
│   ├── (auth)/             # Authentication routes (unauthenticated)
│   │   ├── _layout.tsx
│   │   ├── sign-in.tsx
│   │   └── sign-up.tsx
│   ├── (app)/              # Protected app routes (authenticated)
│   │   ├── _layout.tsx
│   │   ├── (tabs)/         # Your existing tabs
│   │   └── [other screens] # Your existing screens
│   └── api/
│       └── auth/
│           └── [...route]+api.ts  # API handler for auth
```

### Modified Files

- `app/_layout.tsx` - Updated to use `Stack.Protected` for auth routing
- `app/index.tsx` - Updated to redirect based on auth state
- `app/(app)/(tabs)/account.tsx` - Added sign-out functionality
- `package.json` - Added Prisma scripts
- `.gitignore` - Added Prisma database files

## 🔐 Authentication Features

### Email/Password Authentication

- **Sign Up**: Users can create an account with name, email, and password
- **Sign In**: Users can log in with email and password
- **Sign Out**: Users can sign out from the Account tab
- **Session Management**: Automatic session handling with secure storage
- **Protected Routes**: Routes are automatically protected based on authentication state

### Database Schema

The Prisma schema includes the following models:
- `User` - User accounts
- `Session` - Active user sessions
- `Account` - Account providers (email/password)
- `Verification` - Email verification tokens

## 🚀 How to Use

### 1. Start the Development Server

```bash
npm start
```

### 2. User Flow

1. **New Users**: 
   - App opens to Sign In screen
   - Click "Sign Up" to create an account
   - Enter name, email, and password
   - Automatically signed in after registration

2. **Existing Users**:
   - Enter email and password
   - Click "Sign In"
   - Redirected to main app

3. **Sign Out**:
   - Go to Account tab
   - Scroll to bottom
   - Click "Sign Out" button

### 3. Database Management Scripts

```bash
# Generate Prisma client
npm run db:generate

# Create a new migration
npm run db:migrate

# Open Prisma Studio (database GUI)
npm run db:studio
```

## 🛠️ Configuration Details

### Auth Server (`lib/auth.ts`)

```typescript
- Database: SQLite via Prisma
- Provider: Email/Password
- Plugins: Expo plugin for mobile compatibility
- Trusted Origins: exp://, splitwise://
```

### Auth Client (`lib/auth-client.ts`)

```typescript
- Base URL: http://localhost:8081
- Storage: Expo Secure Store
- Scheme: exp
- Storage Prefix: splitwise
```

### Protected Routes

Routes inside `app/(app)/` require authentication:
- All tabs (Home, Groups, Activity, Account)
- All modal screens (Add Expense, Add Group, Settle Up, etc.)

Routes inside `app/(auth)/` are for unauthenticated users:
- Sign In
- Sign Up

## 🎨 UI/UX Implementation

The authentication screens follow your app's design system:
- Tailwind CSS styling with your custom primary colors
- Consistent with existing app design
- Responsive and accessible
- Clean, minimal forms

## 🔄 Migration from Current Setup

Your existing user data structure is preserved:
- The `User` type in `types/index.ts` remains unchanged
- Local storage (`@/utils/storage.ts`) continues to work
- The authenticated user's info syncs to local storage on first load

## 📝 Environment Variables

The current setup uses:
- SQLite database (no external dependencies)
- Local development server (http://localhost:8081)

For production, you may want to:
1. Switch to a production database (PostgreSQL, MySQL)
2. Update `baseURL` in `lib/auth-client.ts` to your production API
3. Configure proper SSL/TLS certificates

## 🐛 Troubleshooting

### "Session not found" error
- Clear app data and sign in again
- Run `npm run db:migrate` to ensure database is up to date

### Authentication not working
- Ensure Expo dev server is running on port 8081
- Check that Prisma client is generated: `npm run db:generate`
- Verify database exists: Check for `prisma/dev.db` file

### Route navigation errors
- The app structure changed - old routes like `/currency-settings` should now be `/(app)/currency-settings`
- Update any hardcoded navigation paths in your code

## 🎯 Next Steps

You can enhance the authentication system with:

1. **Email Verification**: Enable email verification in Better Auth config
2. **Social Providers**: Add Google, Apple, Facebook login
3. **Password Reset**: Implement forgot password flow
4. **Two-Factor Auth**: Add 2FA support
5. **User Profiles**: Extend User model with profile fields
6. **Production Database**: Switch to PostgreSQL or MySQL

## 📚 Resources

- [Better Auth Docs](https://www.better-auth.com/docs)
- [Expo Better Auth Example](https://github.com/expo/examples/tree/master/with-better-auth)
- [Prisma Docs](https://www.prisma.io/docs)
- [Expo Secure Store](https://docs.expo.dev/versions/latest/sdk/securestore/)

---

**Implementation Date**: October 19, 2025
**Based on**: Expo Better Auth Example (expo/examples)
**Database**: SQLite with Prisma ORM
**Authentication**: Better Auth v1.3.28
