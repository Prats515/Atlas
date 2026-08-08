"""add_application_foreign_keys

Revision ID: 9f63ee757738
Revises: 
Create Date: 2026-08-08 21:03:44.515828

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9f63ee757738'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    with op.batch_alter_table('applications', schema=None) as batch_op:
        batch_op.create_foreign_key('fk_applications_company_id', 'companies', ['company_id'], ['id'])
        batch_op.create_foreign_key('fk_applications_recruiter_id', 'recruiters', ['recruiter_id'], ['id'])


def downgrade() -> None:
    """Downgrade schema."""
    with op.batch_alter_table('applications', schema=None) as batch_op:
        batch_op.drop_constraint('fk_applications_company_id', type_='foreignkey')
        batch_op.drop_constraint('fk_applications_recruiter_id', type_='foreignkey')
