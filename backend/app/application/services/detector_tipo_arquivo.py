"""
Serviço para detectar qual parser usar baseado no nome do arquivo.

Responsabilidade (Single Responsibility):
- Analisar padrão do nome do arquivo
- Retornar parser_id apropriado
"""
import re


class DetectorTipoArquivo:
    """
    Detecta qual parser usar baseado no padrão do nome do arquivo.
    
    Para adicionar novo parser:
    1. Apenas adicione uma entrada em PADROES
    2. O método detectar() automaticamente vai testá-lo
    
    Padrões suportados:
    - btg_extrato: Extrato_YYYY-MM-DD_a_YYYY-MM-DD_NNNN...
    - btg_fatura: YYYY-MM-DD_Fatura_NOME_NNNN_BTG
    - nubank_fatura: Nubank_YYYY-MM-DD
    - nubank_extrato: NU_NNNN_DDMMMYYYY_DDMMMYYYY
    """
    
    # Mapa: parser_id → regex pattern
    # Para adicionar novo parser, apenas adicione aqui (OCP - Open/Closed Principle)
    PADROES = {
        'btg_extrato': re.compile(r'^Extrato_\d{4}-\d{2}-\d{2}_a_\d{4}-\d{2}-\d{2}_\d+', re.IGNORECASE),
        'btg_fatura': re.compile(r'^\d{4}-\d{2}-\d{2}_Fatura_.+_\d+_BTG', re.IGNORECASE),
        'nubank_fatura': re.compile(r'^Nubank_\d{4}-\d{2}-\d{2}', re.IGNORECASE),
        'nubank_extrato': re.compile(r'^NU_\d+_\d{2}[A-Z]{3}\d{4}_\d{2}[A-Z]{3}\d{4}', re.IGNORECASE),
    }
    
    def detectar(self, nome_arquivo: str) -> str:
        """
        Detecta qual parser usar baseado no nome do arquivo.
        
        Args:
            nome_arquivo: Nome do arquivo (com ou sem extensão)
            
        Returns:
            parser_id para usar no registry (ex: 'btg_extrato', 'arquivo_tratado')
        """
        # Remover extensão para análise
        nome_base = self._remover_extensao(nome_arquivo)
        
        # Testar cada padrão (OCP: loop genérico, extensível apenas via PADROES)
        for parser_id, pattern in self.PADROES.items():
            if pattern.match(nome_base):
                return parser_id
        
        # Nenhum padrão reconhecido → arquivo já tratado
        return 'arquivo_tratado'
    
    def _remover_extensao(self, nome_arquivo: str) -> str:
        """Remove extensão do nome do arquivo"""
        for ext in ['.csv', '.xlsx', '.xls', '.txt']:
            if nome_arquivo.lower().endswith(ext):
                return nome_arquivo[:-len(ext)]
        return nome_arquivo

