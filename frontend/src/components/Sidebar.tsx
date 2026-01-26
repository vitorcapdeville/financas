"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const construirQueryString = () => {
    const params = new URLSearchParams();
    const periodo = searchParams.get("periodo");
    const diaInicio = searchParams.get("diaInicio");
    const criterio = searchParams.get("criterio");
    const tags = searchParams.get("tags");
    const usuario_id = searchParams.get("usuario_id");

    if (periodo) params.set("periodo", periodo);
    if (diaInicio) params.set("diaInicio", diaInicio);
    if (criterio) params.set("criterio", criterio);
    if (tags) params.set("tags", tags);
    if (usuario_id) params.set("usuario_id", usuario_id);

    return params.toString();
  };

  const links = [
    { href: "/", label: "Dashboard", icon: "📊", exact: true },
    { href: "/transacoes", label: "Transações", icon: "💸", exact: false },
    { href: "/tags", label: "Tags", icon: "🏷️", exact: false },
    { href: "/regras", label: "Regras", icon: "⚙️", exact: false },
    { href: "/importar", label: "Importar", icon: "📤", exact: false },
    {
      href: "/configuracoes",
      label: "Configurações",
      icon: "⚙",
      exact: false,
    },
  ];

  const isActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-50 
          bg-gradient-to-b from-[#faf8f5] to-white
          border-r-2 border-[#d4c5b9]
          transition-all duration-300 ease-in-out
          ${isOpen ? "w-64" : "w-20"}
          lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header / Logo */}
          <div className="p-6 border-b-2 border-[#d4c5b9]">
            <Link href="/" className="block">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background:
                      "linear-gradient(135deg, #0f3d3e 0%, #156064 100%)",
                  }}
                >
                  <span className="text-2xl">💰</span>
                </div>
                {isOpen && (
                  <div className="overflow-hidden">
                    <h1 className="text-xl font-bold text-display text-[#0f3d3e] whitespace-nowrap">
                      Finanças
                    </h1>
                    <p className="text-xs text-[#8b8378]">Pessoais</p>
                  </div>
                )}
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
            {links.map((link, idx) => {
              const queryString = construirQueryString();
              const href = queryString
                ? `${link.href}?${queryString}`
                : link.href;
              const active = isActive(link.href, link.exact);

              return (
                <Link
                  key={link.href}
                  href={href}
                  className={`
                    group relative flex items-center gap-3 px-4 py-3 rounded-xl
                    transition-all duration-300
                    ${
                      active
                        ? "text-white"
                        : "text-[#2d2d2d] hover:bg-[#0f3d3e]/5"
                    }
                  `}
                  style={{
                    background: active
                      ? "linear-gradient(135deg, #0f3d3e 0%, #156064 100%)"
                      : "transparent",
                    boxShadow: active
                      ? "0 4px 12px rgba(15, 61, 62, 0.25)"
                      : "none",
                  }}
                  onClick={() => {
                    // Close mobile menu on navigation
                    if (window.innerWidth < 1024) {
                      setIsOpen(false);
                    }
                  }}
                >
                  {/* Active indicator */}
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#d4af37] rounded-r-full" />
                  )}

                  {/* Icon */}
                  <span
                    className={`text-xl flex-shrink-0 transition-transform duration-300 ${
                      !isOpen && !active ? "group-hover:scale-110" : ""
                    }`}
                  >
                    {link.icon}
                  </span>

                  {/* Label */}
                  {isOpen && (
                    <span className="font-medium whitespace-nowrap">
                      {link.label}
                    </span>
                  )}

                  {/* Hover effect */}
                  {!active && isOpen && (
                    <div className="absolute right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#b8860b]" />
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer / Collapse Toggle */}
          <div className="p-3 border-t-2 border-[#d4c5b9]">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="hidden lg:flex items-center justify-center w-full px-4 py-3 rounded-xl
                       text-[#2d2d2d] hover:bg-[#0f3d3e]/5 transition-all duration-300
                       border-2 border-transparent hover:border-[#d4c5b9]"
              title={isOpen ? "Recolher sidebar" : "Expandir sidebar"}
            >
              <span className="text-xl">{isOpen ? "◀" : "▶"}</span>
              {isOpen && (
                <span className="ml-3 font-medium text-sm">Recolher</span>
              )}
            </button>

            {/* Mobile close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden flex items-center justify-center w-full px-4 py-3 rounded-xl
                       text-white transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, #c44536 0%, #e67e22 100%)",
              }}
            >
              <span className="text-xl">✕</span>
              <span className="ml-3 font-medium text-sm">Fechar</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
