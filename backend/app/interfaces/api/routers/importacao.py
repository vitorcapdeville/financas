"""
Router para Importação de Transações

Endpoint único que aceita um ou múltiplos arquivos naturalmente.
"""
from typing import List, Optional

from fastapi import APIRouter, Depends, File, Form, UploadFile

from app.application.use_cases.importar_multiplos_arquivos import ImportarMultiplosArquivosUseCase
from app.interfaces.api.dependencies import get_importar_multiplos_arquivos_use_case
from app.interfaces.api.schemas.request_response import (
    ResultadoArquivoResponse,
    ResultadoImportacaoMultiplaResponse,
)

router = APIRouter(
    prefix="/importacao",
    tags=["Importação"]
)


@router.post("", response_model=ResultadoImportacaoMultiplaResponse)
async def importar_arquivos(
    arquivos: List[UploadFile] = File(..., description="Um ou múltiplos arquivos para importação"),
    passwords: Optional[str] = Form(None, description="Senhas separadas por vírgula (opcional)"),
    use_case: ImportarMultiplosArquivosUseCase = Depends(get_importar_multiplos_arquivos_use_case)
):
    """
    Importa um ou múltiplos arquivos com detecção automática de banco e origem.
    
    **Aceita tanto arquivo único quanto múltiplos arquivos.**
    Cada arquivo é processado independentemente com seu próprio parser.
    Erros em um arquivo não interrompem o processamento dos demais.
    
    Detecção Automática por Padrão de Nome:
    - Extrato BTG: Extrato_YYYY-MM-DD_a_YYYY-MM-DD_NNNN
    - Fatura BTG: YYYYMMDD_*.xlsx (requer senha)
    - Fatura Nubank: Nubank_YYYY-MM-DD
    - Extrato Nubank: NU_NNNN_DDMMMYYYY_DDMMMYYYY
    - Arquivo Tratado: qualquer outro padrão (CSV/Excel normalizado)
    
    Processamento Automático:
    - Parser lê e normaliza dados
    - Tag Rotina adicionada
    - Regras ativas aplicadas
    - Duplicatas ignoradas
    
    Args:
        arquivos: Um ou mais arquivos a serem importados
        passwords: Senhas separadas por vírgula, na mesma ordem dos arquivos (opcional)
                  Exemplo: "senha1,senha2,senha3" ou "senha1,,senha3" (arquivo 2 sem senha)
    
    Returns:
        Resultado consolidado com estatísticas e detalhes de cada arquivo
        
    Examples:
        Arquivo único:
        ```bash
        curl -X POST "http://localhost:8000/importacao" \\
             -F "arquivos=@extrato.csv"
        ```
        
        Múltiplos arquivos:
        ```bash
        curl -X POST "http://localhost:8000/importacao" \\
             -F "arquivos=@extrato1.csv" \\
             -F "arquivos=@fatura1.xlsx" \\
             -F "passwords=,senha123"  # apenas fatura tem senha
        ```
    """
    # Parse passwords (split por vírgula)
    senha_lista = []
    if passwords:
        senha_lista = [p.strip() or None for p in passwords.split(',')]
    
    # Garantir mesmo tamanho (completar com None se necessário)
    while len(senha_lista) < len(arquivos):
        senha_lista.append(None)
    
    # Preparar lista de arquivos para processamento
    arquivos_para_processar = []
    for idx, arquivo in enumerate(arquivos):
        conteudo = await arquivo.read()
        senha = senha_lista[idx] if idx < len(senha_lista) else None
        arquivos_para_processar.append(
            (conteudo, arquivo.filename or f"arquivo_{idx+1}", senha)
        )
    
    # Executar caso de uso
    resultado = use_case.execute(arquivos_para_processar)
    
    # Converter DTOs para response schemas
    return ResultadoImportacaoMultiplaResponse(
        total_arquivos=resultado.total_arquivos,
        arquivos_sucesso=resultado.arquivos_sucesso,
        arquivos_erro=resultado.arquivos_erro,
        total_transacoes_importadas=resultado.total_transacoes_importadas,
        resultados=[
            ResultadoArquivoResponse(
                nome_arquivo=r.nome_arquivo,
                sucesso=r.sucesso,
                total_importado=r.total_importado,
                transacoes_ids=r.transacoes_ids,
                mensagem=r.mensagem,
                erro=r.erro
            )
            for r in resultado.resultados
        ]
    )


