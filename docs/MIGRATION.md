# Database Migration Guide

## Overview

This guide covers running Prisma migrations to set up your Supabase PostgreSQL database.

---

## Migration Process

### What Happens During Migration

When you run a migration:

1. Prisma reads pending migrations from `prisma/migrations/`
2. Connects to your database using `DATABASE_URL`
3. Executes SQL to create tables, indexes, and foreign keys
4. Records migration in `_prisma_migrations` table
5. Generates TypeScript types in `node_modules/.prisma/client/`

### Initial Migration

The initial migration creates all core tables:

- `Tenant` - Multi-tenant accounts
- `VerificationCampaign` - Contact verification campaigns
- `VerificationRecipient` - Campaign recipients with verification tokens
- `VerificationEvent` - Audit trail of form submissions and actions
- `ContactChangeSet` - Before/after snapshots of contact data
- `EspConnection` - Email service provider credentials (encrypted)

---

## Running Migrations

### Local Development (Requires Prisma Binary Access)

If you have network access to download Prisma binaries:

```bash
# Run pending migrations
npm run prisma:migrate -- --name init

# View migration status
npx prisma migrate status

# View database with GUI
npx prisma studio
```

### On Netlify (Automatic)

Netlify builds will automatically handle migrations:

1. During `npm run build`, Prisma generates types
2. You can add a `postbuild` hook to run migrations:

Add to `package.json`:

```json
{
  "scripts": {
    "build": "next build",
    "postbuild": "npx prisma migrate deploy"
  }
}
```

Or use Netlify build plugins to run migrations before/after the build.

### Manual Migration (No Binary Download)

If Prisma binaries won't download in your environment:

1. Run migrations on **Netlify** during the build process
2. Or use Supabase's **SQL Editor** to manually execute migration SQL:

Go to https://app.supabase.com → Your Project → SQL Editor

```sql
-- Run the migration SQL from prisma/migrations/[timestamp]_init/migration.sql
-- Copy the entire SQL file contents into the editor and execute
```

---

## Migration Files Location

All migration SQL files are stored in:

```
prisma/migrations/
├── 20240101000000_init/
│   └── migration.sql
└── _migration_lock.toml
```

---

## Troubleshooting

### "Cannot find migration lock file"

This happens on first run. It will be created automatically by Prisma.

### "Database already contains schema"

If tables already exist:

```bash
# View current migration status
npx prisma migrate status

# This shows which migrations have been applied
```

### "PrismaClientValidationError: PrismaClient cannot be imported"

Prisma types need to be generated:

```bash
npx prisma generate
```

---

## Verification

After migration completes, verify tables were created:

### Using Supabase Dashboard

1. Go to https://app.supabase.com
2. Select your project
3. Click **SQL Editor**
4. Run:

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see:
- ContactChangeSet
- EspConnection
- Tenant
- VerificationCampaign
- VerificationEvent
- VerificationRecipient

### Using psql CLI

```bash
psql "postgresql://postgres:YOUR_PASSWORD@db.[YOUR_PROJECT_ID].supabase.co:5432/postgres" \
  -c "\dt"
```

Should list all 6 tables.

---

## Next Steps

After migration:

1. ✅ Verify tables exist in Supabase
2. Go to `http://localhost:3000/admin/onboard`
3. Create your first Tenant (company account)
4. Configure Ginkgo API credentials
5. Create a verification campaign
6. Test the public form with a generated token

---

## Important Notes

⚠️ **Do NOT run migrations in production without testing in staging first**

- Always test on a staging database first
- Keep backups of production database
- Migrations are applied in order (timestamp in folder name)
- Rollback requires manual SQL or database snapshot restore
