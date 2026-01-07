import { configuracoesServerService } from '@/services/configuracoes.server';
import BotaoVoltar from '@/components/BotaoVoltar';
import FormularioConfiguracoes from '@/components/FormularioConfiguracoes';

// ✅ Server Component - busca dados no servidor
export default async function ConfiguracoesPage() {
  const configuracoes = await configuracoesServerService.listarTodas();

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4">
            <BotaoVoltar />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">⚙️ Configurações</h1>
          <p className="text-gray-600 mt-2">
            Gerencie as preferências do aplicativo
          </p>
        </div>

        {/* Formulário de configurações */}
        <FormularioConfiguracoes 
          diaInicioPeriodo={parseInt(configuracoes.diaInicioPeriodo)}
          criterioDataTransacao={configuracoes.criterio_data_transacao}
        />
      </div>
    </div>
  );
}
