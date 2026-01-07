'use client';

import { useState, useTransition } from 'react';
import { atualizarCategoriaAction, atualizarValorAction, restaurarValorOriginalAction, adicionarTagAction, removerTagAction } from '@/app/transacao/[id]/actions';
import { Transacao, CriterioTipo, TipoAcao, Tag } from '@/types';
import { toast } from 'react-hot-toast';
import ModalEditarCategoria from '@/components/ModalEditarCategoria';
import ModalEditarValor from '@/components/ModalEditarValor';
import ModalEditarTags from '@/components/ModalEditarTags';
import { criarRegraAction, aplicarRegraRetroativamenteAction } from '@/app/regras/actions';
import { ModalConfirmacao } from './ModalConfirmacao';

interface BotoesAcaoTransacaoProps {
  transacao: Transacao;
  todasTags: Tag[];
}

export default function BotoesAcaoTransacao({ transacao, todasTags }: BotoesAcaoTransacaoProps) {
  const [isPending, startTransition] = useTransition();
  const [modalCategoria, setModalCategoria] = useState(false);
  const [modalValor, setModalValor] = useState(false);
  const [modalTags, setModalTags] = useState(false);
  const [regraParaAplicar, setRegraParaAplicar] = useState<{ id: number; nome: string } | null>(null);

  const handleSalvarCategoria = async (novaCategoria: string, criarRegra?: { criterio: CriterioTipo; nomeRegra: string; criterio_valor: string }) => {
    startTransition(async () => {
      try {
        await atualizarCategoriaAction(transacao.id, novaCategoria);
        
        // Se usuário optou por criar regra, criar também
        if (criarRegra) {
          const criterioValor = criarRegra.criterio === CriterioTipo.CATEGORIA 
            ? (transacao.categoria || '') 
            : criarRegra.criterio_valor;
          
          const regra = await criarRegraAction({
            nome: criarRegra.nomeRegra,
            tipo_acao: TipoAcao.ALTERAR_CATEGORIA,
            criterio_tipo: criarRegra.criterio,
            criterio_valor: criterioValor,
            acao_valor: novaCategoria,
          });
          
          toast.success('Categoria atualizada e regra criada!');
          setModalCategoria(false);
          
          // Perguntar se quer aplicar retroativamente
          setRegraParaAplicar({ id: regra.id, nome: regra.nome });
        } else {
          toast.success('Categoria atualizada!');
          setModalCategoria(false);
        }
      } catch (error) {
        console.error('Erro ao atualizar categoria:', error);
        toast.error('Erro ao atualizar categoria');
      }
    });
  };

  const handleAplicarRegraRetroativamente = () => {
    if (!regraParaAplicar) return;
    
    startTransition(async () => {
      try {
        const resultado = await aplicarRegraRetroativamenteAction(regraParaAplicar.id);
        toast.success(`✅ Regra aplicada! ${resultado.transacoes_modificadas} transações atualizadas.`);
        setRegraParaAplicar(null);
      } catch (error) {
        console.error('Erro ao aplicar regra:', error);
        toast.error('Erro ao aplicar regra');
        setRegraParaAplicar(null);
      }
    });
  };

  const handleSalvarValor = async (
    novoValor: number,
    dadosRegra?: { criterio: CriterioTipo; nomeRegra: string; percentual: number; criterio_valor: string }
  ) => {
    startTransition(async () => {
      try {
        await atualizarValorAction(transacao.id, novoValor);
        
        // Se usuário optou por criar regra, criar também
        if (dadosRegra) {
          const criterioValor = dadosRegra.criterio === CriterioTipo.CATEGORIA 
            ? (transacao.categoria || '') 
            : dadosRegra.criterio_valor;
          
          const regra = await criarRegraAction({
            nome: dadosRegra.nomeRegra,
            tipo_acao: TipoAcao.ALTERAR_VALOR,
            criterio_tipo: dadosRegra.criterio,
            criterio_valor: criterioValor,
            acao_valor: dadosRegra.percentual.toFixed(2), // Percentual como string
          });
          
          toast.success('Valor atualizado e regra criada!');
          setModalValor(false);
          
          // Perguntar se quer aplicar retroativamente
          setRegraParaAplicar({ id: regra.id, nome: regra.nome });
        } else {
          toast.success('Valor atualizado!');
          setModalValor(false);
        }
      } catch (error) {
        console.error('Erro ao atualizar valor:', error);
        toast.error('Erro ao atualizar valor');
      }
    });
  };

  const handleRestaurarValor = async () => {
    startTransition(async () => {
      try {
        await restaurarValorOriginalAction(transacao.id);
        toast.success('Valor original restaurado!');
        setModalValor(false);
      } catch (error) {
        console.error('Erro ao restaurar valor:', error);
        toast.error('Erro ao restaurar valor original');
      }
    });
  };

  const handleAdicionarTags = async (
    tagsIds: number[],
    dadosRegra?: { criterio: CriterioTipo; nomeRegra: string; tags: number[]; criterio_valor: string }
  ) => {
    startTransition(async () => {
      try {
        // Adicionar todas as tags
        for (const tagId of tagsIds) {
          await adicionarTagAction(transacao.id, tagId);
        }
        
        // Se usuário optou por criar regra
        if (dadosRegra) {
          const criterioValor = dadosRegra.criterio === CriterioTipo.CATEGORIA 
            ? (transacao.categoria || '') 
            : dadosRegra.criterio_valor;
          
          const regra = await criarRegraAction({
            nome: dadosRegra.nomeRegra,
            tipo_acao: TipoAcao.ADICIONAR_TAGS,
            criterio_tipo: dadosRegra.criterio,
            criterio_valor: criterioValor,
            acao_valor: 'placeholder', // Backend vai substituir, mas precisa de valor não-vazio
            tag_ids: dadosRegra.tags, // Passa IDs como array
          });
          
          toast.success(`Tags adicionadas e regra criada!`);
          setModalTags(false);
          setRegraParaAplicar({ id: regra.id, nome: regra.nome });
        } else {
          toast.success(`${tagsIds.length} tag(s) adicionada(s)!`);
          setModalTags(false);
        }
      } catch (error) {
        console.error('Erro ao adicionar tags:', error);
        toast.error('Erro ao adicionar tags');
      }
    });
  };

  const handleRemoverTag = async (tagId: number) => {
    startTransition(async () => {
      try {
        await removerTagAction(transacao.id, tagId);
        toast.success('Tag removida!');
      } catch (error) {
        console.error('Erro ao remover tag:', error);
        toast.error('Erro ao remover tag');
      }
    });
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Ações</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setModalCategoria(true)}
            disabled={isPending}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            ✏️ Editar Categoria
          </button>
          <button
            onClick={() => setModalValor(true)}
            disabled={isPending}
            className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            💰 Editar Valor
          </button>
          <button
            onClick={() => setModalTags(true)}
            disabled={isPending}
            className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            🏷️ Gerenciar Tags
          </button>
        </div>
      </div>

      {/* Modals */}
      <ModalEditarCategoria
        isOpen={modalCategoria}
        onClose={() => setModalCategoria(false)}
        categoriaAtual={transacao.categoria || ''}
        descricaoTransacao={transacao.descricao}
        onSalvar={handleSalvarCategoria}
        isPending={isPending}
      />

      <ModalEditarValor
        isOpen={modalValor}
        onClose={() => setModalValor(false)}
        valorAtual={transacao.valor}
        valorOriginal={transacao.valor_original}
        descricaoTransacao={transacao.descricao}
        categoriaAtual={transacao.categoria}
        onSalvar={handleSalvarValor}
        onRestaurar={transacao.valor_original !== undefined ? handleRestaurarValor : undefined}
        isPending={isPending}
      />

      <ModalEditarTags
        isOpen={modalTags}
        onClose={() => setModalTags(false)}
        transacaoId={transacao.id}
        tagsAtuais={transacao.tags || []}
        todasTags={todasTags}
        descricaoTransacao={transacao.descricao}
        categoriaAtual={transacao.categoria}
        onAdicionarTags={handleAdicionarTags}
        onRemoverTag={handleRemoverTag}
        isPending={isPending}
      />

      {/* Modal de Confirmação - Aplicar Regra Retroativamente */}
      {regraParaAplicar && (
        <ModalConfirmacao
          titulo="Aplicar Regra em Transações Existentes?"
          mensagem={`A regra "${regraParaAplicar.nome}" foi criada com sucesso!\n\nDeseja aplicá-la agora em todas as transações existentes que correspondem aos critérios? Isso pode modificar várias transações de uma vez.`}
          onConfirmar={handleAplicarRegraRetroativamente}
          onCancelar={() => setRegraParaAplicar(null)}
          textoBotaoConfirmar="Sim, Aplicar Agora"
          textoBotaoCancelar="Não, Aplicar Só nas Futuras"
          isPending={isPending}
        />
      )}
    </>
  );
}
