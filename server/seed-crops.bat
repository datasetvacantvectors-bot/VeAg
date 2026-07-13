@echo off
REM VeAg Server - Seed Crops Script (Windows)
REM This script seeds the database with default crops

echo.
echo 🌾 Seeding VeAg database with default crops...
echo.

REM Set server URL (default to localhost:5000)
if not defined SERVER_URL set SERVER_URL=http://localhost:5000

REM Make POST request to seed endpoint
curl -X POST "%SERVER_URL%/api/crops/seed" -H "Content-Type: application/json"

echo.
echo.
echo Default crops added:
echo   - Rice
echo   - Wheat
echo   - Maize
echo.
echo You can verify by visiting: %SERVER_URL%/api/crops
echo.