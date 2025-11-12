#!/bin/bash
# Setup script for database migration
# Run this on your first Netlify deploy or when needed

echo "🔧 Setting up Ginkgo Stakeholder Portal Database"
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL environment variable is not set"
  echo "Set it in Netlify Dashboard > Settings > Build & Deploy > Environment"
  exit 1
fi

echo "✓ DATABASE_URL is configured"
echo ""

# Generate Prisma types
echo "📦 Generating Prisma types..."
npx prisma generate
if [ $? -ne 0 ]; then
  echo "❌ Failed to generate Prisma types"
  exit 1
fi
echo "✓ Prisma types generated"
echo ""

# Run pending migrations
echo "🔄 Running database migrations..."
npx prisma migrate deploy
if [ $? -ne 0 ]; then
  echo "❌ Migration failed"
  echo ""
  echo "If this is the first deploy, you may need to:"
  echo "1. Go to https://app.supabase.com"
  echo "2. Select your project"
  echo "3. Go to SQL Editor"
  echo "4. Copy SQL from: prisma/migrations/*/migration.sql"
  echo "5. Paste and execute in the SQL Editor"
  exit 1
fi
echo "✓ Database migrations completed"
echo ""

# Verify schema
echo "✅ Database setup complete!"
echo ""
echo "Next steps:"
echo "1. Visit: https://your-domain/admin/onboard"
echo "2. Create your first Tenant"
echo "3. Configure Ginkgo API credentials"
echo "4. Create a verification campaign"
