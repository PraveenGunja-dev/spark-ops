"""
Context Manager - Manages shared context and agent memory for APA
"""
import uuid
from typing import Dict, List, Any, Optional
from datetime import datetime
from sqlalchemy.orm import Session

from app.models import AgentMemory
from app.services.apa.vector_store import VectorStore


class ContextManager:
    """
    Context Manager for agent execution context and memory
    
    Responsibilities:
    - Load and manage execution context
    - Store and retrieve agent memory
    - Maintain shared knowledge across agents
    - Handle vector-based semantic memory search
    """
    
    def __init__(self, db: Session, vector_store: Optional[VectorStore] = None):
        self.db = db
        self.vector_store = vector_store or VectorStore()
    
    async def load_context(
        self,
        agent_id: uuid.UUID,
        execution_id: uuid.UUID,
        task: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Load execution context for an agent
        
        Args:
            agent_id: The agent ID
            execution_id: The workflow execution ID
            task: The task to execute
        
        Returns:
            Context dictionary with relevant information
        """
        context = {
            "agent_id": str(agent_id),
            "execution_id": str(execution_id),
            "task": task,
            "timestamp": datetime.utcnow().isoformat(),
            "relevant_memories": [],
            "shared_knowledge": {},
        }
        
        # Load relevant memories from agent's long-term memory
        relevant_memories = await self.retrieve_relevant_memories(
            agent_id=agent_id,
            query=task.get("description", ""),
            limit=5,
        )
        context["relevant_memories"] = relevant_memories
        
        return context
    
    async def update_context(
        self,
        context: Dict[str, Any],
        action: Dict[str, Any],
        observation: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Update context with new action and observation
        
        Args:
            context: Current context
            action: Action taken
            observation: Observation from action
        
        Returns:
            Updated context
        """
        if "action_history" not in context:
            context["action_history"] = []
        
        context["action_history"].append({
            "action": action,
            "observation": observation,
            "timestamp": datetime.utcnow().isoformat(),
        })
        
        # Update shared knowledge if needed
        if observation.get("status") == "success":
            result = observation.get("result")
            if result:
                context["shared_knowledge"][action.get("type", "unknown")] = result
        
        return context
    
    async def store_memory(
        self,
        agent_id: uuid.UUID,
        content: str,
        memory_type: str = "episodic",
        metadata: Optional[Dict[str, Any]] = None,
        importance_score: Optional[float] = None,
    ) -> AgentMemory:
        """
        Store a memory in agent's long-term memory
        
        Args:
            agent_id: The agent ID
            content: Memory content
            memory_type: Type of memory (episodic, semantic, procedural)
            metadata: Additional metadata
            importance_score: Importance score (0.0-1.0)
        
        Returns:
            Created memory record
        """
        # Generate embedding using vector store
        embedding_vector = await self.vector_store.generate_embedding(content)
        
        # Convert to list for PostgreSQL array storage
        embedding = embedding_vector if embedding_vector else None
        
        memory = AgentMemory(
            agent_id=agent_id,
            memory_type=memory_type,
            content=content,
            embedding=embedding,
            metadata_=metadata or {},
            importance_score=importance_score,
        )
        
        self.db.add(memory)
        self.db.commit()
        self.db.refresh(memory)
        
        # Also store in vector database for fast semantic search
        if self.vector_store:
            await self.vector_store.store_memory(
                memory_id=str(memory.id),
                content=content,
                metadata={
                    "agent_id": str(agent_id),
                    "memory_type": memory_type,
                    "importance_score": importance_score or 0.0,
                    "created_at": memory.created_at.isoformat(),
                    **(metadata or {}),
                },
                embedding=embedding,
            )
        
        return memory
    
    async def retrieve_relevant_memories(
        self,
        agent_id: uuid.UUID,
        query: str,
        limit: int = 5,
    ) -> List[Dict[str, Any]]:
        """
        Retrieve relevant memories using semantic search
        
        Args:
            agent_id: The agent ID
            query: Search query
            limit: Maximum number of memories to return
        
        Returns:
            List of relevant memories
        """
        # Use vector store for semantic search if available
        if self.vector_store:
            try:
                results = await self.vector_store.search_similar(
                    query=query,
                    limit=limit,
                    filter_metadata={"agent_id": str(agent_id)},
                )
                
                return [
                    {
                        "content": result["content"],
                        "type": result["metadata"].get("memory_type", "episodic"),
                        "importance": result["metadata"].get("importance_score", 0.0),
                        "similarity_score": result["score"],
                        "created_at": result["metadata"].get("created_at", ""),
                    }
                    for result in results
                ]
            except Exception as e:
                print(f"Vector search error: {e}, falling back to recent memories")
        
        # Fallback to recent memories from database
        memories = (
            self.db.query(AgentMemory)
            .filter(AgentMemory.agent_id == agent_id)
            .order_by(AgentMemory.created_at.desc())
            .limit(limit)
            .all()
        )
        
        return [
            {
                "content": memory.content,
                "type": memory.memory_type,
                "importance": memory.importance_score,
                "created_at": memory.created_at.isoformat(),
            }
            for memory in memories
        ]
    
    async def update_memory_access(
        self,
        memory_id: uuid.UUID,
    ) -> None:
        """
        Update memory access tracking
        
        Args:
            memory_id: The memory ID
        """
        memory = self.db.query(AgentMemory).filter(AgentMemory.id == memory_id).first()
        if memory:
            memory.access_count += 1
            memory.last_accessed_at = datetime.utcnow()
            self.db.commit()
    
    async def get_shared_context(
        self,
        execution_id: uuid.UUID,
    ) -> Dict[str, Any]:
        """
        Get shared context for multi-agent collaboration
        
        Args:
            execution_id: The workflow execution ID
        
        Returns:
            Shared context dictionary
        """
        # TODO: Implement shared context storage and retrieval
        # This will be used for multi-agent collaboration
        
        return {
            "execution_id": str(execution_id),
            "shared_state": {},
            "communication_log": [],
        }
    
    async def update_shared_context(
        self,
        execution_id: uuid.UUID,
        updates: Dict[str, Any],
    ) -> None:
        """
        Update shared context
        
        Args:
            execution_id: The workflow execution ID
            updates: Updates to apply
        """
        # TODO: Implement shared context updates
        pass
