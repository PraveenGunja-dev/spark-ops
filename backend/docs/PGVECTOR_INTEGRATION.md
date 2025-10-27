# PGVector Integration for Multi-Agent Collaboration

This document describes the integration of PostgreSQL's pgvector extension with the multi-agent collaboration system to enable efficient semantic similarity search for collaboration contexts.

## Overview

The pgvector integration enables:

1. Storing vector embeddings directly in PostgreSQL database
2. Performing efficient similarity searches on collaboration contexts
3. Finding similar past collaborations based on context
4. Improving agent memory and learning capabilities

## Components

### Database Schema

The integration adds vector embedding columns to the following tables:

- `agent_memory`: Stores agent memories with vector embeddings
- `multi_agent_collaborations`: Stores collaboration context embeddings

### Services

- `VectorStore`: Enhanced to support pgvector alongside ChromaDB and Pinecone
- `CollaborationManager`: Updated to generate and store context embeddings

### API Endpoints

- `/collaborations/search`: New endpoint for finding similar collaborations

## Usage

### Finding Similar Collaborations

```python
# Example API call
import requests

response = requests.post(
    "http://localhost:8000/api/v1/apa/collaborations/search",
    json={
        "context_query": "Analyze customer sentiment from social media data",
        "limit": 5,
        "filter_metadata": {"collaboration_type": "sequential"}
    },
    headers={"Authorization": f"Bearer {token}"}
)

similar_collaborations = response.json()
```

### Updating Context with Embeddings

When updating a collaboration's shared context, embeddings are automatically generated and stored:

```python
# Example API call
import requests

response = requests.put(
    f"http://localhost:8000/api/v1/apa/collaborations/{collaboration_id}/context",
    json={
        "context_updates": {"status": "in_progress", "current_step": 2},
        "agent_id": "00000000-0000-0000-0000-000000000000"
    },
    headers={"Authorization": f"Bearer {token}"}
)
```

## Testing

A test script is provided to verify the pgvector integration:

```bash
python backend/scripts/test_pgvector_collaboration.py
```

## Configuration

The system will automatically use pgvector if available, falling back to ChromaDB or Pinecone if not.

To enable pgvector in your PostgreSQL database:

1. Install the pgvector extension in PostgreSQL
2. Run the migration to enable the extension and update the schema

```bash
alembic upgrade head
```

## Performance Considerations

- Vector similarity searches are optimized with indexes
- For large datasets, consider adjusting the index parameters
- Monitor query performance and adjust as needed