'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

export function NavegacaoPrincipal() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // TODAS as páginas preservam filtros (periodo, diaInicio, criterio, tags)
  // Isso permite que o usuário navegue entre diferentes seções sem perder o contexto temporal
  const construirQueryString = (targetPath: string) => {

    const params = new URLSearchParams();
    const periodo = searchParams.get('periodo');
    const diaInicio = searchParams.get('diaInicio');
    const criterio = searchParams.get('criterio');
    const tags = searchParams.get('tags');

    if (periodo) params.set('periodo', periodo);
    if (diaInicio) params.set('diaInicio', diaInicio);
    if (criterio) params.set('criterio', criterio);
    if (tags) params.set('tags', tags);

    return params.toString();
  };

  const links = [
    { href: '/', label: '🏠 Dashboard', exact: true },
    { href: '/transacoes', label: '💳 Transações', exact: false },
    { href: '/tags', label: '🏷️ Tags', exact: false },
    { href: '/regras', label: '⚙️ Regras', exact: false },
    { href: '/importar', label: '📤 Importar', exact: false },
    { href: '/configuracoes', label: '⚙️ Configurações', exact: false },
  ];

  const isActive = (href: string, exact: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="bg-white shadow-sm mb-6 rounded-lg">
      <div className="flex gap-1 p-2 overflow-x-auto">
        {links.map((link) => {
          const queryString = construirQueryString(link.href);
          const href = queryString ? `${link.href}?${queryString}` : link.href;

          return (
            <Link
              key={link.href}
              href={href}
              className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                isActive(link.href, link.exact)
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
