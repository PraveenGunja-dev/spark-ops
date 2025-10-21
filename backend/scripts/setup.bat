@echo off
echo ========================================
echo Spark-Ops Control Plane Setup
echo ========================================
echo.

echo Step 1: Creating virtual environment...
python -m venv venv
if errorlevel 1 (
    echo ERROR: Failed to create virtual environment
    pause
    exit /b 1
)
echo ✓ Virtual environment created
echo.

echo Step 2: Activating virtual environment...
call venv\Scripts\activate
echo ✓ Virtual environment activated
echo.

echo Step 3: Upgrading pip...
python -m pip install --upgrade pip
echo ✓ Pip upgraded
echo.

echo Step 4: Installing requirements...
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install requirements
    pause
    exit /b 1
)
echo ✓ Requirements installed
echo.

echo Step 5: Checking if .env exists...
if not exist .env (
    echo Creating .env from .env.example...
    copy .env.example .env
    echo.
    echo ⚠ WARNING: Please edit .env file with your database credentials!
    echo.
) else (
    echo ✓ .env file already exists
)
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Edit .env file with your PostgreSQL credentials
echo 2. Run: alembic upgrade head
echo 3. Run: uvicorn app.main:app --reload
echo.
echo For detailed instructions, see BACKEND_SETUP_GUIDE.md
echo.
pause
