import { tagsServerService } from "@/services/tags.server";
import BotaoVoltar from "@/components/BotaoVoltar";
import FormularioNovaTag from "@/components/FormularioNovaTag";
import ListaTags from "@/components/ListaTags";

// ✅ Server Component - busca dados no servidor
export default async function TagsPage() {
  const tags = await tagsServerService.listar();

  return (
    <>
      {/* Header */}
      <header className="mb-10 animate-fade-in-up delay-100">
        <div className="flex items-baseline gap-4 mb-3">
          <h1 className="text-5xl md:text-6xl font-bold text-display text-gradient-emerald">
            Tags
          </h1>
          <div className="h-2 w-2 rounded-full bg-[#b8860b] animate-float"></div>
        </div>
        <p className="text-lg text-[#8b8378]">
          Organize suas transações com tags personalizadas
        </p>
      </header>

      {/* Formulário de nova tag */}
      <div className="animate-fade-in-up delay-200">
        <FormularioNovaTag />
      </div>

      {/* Lista de tags */}
      <div className="animate-fade-in-up delay-300">
        <ListaTags tags={tags} />
      </div>
    </>
  );
}
