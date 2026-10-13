@echo off
echo ========================================================
echo   GAME HUB - Hybrid E-Commerce ^& C2C Barter Platform
echo   IT32053 - Horizon Campus
echo ========================================================
echo.
echo [1/2] Starting Backend API Server on Port 5000...
start "Game Hub Backend API (Port 5000)" cmd /k "cd backend && npm start"

echo [2/2] Starting Frontend Vite Server on Port 5173...
start "Game Hub Frontend (Port 5173)" cmd /k "cd frontend && npm run dev"

echo.
echo Application started successfully!
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo.
pause
