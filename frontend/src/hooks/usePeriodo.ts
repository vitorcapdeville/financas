'use client';

import { useState, useEffect } from 'react';
import { obterMesAtual, obterAnoAtual } from '@/utils/format';

const STORAGE_KEY_PERIODO = 'financas_periodo';
const STORAGE_KEY_DIA_INICIO = 'financas_dia_inicio';

export function usePeriodo() {
  // Inicializa com valor do localStorage ou default
  const [periodo, setPeriodo] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY_PERIODO);
      if (saved) return saved;
    }
    return `${obterAnoAtual()}-${String(obterMesAtual()).padStart(2, '0')}`;
  });

  const [diaInicio, setDiaInicio] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY_DIA_INICIO);
      if (saved) return parseInt(saved);
    }
    return 1;
  });

  // Persiste período no localStorage sempre que mudar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_PERIODO, periodo);
    }
  }, [periodo]);

  // Persiste dia de início no localStorage sempre que mudar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_DIA_INICIO, diaInicio.toString());
    }
  }, [diaInicio]);

  return {
    periodo,
    setPeriodo,
    diaInicio,
    setDiaInicio,
  };
}
