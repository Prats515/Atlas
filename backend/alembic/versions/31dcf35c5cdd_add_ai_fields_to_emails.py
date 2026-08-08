"""add_ai_fields_to_emails

Revision ID: 31dcf35c5cdd
Revises: 99c9710c2e0f
Create Date: 2026-08-08 21:25:52.950797

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '31dcf35c5cdd'
down_revision: Union[str, Sequence[str], None] = '99c9710c2e0f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    with op.batch_alter_table('emails', schema=None) as batch_op:
        batch_op.add_column(sa.Column('classification', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('priority_score', sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column('summary_short', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('summary_long', sa.Text(), nullable=True))
        batch_op.add_column(sa.Column('action_required', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('deadline', sa.DateTime(), nullable=True))
        batch_op.add_column(sa.Column('company_name', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('recruiter_name', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('suggested_reply', sa.Text(), nullable=True))

def downgrade() -> None:
    """Downgrade schema."""
    with op.batch_alter_table('emails', schema=None) as batch_op:
        batch_op.drop_column('classification')
        batch_op.drop_column('priority_score')
        batch_op.drop_column('summary_short')
        batch_op.drop_column('summary_long')
        batch_op.drop_column('action_required')
        batch_op.drop_column('deadline')
        batch_op.drop_column('company_name')
        batch_op.drop_column('recruiter_name')
        batch_op.drop_column('suggested_reply')
