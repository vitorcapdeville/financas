'use client';

import { useState } from 'react';
import Link from 'next/link';
import { importacaoService } from '@/services/api.service';
import { toast } from 'react-hot-toast';
import BotaoVoltar from '@/components/BotaoVoltar';

export default function ImportarPage() {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    tipo: 'extrato' | 'fatura'
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const service =
        tipo === 'extrato'
          ? importacaoService.importarExtrato
          : importacaoService.importarFatura;

      const transacoes = await service(file);
      toast.success(
        `${transacoes.length} transações importadas com sucesso!`
      );
      
      // Limpar input
      event.target.value = '';
    } catch (error: any) {
      console.error('Erro ao importar:', error);
      toast.error(
        error.response?.data?.detail || 'Erro ao importar arquivo'
      );
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
            Importe seus extratos bancários e faturas de cartão de crédito
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card Extrato Bancário */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Extrato Bancário
            </h2>
            <p className="text-gray-600 mb-6">
              Arquivo CSV ou Excel com colunas: <br />
              <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                data, descricao, valor
              </code>
            </p>
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">
                • Data: DD/MM/YYYY ou YYYY-MM-DD <br />
                • Valor: positivo para entradas, negativo para saídas <br />
                • Categoria (opcional)
              </p>
            </div>
            <label className="block">
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={(e) => handleUpload(e, 'extrato')}
                disabled={uploading}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary-50 file:text-primary-700
                  hover:file:bg-primary-100
                  disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </label>
          </div>

          {/* Card Fatura Cartão */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Fatura de Cartão
            </h2>
            <p className="text-gray-600 mb-6">
              Arquivo CSV ou Excel com colunas: <br />
              <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                data, descricao, valor
              </code>
            </p>
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">
                • Data: DD/MM/YYYY ou YYYY-MM-DD <br />
                • Valor: sempre positivo (representa saída) <br />
                • Categoria (opcional) <br />
                • Data_fatura (opcional): data de fechamento/pagamento
              </p>
            </div>
            <label className="block">
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={(e) => handleUpload(e, 'fatura')}
                disabled={uploading}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-gray-50 file:text-gray-700
                  hover:file:bg-gray-100
                  disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </label>
          </div>
        </div>

        {/* Informações Adicionais */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            📝 Formato dos Arquivos
          </h3>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>• Formatos aceitos: CSV, XLSX, XLS</li>
            <li>• Colunas obrigatórias: data, descricao, valor</li>
            <li>• Colunas opcionais: categoria, data_fatura (apenas faturas)</li>
            <li>• data_fatura: define quando a fatura foi/será paga (para visualização por data de pagamento)</li>
            <li>• As transações importadas aparecerão no dashboard</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
