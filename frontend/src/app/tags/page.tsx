import { tagsServerService } from '@/services/tags.server';
import BotaoVoltar from '@/components/BotaoVoltar';
import FormularioNovaTag from '@/components/FormularioNovaTag';
import ListaTags from '@/components/ListaTags';

// ✅ Server Component - busca dados no servidor
export default async function TagsPage() {
  const tags = await tagsServerService.listar();

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4">
            <BotaoVoltar />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciar Tags</h1>
        </div>

        {/* Formulário de nova tag */}
        <FormularioNovaTag />

        {/* Lista de tags */}
        <ListaTags tags={tags} />
      </div>
    </div>
  );
}
