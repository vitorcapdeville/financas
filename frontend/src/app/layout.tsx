import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { ConfigLoader } from "@/components/ConfigLoader";
import { AppLayout } from "@/components/AppLayout";
import { configuracoesServerService } from "@/services/configuracoes.server";

export const metadata: Metadata = {
  title: {
    default: "Finanças Pessoais",
    template: "%s | Finanças Pessoais",
  },
  description: "Gerencie suas finanças pessoais com elegância e precisão",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Carrega configurações apenas uma vez ao iniciar o app
  const configuracoes = await configuracoesServerService.listarTodas();
  const diaInicioPeriodo = parseInt(configuracoes.diaInicioPeriodo) || 1;
  const criterioDataTransacao =
    configuracoes.criterio_data_transacao || "data_transacao";

  return (
    <html lang="pt-BR">
      <body>
        <ConfigLoader
          diaInicioPeriodo={diaInicioPeriodo}
          criterioDataTransacao={criterioDataTransacao}
        />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "white",
              color: "#2d2d2d",
              border: "1px solid #d4c5b9",
              borderRadius: "12px",
              boxShadow: "0 10px 15px rgba(47, 43, 67, 0.1)",
              fontFamily: "DM Sans, sans-serif",
              fontSize: "14px",
              padding: "16px 20px",
            },
            success: {
              iconTheme: {
                primary: "#2d8659",
                secondary: "white",
              },
            },
            error: {
              iconTheme: {
                primary: "#c44536",
                secondary: "white",
              },
            },
          }}
        />
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
