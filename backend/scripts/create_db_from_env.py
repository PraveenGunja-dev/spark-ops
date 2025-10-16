"""
Create database using credentials from .env file
"""
import sys
import os
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

import psycopg
from psycopg import sql
from app.core.config import settings

def parse_database_url(url: str):
    """Parse PostgreSQL connection URL"""
    # Format: postgresql+psycopg://user:password@host:port/database
    url = url.replace('postgresql+psycopg://', '').replace('postgresql://', '')
    
    # Split credentials and host
    if '@' in url:
        credentials, host_part = url.split('@')
        if ':' in credentials:
            username, password = credentials.split(':', 1)
        else:
            username = credentials
            password = ''
    else:
        raise ValueError("Invalid DATABASE_URL format")
    
    # Split host and database
    if '/' in host_part:
        host_port, database = host_part.split('/', 1)
    else:
        host_port = host_part
        database = 'postgres'
    
    # Split host and port
    if ':' in host_port:
        host, port = host_port.split(':')
    else:
        host = host_port
        port = '5432'
    
    return username, password, host, port, database


def create_database():
    """Create the database from .env configuration"""
    print("Creating PostgreSQL Database from .env configuration")
    print("=" * 60)
    
    try:
        # Parse connection string
        username, password, host, port, db_name = parse_database_url(settings.DATABASE_URL)
        
        print(f"Database: {db_name}")
        print(f"Host: {host}:{port}")
        print(f"User: {username}")
        print(f"\nConnecting to PostgreSQL server...")
        
        # Connect to default postgres database
        conn = psycopg.connect(
            dbname="postgres",
            user=username,
            password=password,
            host=host,
            port=port,
            autocommit=True
        )
        
        print("✓ Connected successfully!")
        
        with conn.cursor() as cur:
            # Check if database exists
            cur.execute(
                "SELECT 1 FROM pg_database WHERE datname = %s",
                (db_name,)
            )
            exists = cur.fetchone()
            
            if exists:
                print(f"\n✓ Database '{db_name}' already exists!")
            else:
                print(f"\nCreating database '{db_name}'...")
                cur.execute(sql.SQL("CREATE DATABASE {}").format(sql.Identifier(db_name)))
                print(f"✓ Database '{db_name}' created successfully!")
        
        conn.close()
        
        print("\n" + "=" * 60)
        print("Database setup complete!")
        print("\nYou can now run:")
        print("  alembic revision --autogenerate -m 'Initial migration'")
        print("  alembic upgrade head")
        print("=" * 60)
        
        return True
        
    except Exception as e:
        print(f"\n✗ Error: {e}")
        print("\nPlease check your DATABASE_URL in the .env file")
        return False


if __name__ == "__main__":
    success = create_database()
    sys.exit(0 if success else 1)
