"""Manually add credits and Creem fields to users table

Revision ID: 71fc28e7776b
Revises: 62c2342747ed
Create Date: 2025-07-08 21:07:07.135270

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '71fc28e7776b'
down_revision: Union[str, None] = '62c2342747ed'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('credits', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('users', sa.Column('credits_spent', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('users', sa.Column('creem_customer_id', sa.String(), nullable=True))
    op.add_column('users', sa.Column('creem_subscription_id', sa.String(), nullable=True))
    op.add_column('users', sa.Column('creem_price_id', sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column('users', 'creem_price_id')
    op.drop_column('users', 'creem_subscription_id')
    op.drop_column('users', 'creem_customer_id')
    op.drop_column('users', 'credits_spent')
    op.drop_column('users', 'credits')
