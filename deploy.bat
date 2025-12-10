@echo off
REM MindSpace Auto-Deploy Script
REM This script commits changes and pushes to GitHub, triggering Vercel deployment

echo ==========================================
echo   MindSpace Auto-Deploy
echo ==========================================
echo.

REM Navigate to project root
cd /d "%~dp0"

REM Check for changes
git status

REM Get commit message from user or use default
set /p commit_msg="Enter commit message (or press Enter for 'Update MindSpace'): "
if "%commit_msg%"=="" set commit_msg=Update MindSpace

echo.
echo Building Core App...
call npm run build --workspace=apps/core

echo.
echo Adding all changes...
git add .

echo.
echo Zipping build for OTA (using tar)...
cd apps/core/dist
tar -a -c -f ../../../apps/landing/public/dist.zip *
cd ../../..

echo.
echo Committing with message: %commit_msg%
git commit -m "%commit_msg%"

echo.
echo Pushing to GitHub...
git push origin main

echo.
echo ==========================================
echo   Deployment triggered!
echo   Vercel will automatically deploy your changes.
echo   Visit your Vercel dashboard to monitor progress.
echo ==========================================
echo.

pause
