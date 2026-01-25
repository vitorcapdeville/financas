"""adiciona_tabela_usuario

Revision ID: e25a8c8760ab
Revises: b8792eec857b
Create Date: 2026-01-25 12:31:32.743595

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = 'e25a8c8760ab'
down_revision: Union[str, Sequence[str], None] = 'b8792eec857b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Criar tabela usuario
    op.create_table('usuario',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('nome', sa.String(), nullable=False),
        sa.Column('cpf', sa.String(), nullable=True),
        sa.Column('criado_em', sa.DateTime(), nullable=False),
        sa.Column('atualizado_em', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_usuario_nome'), 'usuario', ['nome'], unique=True)
    
    # Inserir usuário padrão "Não definido" para transações antigas
    from datetime import datetime
    op.execute(
        f"""
        INSERT INTO usuario (nome, cpf, criado_em, atualizado_em)
        VALUES ('Não definido', NULL, '{datetime.now()}', '{datetime.now()}')
        """
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_usuario_nome'), table_name='usuario')
    op.drop_table('usuario')
