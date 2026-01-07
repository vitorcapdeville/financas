'use client';

import { useState, useTransition } from 'react';
import { toast } from 'react-hot-toast';
import { criarTagAction } from '@/app/tags/actions';

export default function FormularioNovaTag() {
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    const form = e.currentTarget; // Salva referência antes do startTransition
    const formData = new FormData(form);
    
    startTransition(async () => {
      try {
        await criarTagAction(formData);
        form.reset(); // Usa a referência salva
        setShowForm(false);
      } catch (error) {
        console.error('Erro ao criar tag:', error);
        toast.error('Erro ao criar tag. Tente novamente.');
      }
    });
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          disabled={isPending}
        >
          {showForm ? 'Cancelar' : 'Nova Tag'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Criar Nova Tag</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome *
              </label>
              <input
                type="text"
                name="nome"
                required
                defaultValue=""
                className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Assinaturas, Esporádico, Essencial"
                maxLength={50}
                disabled={isPending}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cor
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  name="cor"
                  defaultValue="#3B82F6"
                  className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                  disabled={isPending}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                name="descricao"
                defaultValue=""
                className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Descrição opcional da tag"
                rows={3}
                maxLength={200}
                disabled={isPending}
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={isPending}
            >
              {isPending ? 'Criando...' : 'Criar Tag'}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
