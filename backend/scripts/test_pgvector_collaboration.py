#!/usr/bin/env python
"""
Test script for pgvector integration with collaboration manager
"""

import asyncio
import uuid
import sys
import os
from datetime import datetime

# Add the parent directory to the path so we can import the app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.services.apa.vector_store import VectorStore
from app.services.apa.context_manager import ContextManager
from app.services.apa.collaboration_manager import CollaborationManager
from app.models.agent import Agent


async def test_collaboration_with_pgvector():
    """Test pgvector integration with collaboration manager"""
    print("\n=== Testing pgvector integration with collaboration manager ===")
    
    # Create database session
    db = SessionLocal()
    
    try:
        # Initialize services
        vector_store = VectorStore(store_type="pgvector", db_session=db)
        context_manager = ContextManager(db, vector_store=vector_store)
        collaboration_manager = CollaborationManager(
            db=db,
            context_manager=context_manager,
            vector_store=vector_store,
        )
        
        # Get or create test agents
        coordinator = db.query(Agent).first()
        if not coordinator:
            print("No agents found in database. Please create agents first.")
            return
        
        # Create a test collaboration
        run_id = uuid.uuid4()
        coordinator_id = coordinator.id
        participant_ids = [coordinator.id]  # Using same agent as both coordinator and participant for testing
        
        print(f"Creating test collaboration with run_id: {run_id}")
        collaboration = await collaboration_manager.create_collaboration(
            run_id=run_id,
            coordinator_agent_id=coordinator_id,
            participant_agent_ids=participant_ids,
            collaboration_type="sequential",
            initial_context={"task": "Test pgvector integration"},
        )
        
        print(f"Created collaboration with ID: {collaboration.id}")
        
        # Update context to generate embedding
        print("Updating shared context...")
        updated_collaboration = await collaboration_manager.update_shared_context(
            collaboration_id=collaboration.id,
            context_updates={
                "status": "in_progress",
                "current_step": 1,
                "description": "This is a test collaboration to verify pgvector integration",
            },
            agent_id=coordinator_id,
        )
        
        print(f"Context updated, embedding generated: {updated_collaboration.context_embedding is not None}")
        
        # Add a test message
        print("Adding test message...")
        await collaboration_manager.add_message(
            collaboration_id=collaboration.id,
            from_agent_id=coordinator_id,
            content="This is a test message for pgvector integration",
            message_type="message",
        )
        
        # Complete the collaboration with summary
        print("Completing collaboration...")
        await collaboration_manager.complete_collaboration(
            collaboration_id=collaboration.id,
            status="completed",
            output={"result": "Test successful"},
        )
        
        # Store collaboration memory
        print("Storing collaboration memory...")
        memory_stored = await collaboration_manager.store_collaboration_memory(
            collaboration_id=collaboration.id,
            summary="This was a test collaboration to verify pgvector integration with the collaboration manager",
        )
        print(f"Memory stored: {memory_stored}")
        
        # Test similarity search
        print("\nTesting similarity search...")
        similar_collaborations = await collaboration_manager.find_similar_collaborations(
            context_query="pgvector integration test",
            limit=5,
        )
        
        print(f"Found {len(similar_collaborations)} similar collaborations:")
        for i, result in enumerate(similar_collaborations):
            print(f"  {i+1}. ID: {result['collaboration'].id}, Score: {result['similarity_score']:.4f}")
            print(f"     Summary: {result['summary']}")
        
        print("\n=== Test completed successfully ===")
        
    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        db.close()


if __name__ == "__main__":
    asyncio.run(test_collaboration_with_pgvector())