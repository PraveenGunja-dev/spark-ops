"""
Seed templates data

Run this script to populate the templates table with initial data
"""

import sys
import os
from pathlib import Path

# Fix for Windows asyncio event loop
if sys.platform == 'win32':
    import asyncio
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

import asyncio
from app.db.session import AsyncSessionLocal
from app.models.template import Template


async def seed_templates():
    """Seed initial template data"""
    async with AsyncSessionLocal() as db:
        try:
            # Check if templates already exist
            from sqlalchemy import select
            result = await db.execute(select(Template))
            existing_count = len(result.scalars().all())
            
            if existing_count > 0:
                print(f"Templates already exist ({existing_count} templates). Skipping seed.")
                return
            
            # Initial template data (matching mock data from StudioTemplates.tsx)
            templates_data = [
                {
                    "name": "Invoice Processing",
                    "description": "Extract data from invoices and update accounting system",
                    "category": "Finance",
                    "downloads": 1234,
                    "rating": 4.8,
                },
                {
                    "name": "Email Classifier",
                    "description": "Automatically categorize and route incoming emails",
                    "category": "Communication",
                    "downloads": 892,
                    "rating": 4.6,
                },
                {
                    "name": "Lead Generation",
                    "description": "Scrape and qualify leads from multiple sources",
                    "category": "Sales",
                    "downloads": 2145,
                    "rating": 4.9,
                },
                {
                    "name": "Report Generator",
                    "description": "Generate weekly reports from multiple data sources",
                    "category": "Analytics",
                    "downloads": 567,
                    "rating": 4.5,
                },
                {
                    "name": "Customer Onboarding",
                    "description": "Automate customer onboarding workflow and notifications",
                    "category": "HR",
                    "downloads": 778,
                    "rating": 4.7,
                },
                {
                    "name": "Data Backup",
                    "description": "Schedule and verify automated data backups",
                    "category": "IT",
                    "downloads": 445,
                    "rating": 4.4,
                },
            ]
            
            # Create template objects
            templates = [Template(**data) for data in templates_data]
            
            # Add to database
            db.add_all(templates)
            await db.commit()
            
            print(f"✅ Successfully seeded {len(templates)} templates")
            
            for template in templates:
                print(f"  - {template.name} ({template.category})")
        
        except Exception as e:
            print(f"❌ Error seeding templates: {e}")
            await db.rollback()
            raise


if __name__ == "__main__":
    print("Seeding templates...")
    asyncio.run(seed_templates())
    print("Done!")
