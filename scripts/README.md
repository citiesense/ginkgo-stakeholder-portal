# Utility Scripts

This directory contains helper scripts for development and deployment.

## setup-db.sh

Initializes the database with Prisma migrations.

### Usage

**On Netlify (automatic):**

Add to your Netlify `package.json` build command or use Netlify Build Plugins.

**Locally (if Prisma binary downloads work):**

```bash
./scripts/setup-db.sh
```

**On Netlify via Function:**

1. Create a Netlify Function that runs this script
2. Trigger on deploy completion
3. Or set as a Netlify Build Plugin

**Manual via Supabase SQL Editor:**

If the script fails, manually execute migrations:

1. Go to https://app.supabase.com
2. Select your project
3. Go to SQL Editor
4. Copy SQL from `prisma/migrations/*/migration.sql`
5. Execute in the editor

### What It Does

1. Validates DATABASE_URL is set
2. Generates Prisma types (`npx prisma generate`)
3. Runs pending migrations (`npx prisma migrate deploy`)
4. Prints success message with next steps

### Troubleshooting

- If migration fails, check DATABASE_URL in Netlify environment variables
- Verify database is accessible from Netlify build environment
- Check Supabase project status at https://app.supabase.com
