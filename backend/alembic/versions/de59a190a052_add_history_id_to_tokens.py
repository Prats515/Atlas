"""add_history_id_to_tokens

Revision ID: de59a190a052
Revises: 9f63ee757738
Create Date: 2026-08-08 21:12:06.890708

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'de59a190a052'
down_revision: Union[str, Sequence[str], None] = '9f63ee757738'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    with op.batch_alter_table('tokens', schema=None) as batch_op:
        batch_op.add_column(sa.Column('history_id', sa.String(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    with op.batch_alter_table('tokens', schema=None) as batch_op:
        batch_op.drop_column('history_id')
