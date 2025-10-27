"""
Vector Store - Semantic memory storage using ChromaDB/Pinecone/pgvector
"""
import os
import uuid
from typing import List, Dict, Any, Optional, Union

# ChromaDB imports
try:
    import chromadb
    from chromadb.config import Settings
    CHROMADB_AVAILABLE = True
except ImportError:
    CHROMADB_AVAILABLE = False

# Pinecone imports (for production)
try:
    from pinecone import Pinecone
    PINECONE_AVAILABLE = True
except ImportError:
    PINECONE_AVAILABLE = False

# OpenAI embeddings
try:
    from openai import AsyncOpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

# SQLAlchemy for pgvector
try:
    from sqlalchemy import text
    from sqlalchemy.ext.asyncio import AsyncSession
    from sqlalchemy.future import select
    PGVECTOR_AVAILABLE = True
except ImportError:
    PGVECTOR_AVAILABLE = False

# Import models
from app.models.agent_reasoning import AgentMemory
from app.models.collaboration import MultiAgentCollaboration


class VectorStore:
    """
    Vector Store for semantic memory using ChromaDB (dev), Pinecone (prod), or pgvector (direct DB)
    
    Responsibilities:
    - Store and retrieve embeddings
    - Semantic similarity search
    - Memory persistence
    """
    
    def __init__(
        self,
        store_type: str = "chromadb",
        collection_name: str = "agent_memory",
        db_session: Optional[AsyncSession] = None,
    ):
        self.store_type = store_type
        self.collection_name = collection_name
        self.db_session = db_session
        
        # Initialize embedding client
        openai_key = os.getenv("OPENAI_API_KEY")
        self.embedding_client = AsyncOpenAI(api_key=openai_key) if openai_key and OPENAI_AVAILABLE else None
        
        # Initialize vector store
        if store_type == "chromadb" and CHROMADB_AVAILABLE:
            self._init_chromadb()
        elif store_type == "pinecone" and PINECONE_AVAILABLE:
            self._init_pinecone()
        elif store_type == "pgvector" and PGVECTOR_AVAILABLE and db_session:
            # No initialization needed for pgvector, just use the db_session
            self.client = None
            self.collection = None
        else:
            self.client = None
            self.collection = None
    
    def _init_chromadb(self) -> None:
        """Initialize ChromaDB client"""
        # Use persistent storage
        persist_directory = os.getenv("CHROMADB_PATH", "./data/chromadb")
        
        self.client = chromadb.Client(Settings(
            persist_directory=persist_directory,
            anonymized_telemetry=False,
        ))
        
        # Get or create collection
        self.collection = self.client.get_or_create_collection(
            name=self.collection_name,
            metadata={"description": "Agent memory storage"}
        )
    
    def _init_pinecone(self) -> None:
        """Initialize Pinecone client (for production)"""
        api_key = os.getenv("PINECONE_API_KEY")
        if not api_key:
            raise ValueError("PINECONE_API_KEY not set")
        
        self.client = Pinecone(api_key=api_key)
        
        # Connect to existing index or create new one
        index_name = os.getenv("PINECONE_INDEX", "agent-memory")
        self.collection = self.client.Index(index_name)
    
    async def generate_embedding(self, text: str, model: str = "text-embedding-3-small") -> List[float]:
        """
        Generate embedding for text using OpenAI
        
        Args:
            text: Text to embed
            model: Embedding model to use
        
        Returns:
            Embedding vector
        """
        if not self.embedding_client:
            # Return mock embedding if OpenAI not available
            return [0.0] * 1536
        
        try:
            response = await self.embedding_client.embeddings.create(
                model=model,
                input=text,
            )
            return response.data[0].embedding
        except Exception as e:
            print(f"Embedding generation error: {e}")
            return [0.0] * 1536
    
    async def store_memory(
        self,
        memory_id: str,
        content: str,
        metadata: Optional[Dict[str, Any]] = None,
        embedding: Optional[List[float]] = None,
    ) -> None:
        """
        Store a memory in the vector store
        
        Args:
            memory_id: Unique memory ID
            content: Memory content
            metadata: Additional metadata
            embedding: Pre-computed embedding (optional)
        """
        if self.store_type == "pgvector" and self.db_session:
            await self._store_memory_pgvector(memory_id, content, metadata, embedding)
            return
            
        if not self.collection:
            print("Vector store not initialized")
            return
        
        # Generate embedding if not provided
        if embedding is None:
            embedding = await self.generate_embedding(content)
        
        # Store in ChromaDB
        if self.store_type == "chromadb":
            self.collection.add(
                ids=[memory_id],
                embeddings=[embedding],
                documents=[content],
                metadatas=[metadata or {}],
            )
        
        # Store in Pinecone
        elif self.store_type == "pinecone":
            self.collection.upsert(
                vectors=[(memory_id, embedding, metadata or {})]
            )
    
    async def _store_memory_pgvector(
        self,
        memory_id: str,
        content: str,
        metadata: Optional[Dict[str, Any]] = None,
        embedding: Optional[List[float]] = None,
    ) -> None:
        """Store memory directly in PostgreSQL using pgvector"""
        if not self.db_session:
            return
            
        # Generate embedding if not provided
        if embedding is None:
            embedding = await self.generate_embedding(content)
            
        # Check if memory exists
        stmt = select(AgentMemory).where(AgentMemory.id == uuid.UUID(memory_id))
        result = await self.db_session.execute(stmt)
        memory = result.scalars().first()
        
        if memory:
            # Update existing memory
            memory.content = content
            memory.embedding = embedding
            memory.metadata_ = metadata or {}
        else:
            # Create new memory (assuming agent_id is in metadata)
            agent_id = metadata.get("agent_id") if metadata else None
            memory_type = metadata.get("memory_type", "semantic") if metadata else "semantic"
            
            if not agent_id:
                raise ValueError("agent_id must be provided in metadata")
                
            memory = AgentMemory(
                id=uuid.UUID(memory_id),
                agent_id=uuid.UUID(agent_id),
                memory_type=memory_type,
                content=content,
                embedding=embedding,
                metadata_=metadata or {},
            )
            self.db_session.add(memory)
            
        await self.db_session.commit()
    
    async def search_similar(
        self,
        query: str,
        limit: int = 5,
        filter_metadata: Optional[Dict[str, Any]] = None,
    ) -> List[Dict[str, Any]]:
        """
        Search for similar memories using semantic search
        
        Args:
            query: Search query
            limit: Maximum number of results
            filter_metadata: Metadata filters
        
        Returns:
            List of similar memories with scores
        """
        if self.store_type == "pgvector" and self.db_session:
            return await self._search_similar_pgvector(query, limit, filter_metadata)
            
        if not self.collection:
            print("Vector store not initialized")
            return []
        
        # Generate query embedding
        query_embedding = await self.generate_embedding(query)
        
        # Search in ChromaDB
        if self.store_type == "chromadb":
            results = self.collection.query(
                query_embeddings=[query_embedding],
                n_results=limit,
                where=filter_metadata,
            )
            
            # Format results
            memories = []
            if results and results["ids"]:
                for i in range(len(results["ids"][0])):
                    memories.append({
                        "id": results["ids"][0][i],
                        "content": results["documents"][0][i] if results["documents"] else "",
                        "metadata": results["metadatas"][0][i] if results["metadatas"] else {},
                        "score": results["distances"][0][i] if results["distances"] else 0.0,
                    })
            
            return memories
        
        # Search in Pinecone
        elif self.store_type == "pinecone":
            results = self.collection.query(
                vector=query_embedding,
                top_k=limit,
                filter=filter_metadata,
                include_metadata=True,
            )
            
            # Format results
            memories = []
            for match in results.get("matches", []):
                memories.append({
                    "id": match.id,
                    "content": match.metadata.get("content", ""),
                    "metadata": match.metadata,
                    "score": match.score,
                })
            
            return memories
        
        return []
    
    async def _search_similar_pgvector(
        self,
        query: str,
        limit: int = 5,
        filter_metadata: Optional[Dict[str, Any]] = None,
    ) -> List[Dict[str, Any]]:
        """Search for similar memories using pgvector"""
        if not self.db_session:
            return []
            
        # Generate query embedding
        query_embedding = await self.generate_embedding(query)
        
        # Build the query
        # Note: Using raw SQL for vector similarity search
        sql = """
        SELECT id, content, metadata_, 1 - (embedding <=> :embedding) as similarity
        FROM agent_memory
        """
        
        # Add filters if provided
        params = {"embedding": query_embedding}
        if filter_metadata:
            conditions = []
            for key, value in filter_metadata.items():
                param_name = f"filter_{key}"
                conditions.append(f"metadata_->>''{key}'' = :{param_name}")
                params[param_name] = value
            
            sql += " WHERE " + " AND ".join(conditions)
        
        # Add order by and limit
        sql += """
        ORDER BY embedding <=> :embedding
        LIMIT :limit
        """
        params["limit"] = limit
        
        # Execute query
        result = await self.db_session.execute(text(sql), params)
        rows = result.fetchall()
        
        # Format results
        memories = []
        for row in rows:
            memories.append({
                "id": str(row.id),
                "content": row.content,
                "metadata": row.metadata_,
                "score": float(row.similarity),
            })
            
        return memories
    
    async def delete_memory(self, memory_id: str) -> None:
        """
        Delete a memory from the vector store
        
        Args:
            memory_id: Memory ID to delete
        """
        if self.store_type == "pgvector" and self.db_session:
            stmt = select(AgentMemory).where(AgentMemory.id == uuid.UUID(memory_id))
            result = await self.db_session.execute(stmt)
            memory = result.scalars().first()
            
            if memory:
                await self.db_session.delete(memory)
                await self.db_session.commit()
            return
            
        if not self.collection:
            return
        
        if self.store_type == "chromadb":
            self.collection.delete(ids=[memory_id])
        elif self.store_type == "pinecone":
            self.collection.delete(ids=[memory_id])
    
    async def get_collection_stats(self) -> Dict[str, Any]:
        """Get statistics about the collection"""
        if self.store_type == "pgvector" and self.db_session:
            # Count memories in database
            result = await self.db_session.execute(text("SELECT COUNT(*) FROM agent_memory"))
            count = result.scalar() or 0
            
            return {
                "count": count,
                "store_type": "pgvector",
                "collection_name": "agent_memory",
            }
            
        if not self.collection:
            return {"count": 0, "status": "not_initialized"}
        
        if self.store_type == "chromadb":
            count = self.collection.count()
            return {
                "count": count,
                "store_type": "chromadb",
                "collection_name": self.collection_name,
            }
        
        elif self.store_type == "pinecone":
            stats = self.collection.describe_index_stats()
            return {
                "count": stats.get("total_vector_count", 0),
                "store_type": "pinecone",
                "collection_name": self.collection_name,
            }
        
        return {"count": 0, "status": "unknown"}