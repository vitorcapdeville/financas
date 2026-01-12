import Link from "next/link";

interface HeaderEdicaoProps {
  titulo: string;
  transacaoId: number;
  queryString: string;
}

export default function HeaderEdicao({
  titulo,
  transacaoId,
  queryString,
}: HeaderEdicaoProps) {
  return (
    <div className="mb-10 max-w-3xl">
      <div className="animate-fade-in-up delay-100">
        <Link
          href={`/transacao/${transacaoId}?${queryString}`}
          className="inline-flex items-center gap-2 text-[#156064] hover:text-[#0f3d3e] mb-6 transition-colors group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">
            ←
          </span>
          <span className="font-medium">Voltar para detalhes</span>
        </Link>
        <div className="flex items-baseline gap-4">
          <h1 className="text-5xl md:text-6xl font-bold text-display text-gradient-emerald">
            {titulo}
          </h1>
          <div className="h-2 w-2 rounded-full bg-[#b8860b] animate-float"></div>
        </div>
      </div>
    </div>
  );
}
