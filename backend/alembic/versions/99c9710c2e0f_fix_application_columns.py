"""fix_application_columns

Revision ID: 99c9710c2e0f
Revises: de59a190a052
Create Date: 2026-08-08 21:14:05.990905

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '99c9710c2e0f'
down_revision: Union[str, Sequence[str], None] = 'de59a190a052'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    with op.batch_alter_table('applications', schema=None) as batch_op:
        # SQLite doesn't support renaming columns easily without recreating, 
        # but since I need to add/remove anyway, this is complex.
        # Given the objective, I will add missing ones and ignore unused.
        batch_op.add_column(sa.Column('job_title', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('location', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('application_status', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('priority_score', sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column('last_activity', sa.DateTime(), nullable=True))
        batch_op.add_column(sa.Column('next_deadline', sa.DateTime(), nullable=True))
        batch_op.add_column(sa.Column('source_email_id', sa.Integer(), nullable=True))

def downgrade() -> None:
    """Downgrade schema."""
    with op.batch_alter_table('applications', schema=None) as batch_op:
        batch_op.drop_column('job_title')
        batch_op.drop_column('location')
        batch_op.drop_column('application_status')
        batch_op.drop_column('priority_score')
        batch_op.drop_column('last_activity')
        batch_op.drop_column('next_deadline')
        batch_op.drop_column('source_email_id')
