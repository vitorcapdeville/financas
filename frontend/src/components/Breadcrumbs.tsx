"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Breadcrumbs() {
  const pathname = usePathname();

  const pathMap: Record<string, string> = {
    "/": "Dashboard",
    "/transacoes": "Transações",
    "/tags": "Tags",
    "/regras": "Regras",
    "/importar": "Importar",
    "/configuracoes": "Configurações",
    "/categoria": "Categoria",
    "/transacao": "Detalhes",
  };

  const segments = pathname.split("/").filter(Boolean);

  // Don't show breadcrumbs on homepage
//   if (pathname === "/") return null;

  const breadcrumbs = [
    { label: "Início", href: "/" },
    ...segments.map((segment, index) => {
      const href = "/" + segments.slice(0, index + 1).join("/");
      const label = pathMap[`/${segment}`] || decodeURIComponent(segment);
      return { label, href };
    }),
  ];

  return (
    <nav className="flex items-center gap-2 text-sm">
      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;
        return (
          <div key={crumb.href} className="flex items-center gap-2">
            {index > 0 && <span className="text-[#d4c5b9]">/</span>}
            {isLast ? (
              <span className="font-semibold text-[#0f3d3e]">
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="text-[#8b8378] hover:text-[#0f3d3e] transition-colors"
              >
                {crumb.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
