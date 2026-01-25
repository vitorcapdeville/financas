"""
Dependency Injection - Camada de Interfaces (Presentation)
Fábrica de dependências para FastAPI
"""
from typing import Generator

from fastapi import Depends
from sqlmodel import Session

from app.application.use_cases.atualizar_regra import AtualizarRegraUseCase
from app.application.use_cases.criar_regra import CriarRegraUseCase
from app.application.use_cases.criar_tag import CriarTagUseCase

# Casos de Uso
from app.application.use_cases.criar_transacao import CriarTransacaoUseCase
from app.application.use_cases.deletar_regra import DeletarRegraUseCase
from app.application.use_cases.deletar_tag import DeletarTagUseCase
from app.application.use_cases.listar_regras import ListarRegrasUseCase
from app.application.use_cases.listar_tags import ListarTagsUseCase
from app.application.use_cases.listar_transacoes import ListarTransacoesUseCase
from app.application.use_cases.obter_configuracao import ObterConfiguracaoUseCase
from app.application.use_cases.salvar_configuracao import SalvarConfiguracaoUseCase
from app.infrastructure.database.repositories.configuracao_repository import ConfiguracaoRepository
from app.infrastructure.database.repositories.regra_repository import RegraRepository
from app.infrastructure.database.repositories.tag_repository import TagRepository

# Repositórios
from app.infrastructure.database.repositories.transacao_repository import TransacaoRepository
from app.infrastructure.database.repositories.usuario_repository import UsuarioRepository
from app.infrastructure.database.session import get_session

# ===== REPOSITÓRIOS =====

def get_transacao_repository(
    session: Session = Depends(get_session)
) -> Generator[TransacaoRepository, None, None]:
    """Fornece repositório de transações"""
    yield TransacaoRepository(session)


def get_tag_repository(
    session: Session = Depends(get_session)
) -> Generator[TagRepository, None, None]:
    """Fornece repositório de tags"""
    yield TagRepository(session)


def get_configuracao_repository(
    session: Session = Depends(get_session)
) -> Generator[ConfiguracaoRepository, None, None]:
    """Fornece repositório de configurações"""
    yield ConfiguracaoRepository(session)


def get_regra_repository(
    session: Session = Depends(get_session)
) -> Generator[RegraRepository, None, None]:
    """Fornece repositório de regras"""
    yield RegraRepository(session)


def get_usuario_repository(
    session: Session = Depends(get_session)
) -> Generator[UsuarioRepository, None, None]:
    """Fornece repositório de usuários"""
    yield UsuarioRepository(session)


def get_db_session(session: Session = Depends(get_session)) -> Session:
    """Fornece sessão do banco de dados"""
    return session


# ===== CASOS DE USO =====

def get_criar_transacao_use_case(
    transacao_repo: TransacaoRepository = Depends(get_transacao_repository)
) -> CriarTransacaoUseCase:
    """Fornece caso de uso de criar transação"""
    return CriarTransacaoUseCase(transacao_repo)


def get_listar_transacoes_use_case(
    transacao_repo: TransacaoRepository = Depends(get_transacao_repository),
    config_repo: ConfiguracaoRepository = Depends(get_configuracao_repository),
    tag_repo: TagRepository = Depends(get_tag_repository),
    usuario_repo: UsuarioRepository = Depends(get_usuario_repository)
) -> ListarTransacoesUseCase:
    """Fornece caso de uso de listar transações com tags e usuario"""
    return ListarTransacoesUseCase(transacao_repo, config_repo, tag_repo, usuario_repo)


def get_atualizar_transacao_use_case(
    transacao_repo: TransacaoRepository = Depends(get_transacao_repository)
):
    """Fornece caso de uso de atualizar transação"""
    from app.application.use_cases.atualizar_transacao import AtualizarTransacaoUseCase
    return AtualizarTransacaoUseCase(transacao_repo)


def get_obter_resumo_mensal_use_case(
    transacao_repo: TransacaoRepository = Depends(get_transacao_repository),
    config_repo: ConfiguracaoRepository = Depends(get_configuracao_repository)
):
    """Fornece caso de uso de obter resumo mensal"""
    from app.application.use_cases.obter_resumo_mensal import ObterResumoMensalUseCase
    return ObterResumoMensalUseCase(transacao_repo, config_repo)


def get_listar_categorias_use_case(
    transacao_repo: TransacaoRepository = Depends(get_transacao_repository)
):
    """Fornece caso de uso de listar categorias"""
    from app.application.use_cases.listar_categorias import ListarCategoriasUseCase
    return ListarCategoriasUseCase(transacao_repo)


def get_obter_transacao_use_case(
    transacao_repo: TransacaoRepository = Depends(get_transacao_repository),
    tag_repo: TagRepository = Depends(get_tag_repository),
    usuario_repo: UsuarioRepository = Depends(get_usuario_repository)
):
    """Fornece caso de uso de obter transação com tags completas e usuario"""
    from app.application.use_cases.obter_transacao import ObterTransacaoUseCase
    return ObterTransacaoUseCase(transacao_repo, tag_repo, usuario_repo)


def get_restaurar_valor_original_use_case(
    transacao_repo: TransacaoRepository = Depends(get_transacao_repository)
):
    """Fornece caso de uso de restaurar valor original"""
    from app.application.use_cases.restaurar_valor_original import RestaurarValorOriginalUseCase
    return RestaurarValorOriginalUseCase(transacao_repo)


