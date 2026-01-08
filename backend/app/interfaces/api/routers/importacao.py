"""
Router para Importação de Transações

Endpoint único que detecta automaticamente o tipo de arquivo
baseado no padrão do nome.
"""
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from app.application.exceptions import ValidationException
from app.application.use_cases.importar_arquivo import ImportarArquivoUseCase
from app.interfaces.api.dependencies import get_importar_arquivo_use_case
from app.interfaces.api.schemas.request_response import ResultadoImportacaoResponse

router = APIRouter(
    prefix="/importacao",
    tags=["Importação"]
)


@router.post("", response_model=ResultadoImportacaoResponse)
async def importar_arquivo(
    arquivo: UploadFile = File(...),
    use_case: ImportarArquivoUseCase = Depends(get_importar_arquivo_use_case)
):
    """
    Importa arquivo com detecção automática de banco e origem.
    
    Detecção Automática por Padrão de Nome:
    - Extrato BTG: Extrato_YYYY-MM-DD_a_YYYY-MM-DD_NNNN
    - Fatura BTG: YYYY-MM-DD_Fatura_NOME_NNNN_BTG
    - Fatura Nubank: Nubank_YYYY-MM-DD
    - Extrato Nubank: NU_NNNN_DDMMMYYYY_DDMMMYYYY
    - Arquivo Tratado: qualquer outro padrão (CSV/Excel normalizado)
    
    Arquivo Tratado (CSV ou Excel):
    - Colunas obrigatórias: data, descricao, valor, origem
    - Colunas opcionais: categoria, banco, data_fatura
    - origem: 'extrato_bancario' ou 'fatura_cartao'
    
    Processamento Automático:
    - Parser lê e normaliza dados
    - Tag Rotina adicionada
    - Regras ativas aplicadas
    - Duplicatas ignoradas
    
    Returns:
        Resultado com total importado e IDs das transações
    """
    try:
        # Ler conteúdo do arquivo
        conteudo = await arquivo.read()
        
        # Executar caso de uso (detecção automática)
        resultado = use_case.execute(
            arquivo=conteudo,
            nome_arquivo=arquivo.filename or ""
        )
        
        return ResultadoImportacaoResponse(
            total_importado=resultado.total_importado,
            transacoes_ids=resultado.transacoes_ids,
            mensagem=resultado.mensagem
        )
        
    except ValidationException as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao processar arquivo: {str(e)}"
        )
