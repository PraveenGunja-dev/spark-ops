"""
Database setup script - creates the sparkops database
"""
import sys
import psycopg
from psycopg import sql

def create_database():
    """Create the sparkops database"""
    # Get credentials from user
    print("PostgreSQL Database Setup")
    print("=" * 50)
    
    username = input("PostgreSQL username (default: postgres): ").strip() or "postgres"
    password = input(f"PostgreSQL password for '{username}': ").strip()
    host = input("PostgreSQL host (default: localhost): ").strip() or "localhost"
    port = input("PostgreSQL port (default: 5432): ").strip() or "5432"
    db_name = input("Database name to create (default: sparkops): ").strip() or "sparkops"
    
    print(f"\nAttempting to connect to PostgreSQL at {host}:{port}...")
    
    try:
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
                print(f"\n⚠ Database '{db_name}' already exists!")
                response = input("Drop and recreate? (yes/no): ").strip().lower()
                if response == 'yes':
                    print(f"Dropping database '{db_name}'...")
                    cur.execute(sql.SQL("DROP DATABASE {}").format(sql.Identifier(db_name)))
                    print(f"Creating database '{db_name}'...")
                    cur.execute(sql.SQL("CREATE DATABASE {}").format(sql.Identifier(db_name)))
                    print(f"✓ Database '{db_name}' recreated successfully!")
                else:
                    print("Skipping database creation.")
            else:
                print(f"Creating database '{db_name}'...")
                cur.execute(sql.SQL("CREATE DATABASE {}").format(sql.Identifier(db_name)))
                print(f"✓ Database '{db_name}' created successfully!")
        
        conn.close()
        
        # Print connection string
        print("\n" + "=" * 50)
        print("Database setup complete!")
        print("\nAdd this to your .env file:")
        print("-" * 50)
        print(f"DATABASE_URL=postgresql+psycopg://{username}:{password}@{host}:{port}/{db_name}")
        print("-" * 50)
        
        return True
        
    except psycopg.OperationalError as e:
        print(f"\n✗ Connection failed: {e}")
        print("\nPlease check:")
        print("  1. PostgreSQL server is running")
        print("  2. Username and password are correct")
        print("  3. Host and port are correct")
        print("  4. User has permission to create databases")
        return False
    except Exception as e:
        print(f"\n✗ Error: {e}")
        return False


if __name__ == "__main__":
    success = create_database()
    sys.exit(0 if success else 1)
