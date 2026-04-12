@echo off
echo ==========================================
echo Starting Swaaaappio Full Stack System...
echo ==========================================

:: Start Backend
start cmd /k "echo Starting Backend... && cd skill-barter-backend && uvicorn main:app --reload --host 127.0.0.1 --port 8000"

:: Start Frontend
start cmd /k "echo Starting Frontend... && cd skill-barter-frontend && npm run dev"

echo.
echo Both servers are starting up!
echo Once they are ready:
echo 1. Open your browser to http://localhost:5173
echo 2. Your frontend is now integrated with the backend via a Proxy.
echo.
pause
