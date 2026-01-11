"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { tagsService } from "@/services/api.service";
import { Tag } from "@/types";

export default function FiltroTags() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tags, setTags] = useState<Tag[]>([]);
  const [tagsSelecionadas, setTagsSelecionadas] = useState<number[]>([]);
  const [semTags, setSemTags] = useState<boolean>(false);

  useEffect(() => {
    carregarTags();

    // Carregar tags selecionadas da URL
    const tagsParam = searchParams.get("tags");
    if (tagsParam) {
      const ids = tagsParam
        .split(",")
        .map((id) => parseInt(id))
        .filter((id) => !isNaN(id));
      setTagsSelecionadas(ids);
    }

    // Carregar filtro sem_tags da URL
    const semTagsParam = searchParams.get("sem_tags");
    setSemTags(semTagsParam === "true");
  }, [searchParams]);

  async function carregarTags() {
    try {
      const dados = await tagsService.listar();
      setTags(dados);
    } catch (error) {
      console.error("Erro ao carregar tags:", error);
    }
  }

  function toggleTag(tagId: number) {
    const novasSelecionadas = tagsSelecionadas.includes(tagId)
      ? tagsSelecionadas.filter((id) => id !== tagId)
      : [...tagsSelecionadas, tagId];

    setTagsSelecionadas(novasSelecionadas);
    aplicarFiltro(novasSelecionadas, semTags);
  }

  function toggleSemTags() {
    const novoValor = !semTags;
    setSemTags(novoValor);
    aplicarFiltro(tagsSelecionadas, novoValor);
  }

  function limparFiltro() {
    setTagsSelecionadas([]);
    setSemTags(false);
    aplicarFiltro([], false);
  }

  function aplicarFiltro(tagIds: number[], incluirSemTags: boolean = semTags) {
    const params = new URLSearchParams(searchParams);

    if (tagIds.length > 0) {
      params.set("tags", tagIds.join(","));
    } else {
      params.delete("tags");
    }

    if (incluirSemTags) {
      params.set("sem_tags", "true");
    } else {
      params.delete("sem_tags");
    }

    router.push(`?${params.toString()}`);
  }

  if (tags.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">
          Filtrar por Tags
        </h3>
        {(tagsSelecionadas.length > 0 || semTags) && (
          <button
            onClick={limparFiltro}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            Limpar filtros
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {/* Botão "Sem Tags" */}
        <button
          onClick={toggleSemTags}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border-2 ${
            semTags
              ? "bg-gray-600 text-white border-gray-700 ring-2 ring-offset-2 ring-gray-400"
              : "text-gray-600 bg-white border-gray-300 hover:bg-gray-50"
          }`}
        >
          🚫 Sem Tags
        </button>

        {/* Separador visual */}
        {tags.length > 0 && (
          <div className="w-px bg-gray-300 self-stretch mx-1"></div>
        )}

        {/* Tags normais */}
        {tags.map((tag) => {
          const selecionada = tagsSelecionadas.includes(tag.id);
          return (
            <button
              key={tag.id}
              onClick={() => toggleTag(tag.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                selecionada
                  ? "text-white ring-2 ring-offset-2"
                  : "text-gray-700 bg-gray-100 hover:bg-gray-200"
              }`}
              style={
                selecionada ? { backgroundColor: tag.cor || "#3B82F6" } : {}
              }
            >
              {tag.nome}
            </button>
          );
        })}
      </div>
      {(tagsSelecionadas.length > 0 || semTags) && (
        <p className="text-xs text-gray-500 mt-2">
          {semTags &&
            tagsSelecionadas.length === 0 &&
            "Mostrando apenas transações sem tags"}
          {semTags &&
            tagsSelecionadas.length > 0 &&
            `${tagsSelecionadas.length} tag${
              tagsSelecionadas.length > 1 ? "s" : ""
            } OU sem tags`}
          {!semTags &&
            tagsSelecionadas.length > 0 &&
            `${tagsSelecionadas.length} tag${
              tagsSelecionadas.length > 1 ? "s" : ""
            } selecionada${tagsSelecionadas.length > 1 ? "s" : ""}`}
        </p>
      )}
    </div>
  );
}
