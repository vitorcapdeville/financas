"use client";
import { Usuario } from "@/types";
import { useRouter, useSearchParams } from "next/navigation";

interface FiltroUsuarioProps {
  usuarios: Usuario[];
  usuarioIdSelecionado?: number;
}

export default function FiltroUsuario({
  usuarios,
  usuarioIdSelecionado,
}: FiltroUsuarioProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("usuario_id", value);
    } else {
      params.delete("usuario_id");
    }
    router.replace("?" + params.toString(), { scroll: false });
  }

  return (
    <div className="mb-4">
      <label
        htmlFor="usuario-select"
        className="block text-sm font-medium text-[#0f3d3e] mb-1"
      >
        Usuário
      </label>
      <select
        id="usuario-select"
        className="w-full md:w-64 px-4 py-2 rounded-lg border border-[#d4c5b9]/50 bg-white text-[#0f3d3e] focus:outline-none focus:ring-2 focus:ring-[#156064]"
        value={usuarioIdSelecionado ?? ""}
        onChange={handleChange}
      >
        <option value="">Todos os usuários</option>
        {usuarios.map((usuario) => (
          <option key={usuario.id} value={usuario.id}>
            {usuario.nome}
          </option>
        ))}
      </select>
    </div>
  );
}
