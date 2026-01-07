import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'
import { ConfigLoader } from '@/components/ConfigLoader'
import { configuracoesServerService } from '@/services/configuracoes.server'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Finanças Pessoais',
  description: 'Gerencie suas finanças pessoais de forma simples e eficiente',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Carrega configurações apenas uma vez ao iniciar o app
  const configuracoes = await configuracoesServerService.listarTodas();
  const diaInicioPeriodo = parseInt(configuracoes.diaInicioPeriodo) || 1;
  const criterioDataTransacao = configuracoes.criterio_data_transacao || 'data_transacao';

  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <ConfigLoader 
          diaInicioPeriodo={diaInicioPeriodo}
          criterioDataTransacao={criterioDataTransacao}
        />
        <Toaster position="top-right" />
        {children}
      </body>
    </html>
  )
}
