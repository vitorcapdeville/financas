"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export function NavegacaoPrincipal() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // TODAS as páginas preservam filtros (periodo, diaInicio, criterio, tags)
  // Isso permite que o usuário navegue entre diferentes seções sem perder o contexto temporal
  const construirQueryString = (targetPath: string) => {
    const params = new URLSearchParams();
    const periodo = searchParams.get("periodo");
    const diaInicio = searchParams.get("diaInicio");
    const criterio = searchParams.get("criterio");
    const tags = searchParams.get("tags");

    if (periodo) params.set("periodo", periodo);
    if (diaInicio) params.set("diaInicio", diaInicio);
    if (criterio) params.set("criterio", criterio);
    if (tags) params.set("tags", tags);

    return params.toString();
  };

  const links = [
    { href: "/", label: "Dashboard", icon: "◆", exact: true },
    { href: "/transacoes", label: "Transações", icon: "⟡", exact: false },
    { href: "/tags", label: "Tags", icon: "◇", exact: false },
    { href: "/regras", label: "Regras", icon: "◈", exact: false },
    { href: "/importar", label: "Importar", icon: "◆", exact: false },
    { href: "/configuracoes", label: "Config", icon: "⚙", exact: false },
  ];

  const isActive = (href: string, exact: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="mb-8 animate-fade-in-scale">
      <div className="relative">
        {/* Decorative accent line */}
        <div className="absolute -top-4 left-0 h-[2px] w-32 bg-gradient-to-r from-[#b8860b] to-transparent opacity-50"></div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {links.map((link, idx) => {
            const queryString = construirQueryString(link.href);
            const href = queryString
              ? `${link.href}?${queryString}`
              : link.href;
            const active = isActive(link.href, link.exact);

            return (
              <Link
                key={link.href}
                href={href}
                className={`group relative px-6 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 animate-fade-in-up delay-${
                  idx * 100
                }`}
                style={{
                  background: active
                    ? "linear-gradient(135deg, #0f3d3e 0%, #156064 100%)"
                    : "white",
                  color: active ? "white" : "#2d2d2d",
                  boxShadow: active
                    ? "0 4px 12px rgba(15, 61, 62, 0.25), 0 2px 4px rgba(0, 0, 0, 0.1)"
                    : "0 2px 4px rgba(47, 43, 67, 0.08)",
                }}
              >
                {/* Hover accent border */}
                {!active && (
                  <div className="absolute inset-0 rounded-xl border border-transparent group-hover:border-[#b8860b]/30 transition-colors duration-300"></div>
                )}

                {/* Icon and label */}
                <div className="flex items-center gap-2">
                  <span
                    className={`text-base ${
                      active
                        ? "opacity-100"
                        : "opacity-50 group-hover:opacity-100"
                    } transition-opacity`}
                  >
                    {link.icon}
                  </span>
                  <span className="tracking-wide">{link.label}</span>
                </div>

                {/* Active indicator */}
                {active && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1/2 h-[3px] bg-[#d4af37] rounded-full"></div>
                )}

                {/* Hover shimmer effect */}
                {!active && (
                  <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#b8860b]/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Scrollbar hide for horizontal scroll */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </nav>
  );
}
