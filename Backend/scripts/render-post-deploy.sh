#!/bin/bash
# Post-deployment initialization for Render backend
# This runs AFTER npm install and ensures DB tables are created

echo "🚀 Post-deploy: Initializing SHMS database tables..."

# Wait for database to be ready (retry for up to 30 seconds)
for i in {1..30}; do
  if node -e "const db = require('./configs/db'); db.query('SELECT NOW()').then(() => process.exit(0)).catch(() => process.exit(1))"; then
    echo "✅ Database connection established"
    break
  fi
  if [ $i -eq 30 ]; then
    echo "❌ Database connection failed after 30 retries"
    exit 1
  fi
  echo "⏳ Waiting for database... (attempt $i/30)"
  sleep 1
done

# Run table initialization
node createTable.js
if [ $? -eq 0 ]; then
  echo "✅ Database tables initialized successfully"
else
  echo "⚠️  Table initialization script encountered an error (this may be okay if tables already exist)"
fi

# Optionally run seed data (uncomment if you want demo data on every deploy)
# node seed.js
# if [ $? -eq 0 ]; then
#   echo "✅ Seed data loaded successfully"
# fi

echo "🎉 Post-deploy initialization complete"
