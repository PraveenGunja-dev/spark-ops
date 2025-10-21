"""
Script to create a superuser
"""
import asyncio
import sys
from getpass import getpass

# Add parent directory to path
sys.path.insert(0, ".")

from app.db.session import AsyncSessionLocal
from app.models.user import UserRole
from app.schemas.user import UserCreate
from app.services.user_service import UserService


async def create_superuser():
    """Create a superuser interactively"""
    print("=== Create Superuser ===\n")
    
    # Get user input
    email = input("Email: ")
    name = input("Name: ")
    password = getpass("Password: ")
    password_confirm = getpass("Confirm Password: ")
    
    if password != password_confirm:
        print("❌ Passwords do not match!")
        return
    
    # Create user
    async with AsyncSessionLocal() as db:
        # Check if user exists
        existing_user = await UserService.get_by_email(db, email)
        if existing_user:
            print(f"❌ User with email {email} already exists!")
            return
        
        # Create superuser
        user_data = UserCreate(
            email=email,
            name=name,
            password=password,
            role=UserRole.OWNER,
        )
        
        user = await UserService.create(db, user_data)
        user.is_superuser = True
        user.is_verified = True
        
        await db.commit()
        
        print(f"\n✅ Superuser created successfully!")
        print(f"   Email: {user.email}")
        print(f"   Name: {user.name}")
        print(f"   ID: {user.id}")


if __name__ == "__main__":
    asyncio.run(create_superuser())
