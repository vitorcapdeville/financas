import { Tag } from '@/types';
import { removerTagAction } from '@/app/transacao/[id]/actions';
import DropdownAdicionarTag from './DropdownAdicionarTag';

interface SeletorTagsProps {
  transacaoId: number;
  tagsAtuais: Tag[];
  todasTags: Tag[];
}

export default function SeletorTags({ 
  transacaoId, 
  tagsAtuais, 
  todasTags 
}: SeletorTagsProps) {
  const tagsDisponiveis = todasTags.filter(
    (tag) => !tagsAtuais.some((t) => t.id === tag.id)
  );

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Tags
      </label>
      
      {/* Tags atuais */}
      <div className="flex flex-wrap gap-2 min-h-[40px] items-center">
        {tagsAtuais.length === 0 ? (
          <span className="text-sm text-gray-400">Nenhuma tag</span>
        ) : (
          tagsAtuais.map((tag) => (
            <form
              key={tag.id}
              action={async () => {
                'use server';
                await removerTagAction(transacaoId, tag.id);
              }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium text-white"
              style={{ backgroundColor: tag.cor || '#3B82F6' }}
            >
              {tag.nome}
              <button
                type="submit"
                className="hover:bg-black hover:bg-opacity-20 rounded-full p-0.5 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </form>
          ))
        )}
      </div>

      {/* Botão para adicionar tags */}
      {tagsDisponiveis.length > 0 && (
        <DropdownAdicionarTag
          transacaoId={transacaoId}
          tagsDisponiveis={tagsDisponiveis}
        />
      )}
    </div>
  );
}
