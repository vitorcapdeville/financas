'use client';

interface ModalConfirmacaoProps {
  titulo: string;
  mensagem: string;
  onConfirmar: () => void;
  onCancelar: () => void;
  textoBotaoConfirmar?: string;
  textoBotaoCancelar?: string;
  isPending?: boolean;
  tipo?: 'danger' | 'warning' | 'info';
}

export function ModalConfirmacao({
  titulo,
  mensagem,
  onConfirmar,
  onCancelar,
  textoBotaoConfirmar = 'Confirmar',
  textoBotaoCancelar = 'Cancelar',
  isPending = false,
  tipo = 'info',
}: ModalConfirmacaoProps) {
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isPending) {
      onCancelar();
    }
  };

  const cores = {
    danger: {
      icone: '⚠️',
      bg: 'bg-red-100',
      text: 'text-red-900',
      botao: 'bg-red-600 hover:bg-red-700',
    },
    warning: {
      icone: '⚡',
      bg: 'bg-yellow-100',
      text: 'text-yellow-900',
      botao: 'bg-yellow-600 hover:bg-yellow-700',
    },
    info: {
      icone: 'ℹ️',
      bg: 'bg-blue-100',
      text: 'text-blue-900',
      botao: 'bg-blue-600 hover:bg-blue-700',
    },
  };

  const estilo = cores[tipo];

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 animate-fade-in">
        <div className={`${estilo.bg} p-6 rounded-t-lg`}>
          <div className="flex items-center gap-3">
            <span className="text-4xl">{estilo.icone}</span>
            <h2 className={`text-2xl font-bold ${estilo.text}`}>{titulo}</h2>
          </div>
        </div>

        <div className="p-6">
          <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">{mensagem}</p>
        </div>

        <div className="flex gap-3 p-6 pt-0">
          <button
            onClick={onCancelar}
            className="flex-1 bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors disabled:opacity-50"
            disabled={isPending}
          >
            {textoBotaoCancelar}
          </button>
          <button
            onClick={onConfirmar}
            className={`flex-1 ${estilo.botao} text-white px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50`}
            disabled={isPending}
          >
            {isPending ? 'Processando...' : textoBotaoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}