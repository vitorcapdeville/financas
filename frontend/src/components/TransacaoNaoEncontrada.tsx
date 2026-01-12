import Link from "next/link";

interface TransacaoNaoEncontradaProps {
  queryString: string;
}

export default function TransacaoNaoEncontrada({
  queryString,
}: TransacaoNaoEncontradaProps) {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="card-premium p-12 text-center max-w-md animate-fade-in-scale">
        <div
          className="inline-flex items-center justify-center p-6 rounded-2xl mb-6"
          style={{ background: "linear-gradient(135deg, #c44536, #e67e22)" }}
        >
          <span className="text-4xl">⚠️</span>
        </div>
        <p className="text-[#8b8378] text-lg mb-6">Transação não encontrada</p>
        <Link
          href={`/transacoes?${queryString}`}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
          style={{ background: "linear-gradient(135deg, #0f3d3e, #156064)" }}
        >
          <span>←</span>
          <span>Voltar para transações</span>
        </Link>
      </div>
    </div>
  );
}
