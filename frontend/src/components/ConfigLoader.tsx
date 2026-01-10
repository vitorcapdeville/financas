"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

interface ConfigLoaderProps {
  diaInicioPeriodo: number;
  criterioDataTransacao: string;
}

/**
 * Componente responsável por carregar as configurações apenas uma vez
 * e garantir que elas estejam presentes na URL
 */
export function ConfigLoader({
  diaInicioPeriodo,
  criterioDataTransacao,
}: ConfigLoaderProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    let needsUpdate = false;

    // Se diaInicio não existe ou é diferente do configurado, atualiza
    const diaInicioAtual = params.get("diaInicio");
    const diaInicioBanco = diaInicioPeriodo.toString();
    if (!diaInicioAtual || diaInicioAtual !== diaInicioBanco) {
      params.set("diaInicio", diaInicioBanco);
      needsUpdate = true;
    }

    // Se criterio não existe ou é diferente do configurado, atualiza
    const criterioAtual = params.get("criterio");
    if (!criterioAtual || criterioAtual !== criterioDataTransacao) {
      params.set("criterio", criterioDataTransacao);
      needsUpdate = true;
    }

    // Se precisa atualizar, faz replace na URL com pathname correto
    if (needsUpdate) {
      const newUrl = params.toString()
        ? `${pathname}?${params.toString()}`
        : pathname;
      router.replace(newUrl, { scroll: false });
    }
  }, [pathname, searchParams, router, diaInicioPeriodo, criterioDataTransacao]);

  return null;
}
