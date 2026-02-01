"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { importacaoService, usuariosService } from "@/services/api.service";
import { toast } from "react-hot-toast";
import { Usuario } from "@/types";

export default function ImportarPage() {
  const [uploading, setUploading] = useState(false);
  const [arquivos, setArquivos] = useState<File[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<number>(0); 

  // Carregar lista de usuários
  useEffect(() => {
    const carregarUsuarios = async () => {
      try {
        const lista = await usuariosService.listar();
        setUsuarios(lista);
        setUsuarioSelecionado(lista[0]?.id || 0);
      } catch (error) {
        console.error("Erro ao carregar usuários:", error);
        toast.error("Erro ao carregar lista de usuários");
      }
    };
    carregarUsuarios();
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setArquivos(files);
  };

  const removerArquivo = (index: number) => {
    setArquivos((prev) => prev.filter((_, i) => i !== index));

    // Resetar input se não houver mais arquivos
    if (arquivos.length === 1) {
      const fileInput = document.getElementById(
        "file-input",
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (arquivos.length === 0) return;

    try {
      setUploading(true);

      const resultado = await importacaoService.importarArquivos(
        arquivos,
        undefined, // Não envia senhas - backend usa CPF automaticamente
        usuarioSelecionado,
      );

      // Mostrar resultados
      const sucessos = resultado.resultados.filter((r) => r.sucesso);
      const erros = resultado.resultados.filter((r) => !r.sucesso);

      if (sucessos.length > 0) {
        const msg =
          arquivos.length === 1
            ? `${resultado.total_transacoes_importadas} transações importadas!`
            : `${resultado.total_transacoes_importadas} transações importadas de ${sucessos.length} arquivo(s)!`;
        toast.success(msg, { duration: 5000 });
      }

      if (erros.length > 0) {
        erros.forEach((erro) => {
          toast.error(`${erro.nome_arquivo}: ${erro.erro}`, { duration: 7000 });
        });
      }

      // Limpar apenas os arquivos que tiveram sucesso
      if (sucessos.length === arquivos.length) {
        setArquivos([]);
        const fileInput = document.getElementById(
          "file-input",
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = "";
      } else {
        // Remover apenas os bem-sucedidos
        const nomesSuccesso = sucessos.map((s) => s.nome_arquivo);
        setArquivos((prev) =>
          prev.filter((arquivo) => !nomesSuccesso.includes(arquivo.name)),
        );
      }
    } catch (error: any) {
      console.error("Erro ao importar:", error);
      toast.error(error.message || "Erro ao importar arquivos");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <header className="mb-10 animate-fade-in-up">
        <div className="flex items-baseline gap-4 mb-3">
          <h1 className="text-5xl md:text-6xl font-bold text-display text-gradient-emerald">
            Importar
          </h1>
          <div className="h-2 w-2 rounded-full bg-[#b8860b] animate-float"></div>
        </div>
        <p className="text-lg text-[#8b8378]">
          Importe extratos bancários e faturas de cartão de crédito
        </p>
      </header>

      {/* Upload */}
      <div className="card-premium p-10 mb-8 animate-fade-in-up delay-200">
        <div className="mb-8 text-center">
          <div
            className="inline-flex items-center justify-center p-6 rounded-2xl mb-6"
            style={{
              background: "linear-gradient(135deg, #0f3d3e 0%, #156064 100%)",
            }}
          >
            <svg
              className="w-14 h-14 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-display text-[#0f3d3e] mb-3">
            Selecionar Arquivos
          </h2>
          <p className="text-[#8b8378]">
            Selecione um ou mais arquivos para importar
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Seletor de Usuário */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-[#0f3d3e]">
              Usuário Responsável
            </label>
            <select
              value={usuarioSelecionado}
              onChange={(e) => setUsuarioSelecionado(Number(e.target.value))}
              disabled={uploading}
              className="w-full px-4 py-3 rounded-xl border-2 border-[#156064]/30
                focus:border-[#156064] focus:outline-none transition-all
                disabled:opacity-50 disabled:cursor-not-allowed
                text-[#2d2d2d] font-medium bg-white shadow-sm
                hover:border-[#156064]/50"
            >
              {usuarios.map((usuario) => (
                <option key={usuario.id} value={usuario.id}>
                  {usuario.nome}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-[#8b8378]">
              Todas as transações importadas serão associadas a este usuário
            </p>
          </div>

          <div>
            <label className="block">
              <input
                id="file-input"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                disabled={uploading}
                multiple
                className="block w-full text-sm text-[#2d2d2d]
                    file:mr-4 file:py-4 file:px-8
                    file:rounded-xl file:border-0
                    file:font-semibold file:text-white
                    file:bg-gradient-to-br file:from-[#0f3d3e] file:to-[#156064]
                    file:shadow-[0_4px_12px_rgba(15,61,62,0.25)]
                    file:cursor-pointer file:transition-all file:duration-300
                    hover:file:scale-105 hover:file:shadow-[0_8px_16px_rgba(15,61,62,0.35)]
                    disabled:opacity-50 disabled:cursor-not-allowed
                    cursor-pointer"
              />
            </label>
          </div>

          {/* Lista de Arquivos Selecionados */}
          {arquivos.length > 0 && (
            <div className="space-y-6 animate-fade-in-scale">
              <h3 className="text-lg font-bold text-[#0f3d3e]">
                Arquivos Selecionados ({arquivos.length})
              </h3>

              <div className="space-y-3">
                {arquivos.map((arquivo, index) => (
                  <div
                    key={index}
                    className="bg-[#faf8f5] border-2 border-[#d4c5b9] rounded-xl p-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <svg
                            className="w-5 h-5 text-[#156064]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <span className="font-semibold text-[#2d2d2d] break-all">
                            {arquivo.name}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removerArquivo(index)}
                        disabled={uploading}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors
                          disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Remover arquivo"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botão de Envio */}
          {arquivos.length > 0 && (
            <div className="animate-fade-in-scale">
              <button
                type="submit"
                disabled={uploading}
                className="w-full py-4 px-8 rounded-xl font-semibold text-white
                  bg-gradient-to-br from-[#0f3d3e] to-[#156064]
                  shadow-[0_4px_12px_rgba(15,61,62,0.25)]
                  hover:scale-105 hover:shadow-[0_8px_16px_rgba(15,61,62,0.35)]
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                  transition-all duration-300"
              >
                {uploading
                  ? "Processando..."
                  : `Importar ${arquivos.length} Arquivo${arquivos.length > 1 ? "s" : ""}`}
              </button>
            </div>
          )}
        </form>

        {uploading && (
          <div className="mt-6 flex flex-col items-center animate-fade-in-scale">
            <div className="inline-block animate-spin">
              <svg
                className="w-8 h-8"
                style={{ color: "#156064" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </div>
            <p className="text-[#8b8378] mt-3 font-medium">
              Processando {arquivos.length} arquivo(s)...
            </p>
          </div>
        )}
      </div>

      {/* Informacoes Adicionais */}
      <div className="mt-8 space-y-6 animate-fade-in-up delay-300">
        <div className="card-premium p-8 relative overflow-hidden">
          <div
            className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-5"
            style={{
              background: "linear-gradient(135deg, #0f3d3e, #156064)",
            }}
          ></div>
          <div className="relative z-10">
            <h3 className="text-xl font-bold text-display text-[#0f3d3e] mb-4 flex items-center gap-3">
              <span className="text-2xl">🤖</span>
              Detecao Automatica
            </h3>
            <p className="text-[#2d2d2d] mb-4">
              O sistema detecta automaticamente o tipo de arquivo pelo nome:
            </p>
            <ul className="text-[#2d2d2d] space-y-4">
              <li className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1"
                  style={{
                    background: "linear-gradient(135deg, #156064, #2a7c7f)",
                  }}
                >
                  <span className="text-white text-sm">📊</span>
                </div>
                <div className="flex-1">
                  <strong className="block mb-2">Extrato BTG:</strong>
                  <code className="block bg-[#faf8f5] px-3 py-2 rounded-lg text-xs border border-[#d4c5b9] font-mono">
                    Extrato_YYYY-MM-DD_a_YYYY-MM-DD_NNNN
                  </code>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1"
                  style={{
                    background: "linear-gradient(135deg, #b8860b, #d4af37)",
                  }}
                >
                  <span className="text-white text-sm">�</span>
                </div>
                <div className="flex-1">
                  <strong className="block mb-2">Fatura BTG:</strong>
                  <code className="block bg-[#faf8f5] px-3 py-2 rounded-lg text-xs border border-[#d4c5b9] font-mono mb-2">
                    YYYY-MM-DD_Fatura_NOME_NNNN_BTG.xlsx
                  </code>
                  <span className="text-xs text-[#8b8378] italic">
                    A senha do arquivo é obtida automaticamente do CPF do
                    usuário selecionado
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1"
                  style={{
                    background: "linear-gradient(135deg, #8b4513, #a0522d)",
                  }}
                >
                  <span className="text-white text-sm">💳</span>
                </div>
                <div className="flex-1">
                  <strong className="block mb-2">Fatura Nubank:</strong>
                  <code className="block bg-[#faf8f5] px-3 py-2 rounded-lg text-xs border border-[#d4c5b9] font-mono">
                    Nubank_YYYY-MM-DD.csv
                  </code>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1"
                  style={{
                    background: "linear-gradient(135deg, #2d8659, #38a169)",
                  }}
                >
                  <span className="text-white text-sm">📊</span>
                </div>
                <div className="flex-1">
                  <strong className="block mb-2">Extrato Nubank:</strong>
                  <code className="block bg-[#faf8f5] px-3 py-2 rounded-lg text-xs border border-[#d4c5b9] font-mono">
                    NU_NNNN_DDMMMYYYY_DDMMMYYYY
                  </code>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1"
                  style={{
                    background: "linear-gradient(135deg, #8b8378, #a09589)",
                  }}
                >
                  <span className="text-white text-sm">📄</span>
                </div>
                <div className="flex-1">
                  <strong className="block mb-2">Arquivo Tratado:</strong>
                  <span className="text-sm text-[#8b8378]">
                    Qualquer outro nome (CSV/Excel com colunas normalizadas)
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="card-premium p-8 relative overflow-hidden border-2 border-[#e67e22]/20">
          <div
            className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-5"
            style={{ background: "#e67e22" }}
          ></div>
          <div className="relative z-10">
            <h3 className="text-lg font-bold text-[#0f3d3e] mb-4 flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "#e67e22" }}
              >
                <span className="text-white text-sm">📄</span>
              </div>
              Arquivo Tratado (CSV/Excel Normalizado)
            </h3>
            <p className="text-[#2d2d2d] text-sm mb-4">
              Se você está enviando um arquivo que não segue os padrões de nomes
              acima, ele será tratado como arquivo normalizado. Neste caso, siga
              as especificações abaixo:
            </p>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-[#2d2d2d] font-semibold mb-3">
                  Colunas Obrigatórias:
                </p>
                <div className="bg-[#faf8f5] rounded-lg p-4 text-sm text-[#2d2d2d] space-y-2 border border-[#d4c5b9]">
                  <div className="font-mono flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#156064] mt-2"></span>
                    <div>
                      <strong>data</strong> - DD/MM/YYYY ou YYYY-MM-DD
                    </div>
                  </div>
                  <div className="font-mono flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#156064] mt-2"></span>
                    <div>
                      <strong>descricao</strong> - Descrição da transação
                    </div>
                  </div>
                  <div className="font-mono flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#156064] mt-2"></span>
                    <div>
                      <strong>valor</strong> - Valor numérico
                    </div>
                  </div>
                  <div className="font-mono flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#156064] mt-2"></span>
                    <div>
                      <strong>origem</strong> - Tipo de origem da transação
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm text-[#2d2d2d] font-semibold mb-3">
                  Campo{" "}
                  <code className="bg-[#faf8f5] px-2 py-0.5 rounded border border-[#d4c5b9]">
                    origem
                  </code>{" "}
                  - Valores Aceitos:
                </p>
                <div className="bg-[#faf8f5] rounded-lg p-4 text-sm text-[#2d2d2d] space-y-3 border border-[#d4c5b9]">
                  <div>
                    <strong className="font-mono block mb-2">
                      extrato_bancario
                    </strong>
                    <ul className="text-[#8b8378] space-y-1 ml-6">
                      <li className="flex items-start gap-2">
                        <span className="text-[#2d8659]">✓</span>
                        <span>valor positivo = Entrada</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#2d8659]">✓</span>
                        <span>valor negativo = Saída</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <strong className="font-mono block mb-2">
                      fatura_cartao
                    </strong>
                    <ul className="text-[#8b8378] space-y-1 ml-6">
                      <li className="flex items-start gap-2">
                        <span className="text-[#2d8659]">✓</span>
                        <span>Sempre será tratado como Saída</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#2d8659]">✓</span>
                        <span>valor deve ser sempre positivo</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm text-[#2d2d2d] font-semibold mb-3">
                  Colunas Opcionais:
                </p>
                <div className="bg-[#faf8f5] rounded-lg p-4 text-sm text-[#2d2d2d] space-y-2 border border-[#d4c5b9] font-mono">
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8b8378] mt-2"></span>
                    <div>categoria - Categoria da transação</div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8b8378] mt-2"></span>
                    <div>banco - Nome do banco/instituição</div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8b8378] mt-2"></span>
                    <div>data_fatura - Data de pagamento/fechamento</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up delay-[400ms]">
          {/* Extrato BTG */}
          <div className="card-premium p-6 relative overflow-hidden">
            <div
              className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-5"
              style={{
                background: "linear-gradient(135deg, #156064, #2a7c7f)",
              }}
            ></div>
            <div className="relative z-10">
              <h3 className="text-lg font-bold text-[#0f3d3e] mb-3 flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #156064, #2a7c7f)",
                  }}
                >
                  <span className="text-white text-sm">📊</span>
                </div>
                Extrato BTG
              </h3>
              <p className="text-sm text-[#8b8378] mb-4">
                Formato esperado para extratos do banco BTG Pactual
              </p>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-[#2d2d2d] font-semibold mb-2">
                    Padrão do Nome:
                  </p>
                  <code className="block text-xs bg-[#faf8f5] px-3 py-2 rounded-lg border border-[#d4c5b9] font-mono text-[#2d2d2d]">
                    Extrato_YYYY-MM-DD_a_YYYY-MM-DD_NNNN
                  </code>
                </div>
                <div>
                  <p className="text-xs text-[#2d2d2d] font-semibold mb-2">
                    Formatos Aceitos:
                  </p>
                  <ul className="text-sm text-[#8b8378] space-y-1">
                    <li className="flex items-start gap-2">
                      <span className="text-[#2d8659]">✓</span>
                      <span>XLS (Excel 97-2003)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#2d8659]">✓</span>
                      <span>XLSX (Excel moderno)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Fatura BTG */}
          <div className="card-premium p-6 relative overflow-hidden">
            <div
              className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-5"
              style={{
                background: "linear-gradient(135deg, #b8860b, #d4af37)",
              }}
            ></div>
            <div className="relative z-10">
              <h3 className="text-lg font-bold text-[#0f3d3e] mb-3 flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #b8860b, #d4af37)",
                  }}
                >
                  <span className="text-white text-sm">💳</span>
                </div>
                Fatura BTG
              </h3>
              <p className="text-sm text-[#8b8378] mb-4">
                Formato esperado para faturas do cartão BTG
              </p>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-[#2d2d2d] font-semibold mb-2">
                    Padrão do Nome:
                  </p>
                  <code className="block text-xs bg-[#faf8f5] px-3 py-2 rounded-lg border border-[#d4c5b9] font-mono text-[#2d2d2d]">
                    YYYY-MM-DD_Fatura_NOME_NNNN_BTG
                  </code>
                </div>
                <div>
                  <p className="text-xs text-[#2d2d2d] font-semibold mb-2">
                    Formatos Aceitos:
                  </p>
                  <ul className="text-sm text-[#8b8378] space-y-1">
                    <li className="flex items-start gap-2">
                      <span className="text-[#2d8659]">✓</span>
                      <span>XLS (Excel 97-2003)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#2d8659]">✓</span>
                      <span>XLSX (Excel moderno)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Extrato Nubank */}
          <div className="card-premium p-6 relative overflow-hidden">
            <div
              className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-5"
              style={{
                background: "linear-gradient(135deg, #2d8659, #38a169)",
              }}
            ></div>
            <div className="relative z-10">
              <h3 className="text-lg font-bold text-[#0f3d3e] mb-3 flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #2d8659, #38a169)",
                  }}
                >
                  <span className="text-white text-sm">📊</span>
                </div>
                Extrato Nubank
              </h3>
              <p className="text-sm text-[#8b8378] mb-4">
                Formato esperado para extratos do Nubank
              </p>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-[#2d2d2d] font-semibold mb-2">
                    Padrão do Nome:
                  </p>
                  <code className="block text-xs bg-[#faf8f5] px-3 py-2 rounded-lg border border-[#d4c5b9] font-mono text-[#2d2d2d] break-all">
                    NU_NNNN_DDMMMYYYY_DDMMMYYYY
                  </code>
                </div>
                <div>
                  <p className="text-xs text-[#2d2d2d] font-semibold mb-2">
                    Formatos Aceitos:
                  </p>
                  <ul className="text-sm text-[#8b8378] space-y-1">
                    <li className="flex items-start gap-2">
                      <span className="text-[#2d8659]">✓</span>
                      <span>CSV</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#2d8659]">✓</span>
                      <span>XLS/XLSX</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Fatura Nubank */}
          <div className="card-premium p-6 relative overflow-hidden">
            <div
              className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-5"
              style={{ background: "#8b4513" }}
            ></div>
            <div className="relative z-10">
              <h3 className="text-lg font-bold text-[#0f3d3e] mb-3 flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #8b4513, #a0522d)",
                  }}
                >
                  <span className="text-white text-sm">💳</span>
                </div>
                Fatura Nubank
              </h3>
              <p className="text-sm text-[#8b8378] mb-4">
                Formato esperado para faturas do Nubank
              </p>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-[#2d2d2d] font-semibold mb-2">
                    Padrão do Nome:
                  </p>
                  <code className="block text-xs bg-[#faf8f5] px-3 py-2 rounded-lg border border-[#d4c5b9] font-mono text-[#2d2d2d]">
                    Nubank_YYYY-MM-DD
                  </code>
                </div>
                <div>
                  <p className="text-xs text-[#2d2d2d] font-semibold mb-2">
                    Formatos Aceitos:
                  </p>
                  <ul className="text-sm text-[#8b8378] space-y-1">
                    <li className="flex items-start gap-2">
                      <span className="text-[#2d8659]">✓</span>
                      <span>CSV</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#2d8659]">✓</span>
                      <span>XLS/XLSX</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card-premium p-8 relative overflow-hidden animate-fade-in-up delay-500">
          <div
            className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-5"
            style={{
              background: "linear-gradient(135deg, #b8860b, #d4af37)",
            }}
          ></div>
          <div className="relative z-10">
            <h3 className="text-2xl font-bold text-display text-[#0f3d3e] mb-6 flex items-center gap-3">
              <span className="text-3xl">✨</span>
              Processamento Automático
            </h3>
            <ul className="text-[#2d2d2d] space-y-3">
              <li className="flex items-start gap-3">
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{
                    background: "linear-gradient(135deg, #2d8659, #38a169)",
                  }}
                >
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
                <span>
                  Parser automático baseado no tipo de arquivo detectado
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{
                    background: "linear-gradient(135deg, #2d8659, #38a169)",
                  }}
                >
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
                <span>Normalização automática de datas e valores</span>
              </li>
              <li className="flex items-start gap-3">
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{
                    background: "linear-gradient(135deg, #2d8659, #38a169)",
                  }}
                >
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
                <span>Tag "Rotina" adicionada automaticamente</span>
              </li>
              <li className="flex items-start gap-3">
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{
                    background: "linear-gradient(135deg, #2d8659, #38a169)",
                  }}
                >
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
                <span>Regras ativas aplicadas às transações importadas</span>
              </li>
              <li className="flex items-start gap-3">
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{
                    background: "linear-gradient(135deg, #2d8659, #38a169)",
                  }}
                >
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
                <span>Duplicatas são ignoradas automaticamente</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
