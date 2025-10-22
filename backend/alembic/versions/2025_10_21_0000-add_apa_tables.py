"""Add APA (Agentic Process Automation) tables

Revision ID: add_apa_tables
Revises: 8cd0729fb913
Create Date: 2025-10-21 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'add_apa_tables'
down_revision: Union[str, None] = '8cd0729fb913'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Enable pgvector extension for vector embeddings
    # Note: pgvector extension must be installed on PostgreSQL first
    # Commented out for now - will enable once pgvector is installed
    # op.execute('CREATE EXTENSION IF NOT EXISTS vector')
    
    # Create agent_reasoning_traces table
    op.create_table('agent_reasoning_traces',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('run_id', sa.UUID(), nullable=False),
        sa.Column('agent_id', sa.UUID(), nullable=False),
        sa.Column('step_index', sa.Integer(), nullable=False),
        sa.Column('thought', sa.Text(), nullable=False),
        sa.Column('action', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('observation', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('reflection', sa.Text(), nullable=True),
        sa.Column('tokens_used', sa.Integer(), nullable=True),
        sa.Column('latency_ms', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['run_id'], ['workflow_executions.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['agent_id'], ['agents.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_agent_reasoning_traces_run_id'), 'agent_reasoning_traces', ['run_id'], unique=False)
    op.create_index(op.f('ix_agent_reasoning_traces_agent_id'), 'agent_reasoning_traces', ['agent_id'], unique=False)
    
    # Create agent_memory table with vector embeddings
    op.create_table('agent_memory',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('agent_id', sa.UUID(), nullable=False),
        sa.Column('memory_type', sa.String(length=50), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('embedding', postgresql.ARRAY(sa.Float()), nullable=True),  # Will use pgvector type
        sa.Column('metadata', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('importance_score', sa.Float(), nullable=True),
        sa.Column('access_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('last_accessed_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['agent_id'], ['agents.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_agent_memory_agent_id'), 'agent_memory', ['agent_id'], unique=False)
    op.create_index(op.f('ix_agent_memory_type'), 'agent_memory', ['memory_type'], unique=False)
    
    # Create multi_agent_collaborations table
    op.create_table('multi_agent_collaborations',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('run_id', sa.UUID(), nullable=False),
        sa.Column('coordinator_agent_id', sa.UUID(), nullable=False),
        sa.Column('participant_agent_ids', postgresql.ARRAY(sa.UUID()), nullable=False),
        sa.Column('collaboration_type', sa.String(length=50), nullable=False),
        sa.Column('shared_context', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('communication_log', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('started_at', sa.DateTime(), nullable=False),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['run_id'], ['workflow_executions.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['coordinator_agent_id'], ['agents.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_multi_agent_collaborations_run_id'), 'multi_agent_collaborations', ['run_id'], unique=False)
    
    # Create hitl_requests table (Human-in-the-Loop)
    op.create_table('hitl_requests',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('run_id', sa.UUID(), nullable=False),
        sa.Column('agent_id', sa.UUID(), nullable=False),
        sa.Column('step_id', sa.UUID(), nullable=True),
        sa.Column('request_type', sa.String(length=50), nullable=False),
        sa.Column('reason', sa.Text(), nullable=False),
        sa.Column('action_details', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('risk_level', sa.String(length=20), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='pending'),
        sa.Column('requested_at', sa.DateTime(), nullable=False),
        sa.Column('responded_at', sa.DateTime(), nullable=True),
        sa.Column('responded_by_id', sa.UUID(), nullable=True),
        sa.Column('decision', sa.String(length=20), nullable=True),
        sa.Column('feedback', sa.Text(), nullable=True),
        sa.Column('metadata', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['run_id'], ['workflow_executions.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['agent_id'], ['agents.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['responded_by_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_hitl_requests_run_id'), 'hitl_requests', ['run_id'], unique=False)
    op.create_index(op.f('ix_hitl_requests_agent_id'), 'hitl_requests', ['agent_id'], unique=False)
    op.create_index(op.f('ix_hitl_requests_status'), 'hitl_requests', ['status'], unique=False)
    
    # Create learning_feedback table
    op.create_table('learning_feedback',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('agent_id', sa.UUID(), nullable=False),
        sa.Column('run_id', sa.UUID(), nullable=True),
        sa.Column('trace_id', sa.UUID(), nullable=True),
        sa.Column('feedback_type', sa.String(length=50), nullable=False),
        sa.Column('task_description', sa.Text(), nullable=False),
        sa.Column('action_taken', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('outcome', sa.String(length=50), nullable=False),
        sa.Column('success', sa.Boolean(), nullable=False),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('improvement_suggestions', sa.Text(), nullable=True),
        sa.Column('metadata', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['agent_id'], ['agents.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['run_id'], ['workflow_executions.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['trace_id'], ['agent_reasoning_traces.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_learning_feedback_agent_id'), 'learning_feedback', ['agent_id'], unique=False)
    op.create_index(op.f('ix_learning_feedback_outcome'), 'learning_feedback', ['outcome'], unique=False)
    
    # Extend existing agents table with APA-specific columns
    op.add_column('agents', sa.Column('reasoning_model', sa.String(length=100), nullable=True))
    op.add_column('agents', sa.Column('enable_reasoning', sa.Boolean(), nullable=False, server_default='true'))
    op.add_column('agents', sa.Column('enable_collaboration', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('agents', sa.Column('enable_learning', sa.Boolean(), nullable=False, server_default='true'))
    op.add_column('agents', sa.Column('personality_traits', postgresql.JSONB(astext_type=sa.Text()), nullable=True))
    op.add_column('agents', sa.Column('safety_guardrails', postgresql.JSONB(astext_type=sa.Text()), nullable=True))
    op.add_column('agents', sa.Column('max_iterations', sa.Integer(), nullable=False, server_default='10'))
    
    # Extend workflows table with APA-specific columns
    op.add_column('workflows', sa.Column('is_dynamic', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('workflows', sa.Column('allow_replanning', sa.Boolean(), nullable=False, server_default='true'))
    op.add_column('workflows', sa.Column('collaboration_config', postgresql.JSONB(astext_type=sa.Text()), nullable=True))
    
    # Extend workflow_executions table with APA-specific columns
    op.add_column('workflow_executions', sa.Column('reasoning_enabled', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('workflow_executions', sa.Column('total_reasoning_steps', sa.Integer(), nullable=True))
    op.add_column('workflow_executions', sa.Column('total_tokens_used', sa.Integer(), nullable=True))
    op.add_column('workflow_executions', sa.Column('replanning_count', sa.Integer(), nullable=False, server_default='0'))


def downgrade() -> None:
    # Remove columns from workflow_executions
    op.drop_column('workflow_executions', 'replanning_count')
    op.drop_column('workflow_executions', 'total_tokens_used')
    op.drop_column('workflow_executions', 'total_reasoning_steps')
    op.drop_column('workflow_executions', 'reasoning_enabled')
    
    # Remove columns from workflows
    op.drop_column('workflows', 'collaboration_config')
    op.drop_column('workflows', 'allow_replanning')
    op.drop_column('workflows', 'is_dynamic')
    
    # Remove columns from agents
    op.drop_column('agents', 'max_iterations')
    op.drop_column('agents', 'safety_guardrails')
    op.drop_column('agents', 'personality_traits')
    op.drop_column('agents', 'enable_learning')
    op.drop_column('agents', 'enable_collaboration')
    op.drop_column('agents', 'enable_reasoning')
    op.drop_column('agents', 'reasoning_model')
    
    # Drop new tables
    op.drop_index(op.f('ix_learning_feedback_outcome'), table_name='learning_feedback')
    op.drop_index(op.f('ix_learning_feedback_agent_id'), table_name='learning_feedback')
    op.drop_table('learning_feedback')
    
    op.drop_index(op.f('ix_hitl_requests_status'), table_name='hitl_requests')
    op.drop_index(op.f('ix_hitl_requests_agent_id'), table_name='hitl_requests')
    op.drop_index(op.f('ix_hitl_requests_run_id'), table_name='hitl_requests')
    op.drop_table('hitl_requests')
    
    op.drop_index(op.f('ix_multi_agent_collaborations_run_id'), table_name='multi_agent_collaborations')
    op.drop_table('multi_agent_collaborations')
    
    op.drop_index(op.f('ix_agent_memory_type'), table_name='agent_memory')
    op.drop_index(op.f('ix_agent_memory_agent_id'), table_name='agent_memory')
    op.drop_table('agent_memory')
    
    op.drop_index(op.f('ix_agent_reasoning_traces_agent_id'), table_name='agent_reasoning_traces')
    op.drop_index(op.f('ix_agent_reasoning_traces_run_id'), table_name='agent_reasoning_traces')
    op.drop_table('agent_reasoning_traces')
    
    # Disable pgvector extension (optional - may want to keep it)
    # op.execute('DROP EXTENSION IF EXISTS vector')
