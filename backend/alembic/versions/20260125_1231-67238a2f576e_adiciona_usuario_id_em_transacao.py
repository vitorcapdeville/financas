"""adiciona_usuario_id_em_transacao

Revision ID: 67238a2f576e
Revises: e25a8c8760ab
Create Date: 2026-01-25 12:31:51.963203

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = '67238a2f576e'
down_revision: Union[str, Sequence[str], None] = 'e25a8c8760ab'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Adicionar coluna usuario_id como nullable temporariamente
    op.add_column('transacao', sa.Column('usuario_id', sa.Integer(), nullable=True))
    
    # Atualizar todas as transações existentes para apontar para "Não definido" (id=1)
    op.execute(
        """
        UPDATE transacao
        SET usuario_id = 1
        WHERE usuario_id IS NULL
        """
    )
    
    # Tornar a coluna NOT NULL
    op.alter_column('transacao', 'usuario_id', nullable=False)
    
    # Adicionar FK constraint
    op.create_foreign_key(
        'fk_transacao_usuario',
        'transacao', 'usuario',
        ['usuario_id'], ['id']
    )
    
    # Adicionar índice para melhor performance
    op.create_index(op.f('ix_transacao_usuario_id'), 'transacao', ['usuario_id'])


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_transacao_usuario_id'), table_name='transacao')
    op.drop_constraint('fk_transacao_usuario', 'transacao', type_='foreignkey')
    op.drop_column('transacao', 'usuario_id')
