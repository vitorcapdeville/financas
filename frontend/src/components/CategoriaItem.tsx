'use client';

interface CategoriaItemProps {
  categoria: string;
  valor: number;
  tipo: 'entrada' | 'saida';
  onClick?: () => void;
}

export default function CategoriaItem({ categoria, valor, tipo, onClick }: CategoriaItemProps) {
  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  };

  return (
    <li className="flex justify-between items-center py-2 border-b border-gray-100 hover:bg-gray-50 transition-colors group">
      <div className="flex items-center gap-2 flex-1">
        <span className="text-gray-700">{categoria}</span>
        {onClick && (
          <button
            onClick={onClick}
            className="opacity-0 group-hover:opacity-100 text-xs text-blue-600 hover:text-blue-800 transition-opacity"
          >
            editar
          </button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className={`font-semibold ${tipo === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
          {formatarMoeda(valor)}
        </span>
        <span className="text-xs text-gray-400">
          {tipo === 'entrada' ? '↑' : '↓'}
        </span>
      </div>
    </li>
  );
}
