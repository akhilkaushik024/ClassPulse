@echo off
color 0B
echo ========================================================
echo        Starting ClassPulse Local Development
echo ========================================================
echo.

echo [1/2] Booting FastAPI Backend...
cd backend
start "ClassPulse API Loader" cmd /k "venv2\Scripts\activate.bat && uvicorn main:app --reload --port 8000"
cd ..

echo [2/2] Booting React Vite Frontend...
cd frontend
start "ClassPulse React App" cmd /k "npm run dev"
cd ..

echo.
echo ========================================================
echo Core systems successfully spun up in background workers!
echo The React Dashboard will be available at http://localhost:5173
echo ========================================================
