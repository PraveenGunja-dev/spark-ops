"""Add health and autoscaling columns to agents

Revision ID: add_agent_health_monitoring
Revises: add_apa_tables
Create Date: 2025-10-21 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_agent_health_monitoring'
down_revision = 'add_apa_tables'
branch_labels = None
depends_on = None


def upgrade():
    # Add health monitoring columns to agents table
    op.add_column('agents', sa.Column('health', sa.String(length=20), server_default='unknown', nullable=False))
    op.add_column('agents', sa.Column('last_heartbeat', sa.DateTime(timezone=True), nullable=True))
    op.add_column('agents', sa.Column('concurrency', sa.Integer(), server_default='1', nullable=False))
    op.add_column('agents', sa.Column('autoscale_min', sa.Integer(), server_default='1', nullable=False))
    op.add_column('agents', sa.Column('autoscale_max', sa.Integer(), server_default='10', nullable=False))
    op.add_column('agents', sa.Column('autoscale_target_cpu', sa.Integer(), server_default='70', nullable=False))


def downgrade():
    # Remove health monitoring columns from agents table
    op.drop_column('agents', 'autoscale_target_cpu')
    op.drop_column('agents', 'autoscale_max')
    op.drop_column('agents', 'autoscale_min')
    op.drop_column('agents', 'concurrency')
    op.drop_column('agents', 'last_heartbeat')
    op.drop_column('agents', 'health')
