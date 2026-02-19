@echo off
setlocal

echo.
echo ===================================================
echo   CodeWorks 3.0 - Startup Script
echo ===================================================
echo.

:: Check for .env file
if not exist "backend\.env" (
    echo [WARNING] backend/.env file not found.
    echo Please create it based on backend/.env.example
    timeout /t 5
)

:: Check for virtual environment
if exist ".venv\Scripts\activate.bat" (
    echo [INFO] Activating virtual environment...
    set "PYTHON_EXEC=..\.venv\Scripts\python.exe"
) else (
    echo [INFO] No .venv found, using system python.
    set "PYTHON_EXEC=python"
)

echo [INFO] Starting CodeWorks Backend...
start "CodeWorks - Backend" cmd /k "cd backend && %PYTHON_EXEC% -m pip install -r requirements.txt && %PYTHON_EXEC% -m uvicorn main:app --reload"

timeout /t 3 >nul

echo [INFO] Starting CodeWorks Frontend (React)...
start "CodeWorks - Frontend" cmd /k "cd frontend-react && npm install && npm run dev"

echo.
echo ===================================================
echo   System is starting up...
echo   Backend:   http://localhost:8000
echo   Frontend:  http://localhost:5173
echo ===================================================
echo.

timeout /t 5 >nul
start http://localhost:5173

echo [SUCCESS] Startup process initiated.
echo Close the individual terminal windows to stop the services.
echo.
pause
