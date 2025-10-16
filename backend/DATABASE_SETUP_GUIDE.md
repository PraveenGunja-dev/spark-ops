# PostgreSQL Database Setup Guide

## Current Issue
We're experiencing authentication errors when trying to connect to PostgreSQL.

## Solutions

### Option 1: Find Your Correct Password

1. **Check pgAdmin**:
   - Open pgAdmin 4
   - Look at your saved connection
   - The password might be saved there

2. **Check your PostgreSQL installation notes**:
   - Look for installation documentation
   - Check any setup files or notes you created

### Option 2: Reset PostgreSQL Password

Run this in PowerShell as Administrator:

```powershell
# Method 1: Using ALTER USER (if you can connect)
psql -U postgres -c "ALTER USER postgres PASSWORD 'yournewpassword';"

# Method 2: Using pg_hba.conf trust method
# 1. Find pg_hba.conf (usually in C:\Program Files\PostgreSQL\17\data\pg_hba.conf)
# 2. Edit the file and change this line:
#    FROM: host    all             all             127.0.0.1/32            scram-sha-256
#    TO:   host    all             all             127.0.0.1/32            trust
# 3. Restart PostgreSQL service:
Restart-Service postgresql-x64-17
# 4. Connect without password and reset:
psql -U postgres -h localhost -c "ALTER USER postgres PASSWORD 'newpassword';"
# 5. Change pg_hba.conf back to scram-sha-256
# 6. Restart service again
```

### Option 3: Use Windows Authentication

If your PostgreSQL is set up with Windows Authentication:

1. Update `.env` file:
```env
DATABASE_URL=postgresql+psycopg://localhost:5432/sparkops?gssencmode=disable
```

2. Make sure PostgreSQL service is running under your Windows account

### Option 4: Manual Database Creation via pgAdmin

1. Open pgAdmin 4
2. Connect to your PostgreSQL server
3. Right-click on "Databases"
4. Select "Create" → "Database..."
5. Name it `sparkops`
6. Click "Save"
7. Then update your `.env` with the correct password

### Option 5: Use SQLite for Quick Testing (Not Recommended for Production)

If you just want to test the authentication system quickly:

1. Install SQLite support:
```bash
pip install aiosqlite
```

2. Update `.env`:
```env
DATABASE_URL=sqlite+aiosqlite:///./sparkops.db
```

3. Note: SQLite is only for testing. Use PostgreSQL for production.

## After Database is Created

Once you have the database set up with correct credentials, run:

```bash
# Create migration
alembic revision --autogenerate -m "Add users table with authentication"

# Apply migration
alembic upgrade head

# Start the server
uvicorn app.main:app --reload
```

## Verify Connection

Test your connection with this command:

```bash
python scripts/setup_database.py
```

Enter your credentials when prompted. If successful, you'll see:
```
✓ Connected successfully!
✓ Database 'sparkops' created successfully!
```
