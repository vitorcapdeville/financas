'use client';

import { useState, useTransition } from 'react';
import { toast } from 'react-hot-toast';
import { deletarTagAction } from '@/app/tags/actions';
import { Tag } from '@/types';
import { ModalConfirmacao } from './ModalConfirmacao';

interface ListaTagsProps {
  tags: Tag[];
}

export default function ListaTags({ tags }: ListaTagsProps) {
  const [tagParaDeletar, setTagParaDeletar] = useState<{ id: number; nome: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleDelete() {
    if (!tagParaDeletar) return;
    
    startTransition(async () => {
      try {
        await deletarTagAction(tagParaDeletar.id, tagParaDeletar.nome);
        setTagParaDeletar(null);
      } catch (error) {
        console.error('Erro ao deletar tag:', error);
        toast.error('Erro ao deletar tag. Tente novamente.');
        setTagParaDeletar(null);
      }
    });
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Tags Cadastradas</h2>
      {tags.length === 0 ? (
        <p className="text-gray-600 text-center py-8">
          Nenhuma tag cadastrada. Crie uma tag para começar.
        </p>
      ) : (
        <div className="space-y-3">
          {tags.map((tag) => (
            <div
              key={tag.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-8 h-8 rounded-full"
                  style={{ backgroundColor: tag.cor || '#3B82F6' }}
                />
                <div>
                  <h3 className="font-semibold text-gray-900">{tag.nome}</h3>
                  {tag.descricao && (
                    <p className="text-sm text-gray-600">{tag.descricao}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setTagParaDeletar({ id: tag.id, nome: tag.nome })}
                disabled={isPending}
                className="text-red-600 hover:text-red-800 px-4 py-2 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                Excluir
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Confirmação - Deletar Tag */}
      {tagParaDeletar && (
        <ModalConfirmacao
          titulo="Deletar Tag"
          mensagem={`Deseja realmente excluir a tag "${tagParaDeletar.nome}"? Ela será removida de todas as transações.`}
          onConfirmar={handleDelete}
          onCancelar={() => setTagParaDeletar(null)}
          textoBotaoConfirmar="Deletar"
          isPending={isPending}
          tipo="danger"
        />
      )}
    </div>
  );
}
