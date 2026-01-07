'use client';

import { useState, useTransition } from 'react';
import { toast } from 'react-hot-toast';
import { Tag } from '@/types';
import { adicionarTagAction } from '@/app/transacao/[id]/actions';

interface DropdownAdicionarTagProps {
  transacaoId: number;
  tagsDisponiveis: Tag[];
}

export default function DropdownAdicionarTag({ 
  transacaoId, 
  tagsDisponiveis 
}: DropdownAdicionarTagProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleAdicionarTag(tagId: number) {
    startTransition(async () => {
      try {
        await adicionarTagAction(transacaoId, tagId);
        setShowDropdown(false);
      } catch (error) {
        console.error('Erro ao adicionar tag:', error);
        toast.error('Erro ao adicionar tag. Tente novamente.');
      }
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowDropdown(!showDropdown)}
        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        disabled={isPending}
      >
        + Adicionar tag
      </button>

      {showDropdown && (
        <div className="absolute z-10 mt-1 w-64 bg-white rounded-md shadow-lg border border-gray-200">
          <div className="py-1 max-h-60 overflow-y-auto">
            {tagsDisponiveis.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => handleAdicionarTag(tag.id)}
                disabled={isPending}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: tag.cor || '#3B82F6' }}
                />
                <span className="text-gray-900">{tag.nome}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
