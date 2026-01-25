"""
Router para Usuarios - Clean Architecture
"""
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.infrastructure.database.repositories.usuario_repository import UsuarioRepository
from app.interfaces.api.dependencies import get_db_session
from app.interfaces.api.schemas.request_response import UsuarioResponse

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])


@router.get("", response_model=List[UsuarioResponse])
def listar_usuarios(
    session: Session = Depends(get_db_session)
):
    """
    Lista todos os usuários cadastrados ordenados por nome.
    
    Returns:
        Lista de usuários
    """
    try:
        repo = UsuarioRepository(session)
        usuarios = repo.listar_todos()
        
        return [
            UsuarioResponse(
                id=u.id,
                nome=u.nome,
                cpf=u.cpf,
                criado_em=u.criado_em,
                atualizado_em=u.atualizado_em
            )
            for u in usuarios
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
