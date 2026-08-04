@echo off
echo ====================================================================
echo ATMOSPHERE WEATHER DASHBOARD - LOCAL RUNNER
echo ====================================================================
echo.
echo LIVE URL (Vercel): https://atmosphere-xi.vercel.app/
echo API URL (Render):  https://atmosphere-4o4b.onrender.com
echo.
echo Starting Backend (FastAPI) on Port 8000...
start cmd /k "cd backend && venv\Scripts\activate && uvicorn main:app --reload --port 8000"

echo Starting Frontend (Next.js) on Port 3000...
start cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are starting in new windows.
echo Frontend will be available at: http://localhost:3000
echo Backend will be available at:  http://localhost:8000
echo.
pause
