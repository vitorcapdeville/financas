export interface BuildQueryOptions {
  searchParams?: Record<string, any> | URLSearchParams;
  periodo?: string;
  diaInicio?: number | string;
  criterio?: string;
  usuarioIdSelecionado?: number;
  origem?: string;
  tags?: string;
  sem_tags?: string | boolean;
}

export function construirQueryString(options: BuildQueryOptions = {}): string {
  const {
    searchParams,
    periodo,
    diaInicio,
    criterio,
    usuarioIdSelecionado,
    origem,
    tags,
    sem_tags,
  } = options;

  const params = new URLSearchParams();

  // Se searchParams for URLSearchParams, copie todas as entries
  if (searchParams instanceof URLSearchParams) {
    for (const [k, v] of Array.from(searchParams.entries())) {
      if (v != null) params.set(k, v);
    }
  } else if (searchParams && typeof searchParams === "object") {
    for (const [k, v] of Object.entries(searchParams)) {
      if (v === undefined || v === null) continue;
      params.set(k, String(v));
    }
  }

  // Overrides explícitos ganham precedência
  if (periodo) params.set("periodo", periodo);
  if (typeof diaInicio !== "undefined" && diaInicio !== null)
    params.set("diaInicio", String(diaInicio));
  if (criterio) params.set("criterio", criterio);
  if (typeof tags !== "undefined") params.set("tags", String(tags));
  if (typeof sem_tags !== "undefined") params.set("sem_tags", String(sem_tags));
  if (usuarioIdSelecionado)
    params.set("usuario_id", String(usuarioIdSelecionado));
  if (origem) params.set("origem", origem);

  return params.toString();
}
