"""
Router refatorado para Configurações usando Clean Architecture
"""
from fastapi import APIRouter, Depends, HTTPException, status

from app.application.dto.configuracao_dto import SalvarConfiguracaoDTO
from app.application.use_cases.obter_configuracao import ObterConfiguracaoUseCase
from app.application.use_cases.salvar_configuracao import SalvarConfiguracaoUseCase
from app.interfaces.api.dependencies import get_obter_configuracao_use_case, get_salvar_configuracao_use_case
from app.interfaces.api.schemas.request_response import ConfiguracaoRequest, ConfiguracaoResponse

router = APIRouter(
    prefix="/configuracoes",
    tags=["Configurações"]
)


@router.get("/{chave}", response_model=ConfiguracaoResponse)
def obter_configuracao(
    chave: str,
    use_case: ObterConfiguracaoUseCase = Depends(get_obter_configuracao_use_case)
):
    """
    Obtém uma configuração específica por chave.
    
    Args:
        chave: Chave da configuração
        
    Returns:
        Configuração encontrada
        
    Raises:
        404: Configuração não encontrada
    """
    dto = use_case.execute(chave)
    
    if not dto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Configuração '{chave}' não encontrada"
        )
    
    return ConfiguracaoResponse(chave=dto.chave, valor=dto.valor)


@router.post("", response_model=ConfiguracaoResponse, status_code=status.HTTP_201_CREATED)
def salvar_configuracao(
    request: ConfiguracaoRequest,
    use_case: SalvarConfiguracaoUseCase = Depends(get_salvar_configuracao_use_case)
):
    """
    Salva ou atualiza uma configuração.
    
    Args:
        request: Dados da configuração
        
    Returns:
        Configuração salva
        
    Raises:
        400: Dados inválidos
    """
    try:
        dto = SalvarConfiguracaoDTO(chave=request.chave, valor=request.valor)
        resultado = use_case.execute(dto)
        
        return ConfiguracaoResponse(chave=resultado.chave, valor=resultado.valor)
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
