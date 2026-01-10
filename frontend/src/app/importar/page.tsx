"use client";

import { useState } from "react";
import Link from "next/link";
import { importacaoService } from "@/services/api.service";
import { toast } from "react-hot-toast";
import BotaoVoltar from "@/components/BotaoVoltar";

export default function ImportarPage() {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const resultado = await importacaoService.importarArquivo(file);
      toast.success(
        `${resultado.total_importado} transações importadas com sucesso!`
      );

      // Limpar input
      event.target.value = "";
    } catch (error: any) {
      console.error("Erro ao importar:", error);
      toast.error(error.response?.data?.detail || "Erro ao importar arquivo");
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Botão Voltar */}
        <div className="mb-4">
          <BotaoVoltar />
        </div>

        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Importar Dados
          </h1>
          <p className="text-gray-600">
            Importe extratos bancários e faturas de cartão de crédito
          </p>
        </header>

        {/* Upload Único */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="text-center">
            <div className="mb-6">
              <div className="inline-block p-4 bg-primary-50 rounded-full mb-4">
                <svg
                  className="w-12 h-12 text-primary-600"
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
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Enviar Arquivo
              </h2>
              <p className="text-gray-600">
                O sistema detecta automaticamente o tipo de arquivo
              </p>
            </div>

            <label className="block">
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleUpload}
                disabled={uploading}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-3 file:px-6
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary-600 file:text-white
                  hover:file:bg-primary-700
                  disabled:opacity-50 disabled:cursor-not-allowed
                  cursor-pointer"
              />
            </label>

            {uploading && (
              <div className="mt-4">
                <div className="inline-block animate-spin">
                  <svg
                    className="w-6 h-6 text-primary-600"
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
                <p className="text-gray-600 mt-2">Processando arquivo...</p>
              </div>
            )}
          </div>
        </div>

        {/* Informações Adicionais */}
        <div className="mt-8 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              🤖 Detecção Automática
            </h3>
            <p className="text-blue-800 text-sm mb-3">
              O sistema detecta automaticamente o tipo de arquivo pelo nome do
              arquivo enviado:
            </p>
            <ul className="text-blue-800 text-sm space-y-2">
              <li className="flex items-start">
                <span className="mr-2">📊</span>
                <div>
                  <strong>Extrato BTG:</strong>{" "}
                  <code className="bg-white px-2 py-1 rounded text-xs block mt-1">
                    Extrato_YYYY-MM-DD_a_YYYY-MM-DD_NNNN
                  </code>
                </div>
              </li>
              <li className="flex items-start">
                <span className="mr-2">💳</span>
                <div>
                  <strong>Fatura BTG:</strong>{" "}
                  <code className="bg-white px-2 py-1 rounded text-xs block mt-1">
                    YYYY-MM-DD_Fatura_NOME_NNNN_BTG
                  </code>
                </div>
              </li>
              <li className="flex items-start">
                <span className="mr-2">💳</span>
                <div>
                  <strong>Fatura Nubank:</strong>{" "}
                  <code className="bg-white px-2 py-1 rounded text-xs block mt-1">
                    Nubank_YYYY-MM-DD
                  </code>
                </div>
              </li>
              <li className="flex items-start">
                <span className="mr-2">📊</span>
                <div>
                  <strong>Extrato Nubank:</strong>{" "}
                  <code className="bg-white px-2 py-1 rounded text-xs block mt-1">
                    NU_NNNN_DDMMMYYYY_DDMMMYYYY
                  </code>
                </div>
              </li>
              <li className="flex items-start">
                <span className="mr-2">📄</span>
                <div>
                  <strong>Arquivo Tratado:</strong> Qualquer outro nome
                  (CSV/Excel com colunas normalizadas)
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-4">
            <h3 className="text-base font-semibold text-amber-900 mb-3 flex items-center">
              <span className="mr-2">📄</span>
              Arquivo Tratado (CSV/Excel Normalizado)
            </h3>
            <p className="text-amber-800 text-xs mb-3">
              Se você está enviando um arquivo que não segue os padrões de nomes
              acima, ele será tratado como arquivo normalizado. Neste caso, siga
              as especificações abaixo:
            </p>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-amber-800 font-semibold mb-2">
                  Colunas Obrigatórias:
                </p>
                <div className="bg-white rounded p-3 text-xs text-gray-700 space-y-2">
                  <div className="font-mono">
                    <div>
                      • <strong>data</strong> - DD/MM/YYYY ou YYYY-MM-DD
                    </div>
                    <div>
                      • <strong>descricao</strong> - Descrição da transação
                    </div>
                    <div>
                      • <strong>valor</strong> - Valor numérico
                    </div>
                    <div>
                      • <strong>origem</strong> - Tipo de origem da transação
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs text-amber-800 font-semibold mb-2">
                  Campo <code className="bg-white px-1">origem</code> - Valores
                  Aceitos:
                </p>
                <div className="bg-white rounded p-3 text-xs text-gray-700 space-y-2">
                  <div>
                    <strong>extrato_bancario</strong>
                    <ul className="text-amber-700 space-y-1 mt-1 ml-4">
                      <li>✓ valor positivo = Entrada</li>
                      <li>✓ valor negativo = Saída</li>
                    </ul>
                  </div>
                  <div>
                    <strong>fatura_cartao</strong>
                    <ul className="text-amber-700 space-y-1 mt-1 ml-4">
                      <li>✓ Sempre será tratado como Saída</li>
                      <li>✓ valor deve ser sempre positivo</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs text-amber-800 font-semibold mb-2">
                  Colunas Opcionais:
                </p>
                <div className="bg-white rounded p-3 text-xs text-gray-700 space-y-1 font-mono">
                  <div>• categoria - Categoria da transação</div>
                  <div>• banco - Nome do banco/instituição</div>
                  <div>• data_fatura - Data de pagamento/fechamento</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Extrato BTG */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-base font-semibold text-green-900 mb-3 flex items-center">
                <span className="mr-2">📊</span>
                Extrato BTG
              </h3>
              <p className="text-xs text-green-700 mb-3">
                Formato esperado para extratos do banco BTG Pactual
              </p>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-green-800 font-semibold mb-1">
                    Padrão do Nome:
                  </p>
                  <code className="text-xs bg-white px-2 py-1 rounded block text-gray-700">
                    Extrato_YYYY-MM-DD_a_YYYY-MM-DD_NNNN
                  </code>
                </div>
                <div>
                  <p className="text-xs text-green-800 font-semibold mb-1">
                    Formatos Aceitos:
                  </p>
                  <ul className="text-xs text-green-700 space-y-1">
                    <li>✓ XLS (Excel 97-2003)</li>
                    <li>✓ XLSX (Excel moderno)</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Fatura BTG */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-base font-semibold text-blue-900 mb-3 flex items-center">
                <span className="mr-2">💳</span>
                Fatura BTG
              </h3>
              <p className="text-xs text-blue-700 mb-3">
                Formato esperado para faturas do cartão BTG
              </p>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-blue-800 font-semibold mb-1">
                    Padrão do Nome:
                  </p>
                  <code className="text-xs bg-white px-2 py-1 rounded block text-gray-700">
                    YYYY-MM-DD_Fatura_NOME_NNNN_BTG
                  </code>
                </div>
                <div>
                  <p className="text-xs text-blue-800 font-semibold mb-1">
                    Formatos Aceitos:
                  </p>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>✓ XLS (Excel 97-2003)</li>
                    <li>✓ XLSX (Excel moderno)</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Extrato Nubank */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <h3 className="text-base font-semibold text-purple-900 mb-3 flex items-center">
                <span className="mr-2">📊</span>
                Extrato Nubank
              </h3>
              <p className="text-xs text-purple-700 mb-3">
                Formato esperado para extratos do Nubank
              </p>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-purple-800 font-semibold mb-1">
                    Padrão do Nome:
                  </p>
                  <code className="text-xs bg-white px-2 py-1 rounded block text-gray-700 break-all">
                    NU_NNNN_DDMMMYYYY_DDMMMYYYY
                  </code>
                </div>
                <div>
                  <p className="text-xs text-purple-800 font-semibold mb-1">
                    Formatos Aceitos:
                  </p>
                  <ul className="text-xs text-purple-700 space-y-1">
                    <li>✓ CSV</li>
                    <li>✓ XLS/XLSX</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Fatura Nubank */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-base font-semibold text-red-900 mb-3 flex items-center">
                <span className="mr-2">💳</span>
                Fatura Nubank
              </h3>
              <p className="text-xs text-red-700 mb-3">
                Formato esperado para faturas do Nubank
              </p>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-red-800 font-semibold mb-1">
                    Padrão do Nome:
                  </p>
                  <code className="text-xs bg-white px-2 py-1 rounded block text-gray-700">
                    Nubank_YYYY-MM-DD
                  </code>
                </div>
                <div>
                  <p className="text-xs text-red-800 font-semibold mb-1">
                    Formatos Aceitos:
                  </p>
                  <ul className="text-xs text-red-700 space-y-1">
                    <li>✓ CSV</li>
                    <li>✓ XLS/XLSX</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-purple-900 mb-3">
              ✨ Processamento Automático
            </h3>
            <ul className="text-purple-900 text-sm space-y-2">
              <li className="flex items-center">
                <span className="mr-2 text-lg">✓</span>
                <span>
                  Parser automático baseado no tipo de arquivo detectado
                </span>
              </li>
              <li className="flex items-center">
                <span className="mr-2 text-lg">✓</span>
                <span>Normalização automática de datas e valores</span>
              </li>
              <li className="flex items-center">
                <span className="mr-2 text-lg">✓</span>
                <span>Tag "Rotina" adicionada automaticamente</span>
              </li>
              <li className="flex items-center">
                <span className="mr-2 text-lg">✓</span>
                <span>Regras ativas aplicadas às transações importadas</span>
              </li>
              <li className="flex items-center">
                <span className="mr-2 text-lg">✓</span>
                <span>Duplicatas são ignoradas automaticamente</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
