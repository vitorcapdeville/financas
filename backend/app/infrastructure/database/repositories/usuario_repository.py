"""
Implementação concreta do repositório de Usuarios usando SQLModel
"""
from typing import List, Optional

from sqlmodel import Session, func, select

from app.domain.entities.usuario import Usuario
from app.domain.repositories.usuario_repository import IUsuarioRepository
from app.infrastructure.database.models.usuario_model import UsuarioModel


class UsuarioRepository(IUsuarioRepository):
    """
    Implementação concreta de IUsuarioRepository usando SQLModel.
    
    Responsabilidades:
    - Traduzir entidades de domínio ↔ models SQLModel
    - Garantir unicidade de nomes
    - Isolar SQLModel da camada de domínio
    """
    
    def __init__(self, session: Session):
        self._session = session
    
    def criar(self, usuario: Usuario) -> Usuario:
        """Cria um novo usuário"""
        # Verifica duplicidade
        if self.nome_existe(usuario.nome):
            raise ValueError(f"Usuário com nome '{usuario.nome}' já existe")
        
        model = self._to_model(usuario)
        self._session.add(model)
        self._session.commit()
        self._session.refresh(model)
        
        return self._to_entity(model)
    
    def buscar_por_id(self, id: int) -> Optional[Usuario]:
        """Busca usuário por ID"""
        model = self._session.get(UsuarioModel, id)
        if not model:
            return None
        return self._to_entity(model)
    
    def buscar_por_nome(self, nome: str) -> Optional[Usuario]:
        """Busca usuário por nome (case-insensitive)"""
        query = select(UsuarioModel).where(func.lower(UsuarioModel.nome) == nome.lower())
        model = self._session.exec(query).first()
        if not model:
            return None
        return self._to_entity(model)
    
    def listar_todos(self) -> List[Usuario]:
        """Lista todos os usuários ordenados por nome"""
        query = select(UsuarioModel).order_by(UsuarioModel.nome)
        models = self._session.exec(query).all()
        return [self._to_entity(m) for m in models]
    
    def atualizar(self, usuario: Usuario) -> Usuario:
        """Atualiza usuário existente"""
        if not usuario.id:
            raise ValueError("Usuario deve ter ID para atualizar")
        
        model = self._session.get(UsuarioModel, usuario.id)
        if not model:
            raise ValueError(f"Usuario {usuario.id} não encontrado")
        
        # Verifica duplicidade de nome (excluindo o próprio ID)
        if usuario.nome != model.nome and self.nome_existe(usuario.nome, excluir_id=usuario.id):
            raise ValueError(f"Usuário com nome '{usuario.nome}' já existe")
        
        model.nome = usuario.nome
        model.cpf = usuario.cpf
        model.atualizado_em = usuario.atualizado_em
        
        self._session.commit()
        self._session.refresh(model)
        
        return self._to_entity(model)
    
    def deletar(self, id: int) -> bool:
        """Deleta usuário"""
        model = self._session.get(UsuarioModel, id)
        if not model:
            return False
        
        # Verifica se tem transações associadas
        if model.transacoes:
            raise ValueError(
                f"Não é possível deletar usuário '{model.nome}' pois possui "
                f"{len(model.transacoes)} transação(ões) associada(s)"
            )
        
        self._session.delete(model)
        self._session.commit()
        return True
    
    def nome_existe(self, nome: str, excluir_id: Optional[int] = None) -> bool:
        """Verifica se nome já existe (case-insensitive)"""
        query = select(func.count(UsuarioModel.id)).where(
            func.lower(UsuarioModel.nome) == nome.lower()
        )
        
        if excluir_id:
            query = query.where(UsuarioModel.id != excluir_id)
        
        count = self._session.exec(query).one()
        return count > 0
    
    def _to_entity(self, model: UsuarioModel) -> Usuario:
        """Converte SQLModel → Entidade de Domínio"""
        return Usuario(
            id=model.id,
            nome=model.nome,
            cpf=model.cpf,
            criado_em=model.criado_em,
            atualizado_em=model.atualizado_em
        )
    
    def _to_model(self, entity: Usuario) -> UsuarioModel:
        """Converte Entidade de Domínio → SQLModel"""
        return UsuarioModel(
            id=entity.id,
            nome=entity.nome,
            cpf=entity.cpf,
            criado_em=entity.criado_em,
            atualizado_em=entity.atualizado_em
        )
