"""Manually add owner_id to images table

Revision ID: manual_add_owner_id_to_images
Revises: 6f360e927f5e
Create Date: 2025-07-12 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'manual_add_owner_id_to_images'
down_revision: Union[str, None] = '6f360e927f5e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add owner_id column and foreign key to images table."""
    op.add_column('images', sa.Column('owner_id', sa.Integer(), nullable=True))
    op.create_foreign_key(
        'fk_images_owner_id_users',  # Constraint name
        'images',           # Source table
        'users',            # Remote table
        ['owner_id'],       # Local columns
        ['id']              # Remote columns
    )


def downgrade() -> None:
    """Remove owner_id column and foreign key from images table."""
    op.drop_constraint('fk_images_owner_id_users', 'images', type_='foreignkey')
    op.drop_column('images', 'owner_id') 