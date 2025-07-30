"""Modify users table for string ID and add superuser field

Revision ID: 92b9b38c8050
Revises: manual_add_owner_id_to_images
Create Date: 2025-07-28 21:27:26.583484

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '92b9b38c8050'
down_revision: Union[str, None] = 'manual_add_owner_id_to_images'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    Performs the migration using raw SQL to bypass transactional DDL issues.
    This version handles all known dependencies from 'images' and 'shared_images'.
    """
    # ### Manually crafted migration steps using raw SQL ###

    # Step 1: Drop all known foreign keys pointing to users.id to avoid dependency locks.
    op.execute("""
        DO $$ BEGIN
            ALTER TABLE images DROP CONSTRAINT IF EXISTS images_owner_id_fkey;
        EXCEPTION WHEN undefined_object THEN RAISE NOTICE 'Constraint images_owner_id_fkey does not exist.'; END $$;
    """)
    op.execute("""
        DO $$ BEGIN
            ALTER TABLE shared_images DROP CONSTRAINT IF EXISTS shared_images_user_id_fkey;
        EXCEPTION WHEN undefined_object THEN RAISE NOTICE 'Constraint shared_images_user_id_fkey does not exist.'; END $$;
    """)
    # Dropping any other potential legacy constraints
    op.execute("""
        DO $$ BEGIN
            ALTER TABLE images DROP CONSTRAINT IF EXISTS images_user_id_fkey;
        EXCEPTION WHEN undefined_object THEN RAISE NOTICE 'Constraint images_user_id_fkey does not exist.'; END $$;
    """)

    # Step 2: Drop the legacy 'user_id' column from 'images' if it exists.
    op.execute('ALTER TABLE images DROP COLUMN IF EXISTS user_id;')

    # Step 3: Alter the column types for ALL related foreign key columns to STRING.
    op.execute('ALTER TABLE images ALTER COLUMN owner_id TYPE VARCHAR(255);')
    op.execute('ALTER TABLE shared_images ALTER COLUMN user_id TYPE VARCHAR(255);')

    # Step 4: NOW, it is safe to alter the primary key column in 'users'.
    op.execute('ALTER TABLE users ALTER COLUMN id TYPE VARCHAR(255);')

    # Step 5: Add the new required columns to the 'users' table.
    op.execute('ALTER TABLE users ADD COLUMN IF NOT EXISTS is_superuser BOOLEAN NOT NULL DEFAULT false;')
    op.execute('ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT false;')

    # Step 6: Set NOT NULL constraints on other required user fields.
    op.execute('ALTER TABLE users ALTER COLUMN email SET NOT NULL;')
    op.execute('ALTER TABLE users ALTER COLUMN hashed_password SET NOT NULL;')
    op.execute('ALTER TABLE users ALTER COLUMN is_active SET NOT NULL;')

    # Step 7: Recreate the foreign key constraints with the new STRING types.
    op.execute("""
        ALTER TABLE images
        ADD CONSTRAINT images_owner_id_fkey
        FOREIGN KEY (owner_id) REFERENCES users (id);
    """)
    op.execute("""
        ALTER TABLE shared_images
        ADD CONSTRAINT shared_images_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES users (id);
    """)


def downgrade() -> None:
    """
    Reverses the migration using raw SQL.
    """
    op.execute('ALTER TABLE images DROP CONSTRAINT IF EXISTS images_owner_id_fkey;')
    op.execute('ALTER TABLE shared_images DROP CONSTRAINT IF EXISTS shared_images_user_id_fkey;')
    
    # This might fail if string data cannot be cast to integer.
    op.execute('ALTER TABLE images ALTER COLUMN owner_id TYPE INTEGER USING owner_id::integer;')
    op.execute('ALTER TABLE shared_images ALTER COLUMN user_id TYPE INTEGER USING user_id::integer;')
    op.execute("ALTER TABLE users ALTER COLUMN id TYPE INTEGER USING nextval('users_id_seq');")

    op.execute('ALTER TABLE users DROP COLUMN IF EXISTS is_verified;')
    op.execute('ALTER TABLE users DROP COLUMN IF EXISTS is_superuser;')

    op.execute('ALTER TABLE users ALTER COLUMN is_active DROP NOT NULL;')
    op.execute('ALTER TABLE users ALTER COLUMN hashed_password DROP NOT NULL;')
    op.execute('ALTER TABLE users ALTER COLUMN email DROP NOT NULL;')
