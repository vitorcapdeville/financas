"""
Router refatorado para Regras - Clean Architecture
"""
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.application.dto.regra_dto import AtualizarRegraDTO, CriarRegraDTO
from app.application.exceptions.application_exceptions import EntityNotFoundException, ValidationException
from app.application.use_cases.atualizar_regra import AtualizarRegraUseCase
from app.application.use_cases.criar_regra import CriarRegraUseCase
from app.application.use_cases.deletar_regra import DeletarRegraUseCase
from app.application.use_cases.listar_regras import ListarRegrasUseCase
from app.domain.value_objects.regra_enums import CriterioTipo, TipoAcao
from app.infrastructure.database.repositories.regra_repository import RegraRepository
from app.interfaces.api.dependencies import (
    get_aplicar_regra_retroativa_use_case,
    get_aplicar_todas_regras_retroativa_use_case,
    get_atualizar_regra_use_case,
    get_criar_regra_use_case,
    get_deletar_regra_use_case,
    get_listar_regras_use_case,
    get_regra_repository,
)
from app.interfaces.api.schemas.request_response import RegraCreateRequest, RegraResponse, RegraUpdateRequest

router = APIRouter(prefix="/regras", tags=["Regras"])


@router.get("", response_model=List[RegraResponse])
def listar_regras(
    apenas_ativas: bool = Query(False, description="Retornar apenas regras ativas"),
    use_case: ListarRegrasUseCase = Depends(get_listar_regras_use_case)
):
    """
    Lista todas as regras ordenadas por prioridade (maior primeiro).
    
    Query params:
        apenas_ativas: Se True, retorna apenas regras ativas
    
    Returns:
        Lista de regras
    """
    try:
        dtos = use_case.execute(apenas_ativas=apenas_ativas)
        return [_dto_to_response(dto) for dto in dtos]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/{regra_id}", response_model=RegraResponse)
def obter_regra(
    regra_id: int,
    regra_repo: RegraRepository = Depends(get_regra_repository)
):
    """
    Obtém uma regra específica por ID.
    
    Args:
        regra_id: ID da regra
        
    Returns:
        Regra encontrada
        
    Raises:
        404: Regra não encontrada
    """
    regra = regra_repo.buscar_por_id(regra_id)
    if not regra:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Regra não encontrada"
        )
    
    return RegraResponse(
        id=regra.id,
        nome=regra.nome,
        tipo_acao=regra.tipo_acao.value,
        criterio_tipo=regra.criterio_tipo.value,
        criterio_valor=regra.criterio_valor,
        acao_valor=regra.acao_valor,
        prioridade=regra.prioridade,
        ativo=regra.ativo,
        tag_ids=regra.tag_ids
    )


@router.post("", response_model=RegraResponse, status_code=status.HTTP_201_CREATED)
def criar_regra(
    request: RegraCreateRequest,
    use_case: CriarRegraUseCase = Depends(get_criar_regra_use_case)
):
    """
    Cria uma nova regra de automação.
    
    Args:
        request: Dados da regra
        
    Returns:
        Regra criada
        
    Raises:
        400: Nome duplicado ou dados inválidos
    """
    try:
        # Converter strings para enums
        tipo_acao = TipoAcao(request.tipo_acao)
        criterio_tipo = CriterioTipo(request.criterio_tipo)
        
        # Converter request para DTO
        dto = CriarRegraDTO(
            nome=request.nome,
            tipo_acao=tipo_acao,
            criterio_tipo=criterio_tipo,
            criterio_valor=request.criterio_valor,
            acao_valor=request.acao_valor,
            prioridade=request.prioridade if request.prioridade is not None else 0,
            ativo=request.ativo,
            tag_ids=request.tag_ids
        )
        
        # Executar caso de uso
        regra_dto = use_case.execute(dto)
        
        # Converter DTO para response
        return _dto_to_response(regra_dto)
        
    except ValidationException as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Valor inválido: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.patch("/{regra_id}", response_model=RegraResponse)
def atualizar_regra(
    regra_id: int,
    request: RegraUpdateRequest,
    use_case: AtualizarRegraUseCase = Depends(get_atualizar_regra_use_case)
):
    """
    Atualiza uma regra existente.
    
    Args:
        regra_id: ID da regra a atualizar
        request: Dados para atualização (campos opcionais)
        
    Returns:
        Regra atualizada
        
    Raises:
        404: Regra não encontrada
        400: Nome duplicado ou dados inválidos
    """
    try:
        # Converter strings para enums (se fornecidos)
        tipo_acao = TipoAcao(request.tipo_acao) if request.tipo_acao else None
        criterio_tipo = CriterioTipo(request.criterio_tipo) if request.criterio_tipo else None
        
        # Converter request para DTO
        dto = AtualizarRegraDTO(
            nome=request.nome,
            tipo_acao=tipo_acao,
            criterio_tipo=criterio_tipo,
            criterio_valor=request.criterio_valor,
            acao_valor=request.acao_valor,
            prioridade=request.prioridade,
            ativo=request.ativo,
            tag_ids=request.tag_ids
        )
        
        # Executar caso de uso
        regra_dto = use_case.execute(regra_id, dto)
        
        # Converter DTO para response
        return _dto_to_response(regra_dto)
        
    except EntityNotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except ValidationException as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Valor inválido: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.delete("/{regra_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_regra(
    regra_id: int,
    use_case: DeletarRegraUseCase = Depends(get_deletar_regra_use_case)
):
    """
    Deleta uma regra.
    Remove também todas as associações com tags (CASCADE).
    
    Args:
        regra_id: ID da regra a deletar
        
    Raises:
        404: Regra não encontrada
    """
    try:
        use_case.execute(regra_id)
        return None
        
    except EntityNotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/{regra_id}/aplicar", response_model=dict)
def aplicar_regra_retroativamente(
    regra_id: int,
    use_case = Depends(get_aplicar_regra_retroativa_use_case)
):
    """
    Aplica uma regra específica retroativamente em todas as transações.
    
    Args:
        regra_id: ID da regra a aplicar
        
    Returns:
        Estatísticas da aplicação:
        {
            "total_processado": int,
            "total_modificado": int
        }
        
    Raises:
        404: Regra não encontrada
    """
    try:
        resultado = use_case.execute(regra_id)
        return resultado
        
    except EntityNotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/aplicar-todas", response_model=dict)
def aplicar_todas_regras_retroativamente(
    use_case = Depends(get_aplicar_todas_regras_retroativa_use_case)
):
    """
    Aplica todas as regras ativas retroativamente em todas as transações.
    
    Returns:
        Estatísticas da aplicação:
        {
            "total_processado": int (número de transações processadas),
            "total_modificado": int (número de transações modificadas)
        }
    """
    try:
        resultado = use_case.execute()
        return resultado
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# ===== FUNÇÕES AUXILIARES =====

def _dto_to_response(dto) -> RegraResponse:
    """Converte DTO para response Pydantic"""
    return RegraResponse(
        id=dto.id,
        nome=dto.nome,
        tipo_acao=dto.tipo_acao.value,
        criterio_tipo=dto.criterio_tipo.value,
        criterio_valor=dto.criterio_valor,
        acao_valor=dto.acao_valor,
        prioridade=dto.prioridade,
        ativo=dto.ativo,
        tag_ids=dto.tag_ids
    )
