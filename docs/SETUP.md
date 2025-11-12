# Ginkgo Stakeholder Portal - Setup Guide

## Overview

This guide covers setting up the Ginkgo Stakeholder Portal for development and production deployments using Supabase PostgreSQL.

---

## Prerequisites

- Node.js 18+ with npm
- Supabase project (free tier available at https://supabase.com)
- Netlify account (for hosting)
- Git

---

## Local Development Setup

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd ginkgo-stakeholder-portal
npm install
```

### 2. Configure Supabase Connection

#### Get Your Connection String

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Settings → Database → Connection string**
4. Choose **Nodejs** from the dropdown
5. Copy the connection string (includes placeholder `[YOUR_PASSWORD]`)
6. Replace `[YOUR_PASSWORD]` with your database password

#### Update .env.local

Edit `.env.local` and update the `DATABASE_URL`:

```bash
# Before
DATABASE_URL="postgresql://user:password@localhost:5432/stakeholder_portal_dev"

# After
DATABASE_URL="postgresql://postgres:[YOUR_PASSWORD]@db.YOUR_PROJECT.supabase.co:5432/postgres"
```

Example:
```bash
DATABASE_URL="postgresql://postgres:abc123xyz@db.bjkibervxdmuuafrbccq.supabase.co:5432/postgres"
```

### 3. Verify Database Connection

Test the connection without running migrations:

```bash
npx prisma db execute --stdin --file /dev/null
```

If this connects successfully, you're ready for migrations.

### 4. Run Initial Migration

Create the database schema:

```bash
npm run prisma:migrate -- --name init
```

This will:
- Run all pending migrations from `prisma/migrations/`
- Create all tables (Tenant, VerificationCampaign, VerificationRecipient, etc.)
- Set up indexes and foreign keys

Verify tables were created:

```bash
npx prisma db execute --stdin <<'EOF'
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
EOF
```

You should see tables like:
- `Tenant`
- `VerificationCampaign`
- `VerificationRecipient`
- `VerificationEvent`
- `ContactChangeSet`
- `EspConnection`

### 5. Configure Environment Variables

Copy and update all variables from `.env.example`:

```bash
# Database
DATABASE_URL="postgresql://postgres:[YOUR_PASSWORD]@db.YOUR_PROJECT.supabase.co:5432/postgres"

# Encryption & Security
ENCRYPTION_KEY="your-secret-encryption-key-change-in-production"

# Application URLs
APP_BASE_URL="http://localhost:3000"
NEXT_PUBLIC_APP_BASE_URL="http://localhost:3000"
NODE_ENV="development"

# Feature Flags (development defaults)
FEATURE_ESP_ENABLED=false
FEATURE_ESP_MAILCHIMP_ENABLED=false
FEATURE_ESP_CONSTANT_CONTACT_ENABLED=false
FEATURE_ESP_SYNC_AUDIENCE_ENABLED=false
FEATURE_ESP_WEBHOOK_TRACKING_ENABLED=false
FEATURE_VERIFICATION_RATE_LIMITING_ENABLED=true
FEATURE_VERIFICATION_EMAIL_VALIDATION_ENABLED=true
FEATURE_VERBOSE_LOGGING_ENABLED=false
FEATURE_MOCK_GINKGO_API_ENABLED=false
```

### 6. Start Development Server

```bash
npm run dev
```

Navigate to http://localhost:3000

---

## Netlify Deployment

### 1. Configure Environment Variables

In Netlify Dashboard → Site Settings → Build & Deploy → Environment:

Add the following variables in each deploy context (Build, Functions, Runtime):

**Production:**
```
DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@db.YOUR_PROJECT.supabase.co:5432/postgres
ENCRYPTION_KEY=your-production-encryption-key-[CHANGE-THIS]
APP_BASE_URL=https://your-domain.com
NEXT_PUBLIC_APP_BASE_URL=https://your-domain.com
NODE_ENV=production
FEATURE_ESP_ENABLED=false
FEATURE_VERIFICATION_RATE_LIMITING_ENABLED=true
FEATURE_VERIFICATION_EMAIL_VALIDATION_ENABLED=true
FEATURE_VERBOSE_LOGGING_ENABLED=false
```

**Preview (Staging):**
```
DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@db.YOUR_PROJECT.supabase.co:5432/postgres
ENCRYPTION_KEY=your-staging-encryption-key-[CHANGE-THIS]
APP_BASE_URL=https://preview.netlify.com
NEXT_PUBLIC_APP_BASE_URL=https://preview.netlify.com
NODE_ENV=production
FEATURE_ESP_ENABLED=false
FEATURE_VERIFICATION_RATE_LIMITING_ENABLED=true
FEATURE_VERIFICATION_EMAIL_VALIDATION_ENABLED=true
FEATURE_VERBOSE_LOGGING_ENABLED=false
```

**Development:**
```
DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@db.YOUR_PROJECT.supabase.co:5432/postgres
ENCRYPTION_KEY=dev-key-12345678901234567890123456789012
APP_BASE_URL=https://develop.netlify.com
NEXT_PUBLIC_APP_BASE_URL=https://develop.netlify.com
NODE_ENV=development
FEATURE_ESP_ENABLED=false
FEATURE_VERIFICATION_RATE_LIMITING_ENABLED=true
FEATURE_VERBOSE_LOGGING_ENABLED=true
```

### 2. Verify netlify.toml

Check that `netlify.toml` is configured:

```toml
[build]
  command = "npm run build"
  functions = "netlify/functions"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18.17.1"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

### 3. Deploy

```bash
git push origin claude/stakeholder-portal-fresh-start-011CV2Dyb5Fe4mxN23W3pvCL
```

Netlify will automatically:
1. Run `npm run build`
2. Deploy to the specified branch context
3. Run migrations as part of the build (if configured)

---

## Database Operations

### View Schema in Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **SQL Editor**
4. Run queries to inspect schema:

```sql
-- List all tables
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- View table structure
\d "Tenant"
\d "VerificationCampaign"

-- Count records
SELECT COUNT(*) FROM "Tenant";
SELECT COUNT(*) FROM "VerificationCampaign";
```

### Run Migrations

Generate migration after schema changes:

```bash
npx prisma migrate dev --name add_new_field
```

Deploy migration to production:

```bash
npx prisma migrate deploy
```

### Prisma Studio (Database GUI)

View and edit data with Prisma Studio:

```bash
npx prisma studio
```

Opens at http://localhost:5555

---

## Supabase Security (Optional)

### Row-Level Security (RLS)

For tenant isolation, enable RLS on sensitive tables:

```sql
-- Enable RLS on VerificationRecipient
ALTER TABLE "VerificationRecipient" ENABLE ROW LEVEL SECURITY;

-- Create policy for tenant isolation (requires auth context)
CREATE POLICY tenant_isolation ON "VerificationRecipient"
  FOR ALL USING (
    "tenantId" = (
      SELECT id FROM "Tenant" WHERE id = current_setting('app.current_tenant_id')::uuid
    )
  );
```

### Backup Configuration

Supabase automatically backs up daily (Pro plan). For critical data:

1. Go to **Settings → Backups**
2. Verify daily backups are enabled
3. Download manual backup before major changes

---

## Troubleshooting

### Connection Issues

If `DATABASE_URL` fails to connect:

1. Verify password is correct (check Supabase Dashboard → Settings → Database)
2. Check network connectivity: `ping db.YOUR_PROJECT.supabase.co`
3. Ensure IP is whitelisted (Supabase allows all by default)
4. Try from Supabase's SQL Editor to verify connectivity

### Migration Errors

If migration fails:

```bash
# Check migration status
npx prisma migrate status

# Reset database (⚠️ DELETES ALL DATA)
npx prisma migrate reset --force

# Re-run migrations
npm run prisma:migrate -- --name init
```

### Prisma Type Generation

If TypeScript doesn't recognize types:

```bash
npx prisma generate
```

---

## Feature Flags

Control features per environment via `FEATURE_*` environment variables:

### Development

```bash
FEATURE_VERBOSE_LOGGING_ENABLED=true      # Debug logging
FEATURE_MOCK_GINKGO_API_ENABLED=true      # Test without real API
FEATURE_ESP_ENABLED=false                 # Disable email service
```

### Production

```bash
FEATURE_VERBOSE_LOGGING_ENABLED=false     # Production-level logging
FEATURE_MOCK_GINKGO_API_ENABLED=false     # Real API calls
FEATURE_ESP_ENABLED=false                 # Enable when ready
```

See `lib/featureFlags.ts` and `docs/SECURITY.md` for all available flags.

---

## Security Checklist

- [ ] `ENCRYPTION_KEY` is unique per environment (not shared across dev/staging/prod)
- [ ] `.env.local` and `.env.*.local` are in `.gitignore`
- [ ] Database password is secure (generated by Supabase, 20+ chars)
- [ ] Netlify environment variables scoped to appropriate contexts
- [ ] `APP_BASE_URL` uses HTTPS in production
- [ ] `NODE_ENV=production` in production deployments
- [ ] Feature flags default to disabled for security features
- [ ] Database backups are enabled in Supabase
- [ ] Rate limiting is enabled on form submissions
- [ ] CORS is disabled for admin pages

See `docs/SECURITY.md` for complete security guidelines.

---

## Next Steps

1. ✅ Clone repository
2. ✅ Install dependencies
3. ✅ Configure DATABASE_URL in .env.local
4. ✅ Run `npm run prisma:migrate -- --name init`
5. ✅ Verify tables in Supabase dashboard
6. ✅ Configure Netlify environment variables
7. ✅ Deploy to Netlify
8. Test admin onboarding at `https://your-domain/admin/onboard`
9. Create a verification campaign at `https://your-domain/admin/campaigns/new`
10. Test public verification form with generated token

---

## Support

For issues, see:
- `docs/SECURITY.md` - Security guidelines
- Supabase Docs: https://supabase.com/docs
- Next.js Docs: https://nextjs.org/docs
- Prisma Docs: https://www.prisma.io/docs
