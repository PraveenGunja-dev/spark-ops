"""Enable pgvector extension and update vector columns

Revision ID: enable_pgvector
Revises: add_apa_tables
Create Date: 2023-11-15 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'enable_pgvector'
down_revision: Union[str, None] = 'add_apa_tables'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Enable pgvector extension for vector embeddings
    op.execute('CREATE EXTENSION IF NOT EXISTS vector')
    
    # Create a temporary column with vector type
    op.execute('ALTER TABLE agent_memory ADD COLUMN embedding_vector vector(1536)')
    
    # Copy data from the array column to the vector column
    # This will convert the existing array data to vector format
    op.execute('UPDATE agent_memory SET embedding_vector = embedding::vector WHERE embedding IS NOT NULL')
    
    # Drop the old array column
    op.drop_column('agent_memory', 'embedding')
    
    # Rename the vector column to the original name
    op.execute('ALTER TABLE agent_memory RENAME COLUMN embedding_vector TO embedding')
    
    # Create an index for vector similarity search
    op.execute('CREATE INDEX ON agent_memory USING ivfflat (embedding vector_cosine_ops)')
    
    # Update the multi_agent_collaborations table to add vector embedding for shared context
    op.add_column('multi_agent_collaborations',
        sa.Column('context_embedding', postgresql.DIALECTS['postgresql'].VECTOR(dimensions=1536), nullable=True)
    )
    
    # Create an index for vector similarity search on collaborations
    op.execute('CREATE INDEX ON multi_agent_collaborations USING ivfflat (context_embedding vector_cosine_ops)')


def downgrade() -> None:
    # Drop the vector similarity search index
    op.execute('DROP INDEX IF EXISTS agent_memory_embedding_ivfflat_idx')
    op.execute('DROP INDEX IF EXISTS multi_agent_collaborations_context_embedding_ivfflat_idx')
    
    # Create a temporary column with array type
    op.add_column('agent_memory',
        sa.Column('embedding_array', postgresql.ARRAY(sa.Float()), nullable=True)
    )
    
    # Copy data from the vector column to the array column
    op.execute('UPDATE agent_memory SET embedding_array = embedding::float[] WHERE embedding IS NOT NULL')
    
    # Drop the vector column
    op.execute('ALTER TABLE agent_memory DROP COLUMN embedding')
    
    # Rename the array column to the original name
    op.execute('ALTER TABLE agent_memory RENAME COLUMN embedding_array TO embedding')
    
    # Drop the context_embedding column from multi_agent_collaborations
    op.drop_column('multi_agent_collaborations', 'context_embedding')
    
    # Disable pgvector extension (optional - may want to keep it)
    # op.execute('DROP EXTENSION IF EXISTS vector')