"""
Collaboration Manager Service
Manages multi-agent collaboration sessions, communication, and shared context
"""

import logging
import uuid
from typing import Dict, List, Any, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy.dialects.postgresql import UUID

from app.models.collaboration import MultiAgentCollaboration
from app.models.agent import Agent
from app.services.apa.context_manager import ContextManager
from app.services.apa.vector_store import VectorStore
from app.core.config import settings

logger = logging.getLogger(__name__)


class CollaborationManager:
    """
    Manages multi-agent collaboration sessions, including:
    - Creating and tracking collaboration sessions
    - Managing shared context between agents
    - Facilitating agent-to-agent communication
    - Supporting different collaboration patterns (sequential, parallel, hierarchical)
    """

    def __init__(
        self,
        db: Session,
        context_manager: Optional[ContextManager] = None,
        vector_store: Optional[VectorStore] = None,
    ):
        self.db = db
        self.context_manager = context_manager
        self.vector_store = vector_store

    async def create_collaboration(
        self,
        run_id: uuid.UUID,
        coordinator_agent_id: uuid.UUID,
        participant_agent_ids: List[uuid.UUID],
        collaboration_type: str,
        initial_context: Optional[Dict[str, Any]] = None,
    ) -> MultiAgentCollaboration:
        """
        Create a new multi-agent collaboration session
        
        Args:
            run_id: The workflow execution ID
            coordinator_agent_id: The agent coordinating the collaboration
            participant_agent_ids: List of participating agent IDs
            collaboration_type: Type of collaboration (sequential, parallel, hierarchical)
            initial_context: Initial shared context for the collaboration
            
        Returns:
            The created collaboration session
        """
        # Validate collaboration type
        valid_types = ["sequential", "parallel", "hierarchical"]
        if collaboration_type not in valid_types:
            raise ValueError(f"Invalid collaboration type: {collaboration_type}. Must be one of {valid_types}")
        
        # Validate agents exist
        coordinator = self.db.query(Agent).filter(Agent.id == coordinator_agent_id).first()
        if not coordinator:
            raise ValueError(f"Coordinator agent {coordinator_agent_id} not found")
        
        # Create collaboration session
        collaboration = MultiAgentCollaboration(
            run_id=run_id,
            coordinator_agent_id=coordinator_agent_id,
            participant_agent_ids=participant_agent_ids,
            collaboration_type=collaboration_type,
            shared_context=initial_context or {},
            communication_log=[],
            status="active",
        )
        
        self.db.add(collaboration)
        self.db.commit()
        self.db.refresh(collaboration)
        
        logger.info(f"Created collaboration session {collaboration.id} with {len(participant_agent_ids)} participants")
        return collaboration

    async def get_collaboration(self, collaboration_id: uuid.UUID) -> Optional[MultiAgentCollaboration]:
        """Get a collaboration session by ID"""
        return self.db.query(MultiAgentCollaboration).filter(MultiAgentCollaboration.id == collaboration_id).first()

    async def get_active_collaborations_for_run(self, run_id: uuid.UUID) -> List[MultiAgentCollaboration]:
        """Get all active collaboration sessions for a run"""
        return self.db.query(MultiAgentCollaboration).filter(
            MultiAgentCollaboration.run_id == run_id,
            MultiAgentCollaboration.status == "active"
        ).all()

    async def update_shared_context(
        self,
        collaboration_id: uuid.UUID,
        context_updates: Dict[str, Any],
        agent_id: Optional[uuid.UUID] = None,
    ) -> MultiAgentCollaboration:
        """
        Update the shared context for a collaboration session
        
        Args:
            collaboration_id: The collaboration session ID
            context_updates: Dictionary of context updates to merge
            agent_id: The agent making the update (for logging)
            
        Returns:
            The updated collaboration session
        """
        collaboration = await self.get_collaboration(collaboration_id)
        if not collaboration:
            raise ValueError(f"Collaboration {collaboration_id} not found")
        
        # Merge updates with existing context
        updated_context = {**collaboration.shared_context, **context_updates}
        collaboration.shared_context = updated_context
        
        # Generate embedding for the updated context if vector store is available
        if self.vector_store:
            try:
                # Convert context to string for embedding generation
                context_str = str(updated_context)
                embedding = await self.vector_store.generate_embedding(context_str)
                collaboration.context_embedding = embedding
                logger.info(f"Generated embedding for collaboration {collaboration_id} context")
            except Exception as e:
                logger.error(f"Failed to generate context embedding: {str(e)}")
        
        # Log the update if agent_id provided
        if agent_id:
            agent_info = self.db.query(Agent.name).filter(Agent.id == agent_id).first()
            agent_name = agent_info[0] if agent_info else str(agent_id)
            
            # Add to communication log
            collaboration.communication_log.append({
                "timestamp": datetime.utcnow().isoformat(),
                "type": "context_update",
                "agent_id": str(agent_id),
                "agent_name": agent_name,
                "content": f"Updated shared context with keys: {list(context_updates.keys())}",
            })
        
        self.db.commit()
        self.db.refresh(collaboration)
        return collaboration

    async def add_message(
        self,
        collaboration_id: uuid.UUID,
        from_agent_id: uuid.UUID,
        content: str,
        to_agent_id: Optional[uuid.UUID] = None,
        message_type: str = "message",
    ) -> MultiAgentCollaboration:
        """
        Add a message to the collaboration communication log
        
        Args:
            collaboration_id: The collaboration session ID
            from_agent_id: The agent sending the message
            content: The message content
            to_agent_id: The recipient agent (None for broadcast)
            message_type: Type of message (message, question, response, etc.)
            
        Returns:
            The updated collaboration session
        """
        collaboration = await self.get_collaboration(collaboration_id)
        if not collaboration:
            raise ValueError(f"Collaboration {collaboration_id} not found")
        
        # Get agent names for better logging
        from_agent = self.db.query(Agent.name).filter(Agent.id == from_agent_id).first()
        from_name = from_agent[0] if from_agent else str(from_agent_id)
        
        to_name = None
        if to_agent_id:
            to_agent = self.db.query(Agent.name).filter(Agent.id == to_agent_id).first()
            to_name = to_agent[0] if to_agent else str(to_agent_id)
        
        # Create message entry
        message = {
            "timestamp": datetime.utcnow().isoformat(),
            "type": message_type,
            "from_agent_id": str(from_agent_id),
            "from_agent_name": from_name,
            "content": content,
        }
        
        if to_agent_id:
            message["to_agent_id"] = str(to_agent_id)
            message["to_agent_name"] = to_name
        
        # Add to communication log
        if not collaboration.communication_log:
            collaboration.communication_log = []
        
        collaboration.communication_log.append(message)
        
        self.db.commit()
        self.db.refresh(collaboration)
        return collaboration

    async def get_messages(
        self,
        collaboration_id: uuid.UUID,
        agent_id: Optional[uuid.UUID] = None,
        message_types: Optional[List[str]] = None,
        limit: int = 50,
    ) -> List[Dict[str, Any]]:
        """
        Get messages from the collaboration communication log
        
        Args:
            collaboration_id: The collaboration session ID
            agent_id: Filter messages to/from this agent
            message_types: Filter by message types
            limit: Maximum number of messages to return
            
        Returns:
            List of messages
        """
        collaboration = await self.get_collaboration(collaboration_id)
        if not collaboration:
            raise ValueError(f"Collaboration {collaboration_id} not found")
        
        messages = collaboration.communication_log
        
        # Apply filters
        if agent_id:
            agent_id_str = str(agent_id)
            messages = [
                m for m in messages if 
                m.get("from_agent_id") == agent_id_str or 
                m.get("to_agent_id") == agent_id_str or
                m.get("to_agent_id") is None  # Broadcast messages
            ]
        
        if message_types:
            messages = [m for m in messages if m.get("type") in message_types]
        
        # Sort by timestamp (newest first) and limit
        messages.sort(key=lambda m: m.get("timestamp", ""), reverse=True)
        return messages[:limit]

    async def complete_collaboration(
        self,
        collaboration_id: uuid.UUID,
        status: str = "completed",
        output: Optional[Dict[str, Any]] = None,
    ) -> MultiAgentCollaboration:
        """
        Mark a collaboration session as completed
        
        Args:
            collaboration_id: The collaboration session ID
            status: Final status (completed, failed)
            output: Optional output data to store in context
            
        Returns:
            The updated collaboration session
        """
        collaboration = await self.get_collaboration(collaboration_id)
        if not collaboration:
            raise ValueError(f"Collaboration {collaboration_id} not found")
        
        # Update status and completion time
        collaboration.status = status
        collaboration.completed_at = datetime.utcnow()
        
        # Add output to shared context if provided
        if output:
            collaboration.shared_context["output"] = output
        
        self.db.commit()
        self.db.refresh(collaboration)
        
        logger.info(f"Completed collaboration {collaboration_id} with status: {status}")
        return collaboration

    async def store_collaboration_memory(
        self,
        collaboration_id: uuid.UUID,
        summary: str,
    ) -> bool:
        """
        Store collaboration summary in vector database for future reference
        
        Args:
            collaboration_id: The collaboration session ID
            summary: Summary of the collaboration
            
        Returns:
            Success status
        """
        if not self.vector_store:
            logger.warning("Vector store not available, skipping memory storage")
            return False
        
        collaboration = await self.get_collaboration(collaboration_id)
        if not collaboration:
            raise ValueError(f"Collaboration {collaboration_id} not found")
        
        # Create memory entry
        memory_data = {
            "collaboration_id": str(collaboration_id),
            "run_id": str(collaboration.run_id),
            "coordinator_agent_id": str(collaboration.coordinator_agent_id),
            "collaboration_type": collaboration.collaboration_type,
            "participant_count": len(collaboration.participant_agent_ids),
            "status": collaboration.status,
            "summary": summary,
            "timestamp": datetime.utcnow().isoformat(),
        }
        
        # Store in vector database
        try:
            await self.vector_store.store_memory(
                memory_id=str(uuid.uuid4()),  # Generate a unique ID for this memory
                content=summary,
                metadata=memory_data,
                embedding=collaboration.context_embedding,  # Use the existing context embedding if available
            )
            logger.info(f"Stored collaboration {collaboration_id} memory in vector database")
            return True
        except Exception as e:
            logger.error(f"Failed to store collaboration memory: {str(e)}")
            return False
            
    async def find_similar_collaborations(
        self,
        context_query: str,
        limit: int = 5,
        filter_metadata: Optional[Dict[str, Any]] = None,
    ) -> List[Dict[str, Any]]:
        """
        Find similar collaborations based on context similarity
        
        Args:
            context_query: Query text to match against collaboration contexts
            limit: Maximum number of results to return
            filter_metadata: Optional metadata filters
            
        Returns:
            List of similar collaborations with similarity scores
        """
        if not self.vector_store:
            logger.warning("Vector store not available, skipping similarity search")
            return []
        
        try:
            # Search for similar memories in vector database
            similar_memories = await self.vector_store.search_similar(
                query=context_query,
                limit=limit,
                filter_metadata=filter_metadata,
            )
            
            # Extract collaboration IDs from results
            results = []
            for memory in similar_memories:
                collaboration_id = memory.get("metadata", {}).get("collaboration_id")
                if collaboration_id:
                    # Get full collaboration data
                    collaboration = await self.get_collaboration(uuid.UUID(collaboration_id))
                    if collaboration:
                        results.append({
                            "collaboration": collaboration,
                            "similarity_score": memory.get("score", 0.0),
                            "summary": memory.get("metadata", {}).get("summary", ""),
                        })
            
            return results
        except Exception as e:
            logger.error(f"Failed to search for similar collaborations: {str(e)}")
            return []