"""
Vector Store - Semantic memory storage using ChromaDB/Pinecone
"""
import os
import uuid
from typing import List, Dict, Any, Optional

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


class VectorStore:
    """
    Vector Store for semantic memory using ChromaDB (dev) or Pinecone (prod)
    
    Responsibilities:
    - Store and retrieve embeddings
    - Semantic similarity search
    - Memory persistence
    """
    
    def __init__(
        self,
        store_type: str = "chromadb",
        collection_name: str = "agent_memory",
    ):
        self.store_type = store_type
        self.collection_name = collection_name
        
        # Initialize embedding client
        openai_key = os.getenv("OPENAI_API_KEY")
        self.embedding_client = AsyncOpenAI(api_key=openai_key) if openai_key and OPENAI_AVAILABLE else None
        
        # Initialize vector store
        if store_type == "chromadb" and CHROMADB_AVAILABLE:
            self._init_chromadb()
        elif store_type == "pinecone" and PINECONE_AVAILABLE:
            self._init_pinecone()
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
    
    async def delete_memory(self, memory_id: str) -> None:
        """
        Delete a memory from the vector store
        
        Args:
            memory_id: Memory ID to delete
        """
        if not self.collection:
            return
        
        if self.store_type == "chromadb":
            self.collection.delete(ids=[memory_id])
        elif self.store_type == "pinecone":
            self.collection.delete(ids=[memory_id])
    
    async def get_collection_stats(self) -> Dict[str, Any]:
        """Get statistics about the collection"""
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