def get_adicionar_tag_transacao_use_case(
    transacao_repo: TransacaoRepository = Depends(get_transacao_repository),
    tag_repo: TagRepository = Depends(get_tag_repository)
):
    """Fornece caso de uso de adicionar tag a transação"""
    from app.application.use_cases.adicionar_tag_transacao import AdicionarTagTransacaoUseCase
    return AdicionarTagTransacaoUseCase(transacao_repo, tag_repo)


def get_remover_tag_transacao_use_case(
    transacao_repo: TransacaoRepository = Depends(get_transacao_repository)
):
    """Fornece caso de uso de remover tag de transação"""
    from app.application.use_cases.remover_tag_transacao import RemoverTagTransacaoUseCase
    return RemoverTagTransacaoUseCase(transacao_repo)


def get_listar_tags_transacao_use_case(
    transacao_repo: TransacaoRepository = Depends(get_transacao_repository),
    tag_repo: TagRepository = Depends(get_tag_repository)
):
    """Fornece caso de uso de listar tags de transação"""
    from app.application.use_cases.listar_tags_transacao import ListarTagsTransacaoUseCase
    return ListarTagsTransacaoUseCase(transacao_repo, tag_repo)


# ===== TAGS =====

def get_criar_tag_use_case(
    tag_repo: TagRepository = Depends(get_tag_repository)
) -> CriarTagUseCase:
    """Fornece caso de uso de criar tag"""
    return CriarTagUseCase(tag_repo)


def get_listar_tags_use_case(
    tag_repo: TagRepository = Depends(get_tag_repository)
) -> ListarTagsUseCase:
    """Fornece caso de uso de listar tags"""
    return ListarTagsUseCase(tag_repo)


def get_deletar_tag_use_case(
    tag_repo: TagRepository = Depends(get_tag_repository)
) -> DeletarTagUseCase:
    """Fornece caso de uso de deletar tag"""
    return DeletarTagUseCase(tag_repo)


# ===== REGRAS =====

def get_criar_regra_use_case(
    regra_repo: RegraRepository = Depends(get_regra_repository)
) -> CriarRegraUseCase:
    """Fornece caso de uso de criar regra"""
    return CriarRegraUseCase(regra_repo)


def get_listar_regras_use_case(
    regra_repo: RegraRepository = Depends(get_regra_repository)
) -> ListarRegrasUseCase:
    """Fornece caso de uso de listar regras"""
    return ListarRegrasUseCase(regra_repo)


def get_atualizar_regra_use_case(
    regra_repo: RegraRepository = Depends(get_regra_repository)
) -> AtualizarRegraUseCase:
    """Fornece caso de uso de atualizar regra"""
    return AtualizarRegraUseCase(regra_repo)


def get_deletar_regra_use_case(
    regra_repo: RegraRepository = Depends(get_regra_repository)
) -> DeletarRegraUseCase:
    """Fornece caso de uso de deletar regra"""
    return DeletarRegraUseCase(regra_repo)


def get_aplicar_regra_retroativa_use_case(
    transacao_repo: TransacaoRepository = Depends(get_transacao_repository),
    regra_repo: RegraRepository = Depends(get_regra_repository)
):
    """Fornece caso de uso de aplicar regra retroativamente"""
    from app.application.use_cases.aplicar_regra_retroativa import AplicarRegraRetroativamenteUseCase
    return AplicarRegraRetroativamenteUseCase(transacao_repo, regra_repo)


def get_aplicar_todas_regras_retroativa_use_case(
    transacao_repo: TransacaoRepository = Depends(get_transacao_repository),
    regra_repo: RegraRepository = Depends(get_regra_repository)
):
    """Fornece caso de uso de aplicar todas as regras retroativamente"""
    from app.application.use_cases.aplicar_todas_regras_retroativa import AplicarTodasRegrasRetroativaUseCase
    return AplicarTodasRegrasRetroativaUseCase(transacao_repo, regra_repo)


# ===== CONFIGURAÇÕES =====

def get_obter_configuracao_use_case(
    config_repo: ConfiguracaoRepository = Depends(get_configuracao_repository)
) -> ObterConfiguracaoUseCase:
    """Fornece caso de uso de obter configuração"""
    return ObterConfiguracaoUseCase(config_repo)


def get_salvar_configuracao_use_case(
    config_repo: ConfiguracaoRepository = Depends(get_configuracao_repository)
) -> SalvarConfiguracaoUseCase:
    """Fornece caso de uso de salvar configuração"""
    return SalvarConfiguracaoUseCase(config_repo)


# ===== IMPORTAÇÃO =====

def get_importar_multiplos_arquivos_use_case(
    transacao_repo: TransacaoRepository = Depends(get_transacao_repository),
    tag_repo: TagRepository = Depends(get_tag_repository),
    regra_repo: RegraRepository = Depends(get_regra_repository),
    usuario_repo: UsuarioRepository = Depends(get_usuario_repository)
):
    """Fornece caso de uso de importar arquivos (um ou múltiplos)"""
    from app.application.use_cases.importar_multiplos_arquivos import ImportarMultiplosArquivosUseCase
    return ImportarMultiplosArquivosUseCase(transacao_repo, tag_repo, regra_repo, usuario_repo)


# Você pode adicionar mais factories de casos de uso aqui conforme necessário
