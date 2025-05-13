"""Add warehouse_quantity to line_items

Revision ID: 003
Revises: 002
Create Date: 2023-05-14 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '003'
down_revision = '002'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add warehouse_quantity column to line_items table
    try:
        op.add_column('line_items', sa.Column('warehouse_quantity', sa.Float(), nullable=True, server_default='0'))
    except Exception as e:
        print(f"Error adding warehouse_quantity column: {e}")
        pass


def downgrade() -> None:
    # Remove warehouse_quantity column
    try:
        op.drop_column('line_items', 'warehouse_quantity')
    except Exception:
        pass 