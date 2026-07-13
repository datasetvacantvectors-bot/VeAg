#!/bin/bash

# VeAg Server - Seed Crops Script
# This script seeds the database with default crops

echo "🌾 Seeding VeAg database with default crops..."

# Check if server is running
SERVER_URL="${SERVER_URL:-http://localhost:5000}"

# Make POST request to seed endpoint
RESPONSE=$(curl -s -X POST "$SERVER_URL/api/crops/seed" \
  -H "Content-Type: application/json" \
  -w "\n%{http_code}")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" -eq 200 ]; then
    echo "✅ Success! Crops seeded successfully."
    echo "$BODY"
else
    echo "❌ Error: Failed to seed crops (HTTP $HTTP_CODE)"
    echo "$BODY"
    exit 1
fi

echo ""
echo "Default crops added:"
echo "  - Rice"
echo "  - Wheat"
echo "  - Maize"
echo ""
echo "You can verify by visiting: $SERVER_URL/api/crops"