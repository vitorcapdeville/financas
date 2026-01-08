"""adiciona_campo_banco_em_transacao

Revision ID: b8792eec857b
Revises: 856715defdd8
Create Date: 2026-01-07 21:37:38.612705

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = 'b8792eec857b'
down_revision: Union[str, Sequence[str], None] = '856715defdd8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Adiciona coluna banco na tabela transacao
    op.add_column('transacao', sa.Column('banco', sa.String(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    # Remove coluna banco da tabela transacao
    op.drop_column('transacao', 'banco')
