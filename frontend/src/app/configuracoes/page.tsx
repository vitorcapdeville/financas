import { configuracoesService } from "@/services/api.service";
import FormularioConfiguracoes from "@/components/FormularioConfiguracoes";

// ✅ Server Component - busca dados no servidor
export default async function ConfiguracoesPage() {
  const configuracoes = await configuracoesService.listarTodas();

  return (
    <>
      {/* Header */}
      <div className="mb-10">
        <div className="animate-fade-in-up delay-100">
          <div className="flex items-baseline gap-4 mb-3">
            <h1 className="text-5xl md:text-6xl font-bold text-display text-gradient-emerald">
              Configurações
            </h1>
            <div className="h-2 w-2 rounded-full bg-[#b8860b] animate-float"></div>
          </div>
          <p className="text-lg text-[#8b8378]">
            Gerencie as preferências do aplicativo
          </p>
        </div>
      </div>

      {/* Formulário de configurações */}
      <div className="animate-fade-in-up delay-200">
        <FormularioConfiguracoes
          diaInicioPeriodo={parseInt(configuracoes.diaInicioPeriodo)}
          criterioDataTransacao={configuracoes.criterio_data_transacao}
        />
      </div>
    </>
  );
}
