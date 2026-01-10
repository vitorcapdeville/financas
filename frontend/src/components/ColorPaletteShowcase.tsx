"use client";

/**
 * 🎨 Color Palette Showcase
 *
 * Componente de demonstração do sistema de cores Financial Serenity.
 * Use este componente para visualizar rapidamente todas as cores disponíveis.
 *
 * Para usar: Importe e renderize em qualquer página para ver a paleta completa.
 *
 * @example
 * import { ColorPaletteShowcase } from '@/components/ColorPaletteShowcase'
 *
 * <ColorPaletteShowcase />
 */

export function ColorPaletteShowcase() {
  const colorGroups = [
    {
      title: "Emerald (Principal)",
      colors: [
        {
          name: "Emerald Dark",
          value: "#0f3d3e",
          usage: "Títulos, elementos principais",
        },
        { name: "Emerald", value: "#156064", usage: "Botões, links ativos" },
        { name: "Emerald Light", value: "#2a7c7f", usage: "Hover states" },
      ],
    },
    {
      title: "Bronze/Gold (Acentos)",
      colors: [
        { name: "Bronze", value: "#b8860b", usage: "Destaques, decorações" },
        { name: "Bronze Light", value: "#daa520", usage: "Hover em acentos" },
        { name: "Gold", value: "#d4af37", usage: "Indicadores especiais" },
      ],
    },
    {
      title: "Neutros Quentes",
      colors: [
        {
          name: "Cream",
          value: "#faf8f5",
          usage: "Background principal",
          text: "#2d2d2d",
        },
        {
          name: "Taupe",
          value: "#d4c5b9",
          usage: "Bordas, divisores",
          text: "#2d2d2d",
        },
        { name: "Stone", value: "#8b8378", usage: "Texto secundário" },
        { name: "Charcoal", value: "#2d2d2d", usage: "Texto principal" },
      ],
    },
    {
      title: "Estados Semânticos",
      colors: [
        { name: "Success", value: "#2d8659", usage: "Entradas, positivo" },
        { name: "Error", value: "#c44536", usage: "Saídas, negativo" },
        { name: "Warning", value: "#e67e22", usage: "Alertas" },
      ],
    },
  ];

  return (
    <div className="p-12 bg-[#faf8f5] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          <h1
            className="text-5xl font-bold text-display mb-3"
            style={{
              background: "linear-gradient(135deg, #0f3d3e, #2a7c7f)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Financial Serenity
          </h1>
          <p className="text-xl text-[#8b8378]">Sistema de Cores Premium</p>
        </header>

        <div className="space-y-12">
          {colorGroups.map((group) => (
            <section key={group.title}>
              <h2 className="text-2xl font-bold text-display text-[#0f3d3e] mb-6">
                {group.title}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {group.colors.map((color) => (
                  <div
                    key={color.name}
                    className="card-premium p-6 transition-transform duration-300 hover:scale-105"
                  >
                    <div
                      className="w-full h-32 rounded-xl mb-4 flex items-center justify-center font-mono text-sm font-bold shadow-inner"
                      style={{
                        backgroundColor: color.value,
                        color: color.text || "#fff",
                      }}
                    >
                      {color.value}
                    </div>
                    <h3 className="font-bold text-[#2d2d2d] mb-2">
                      {color.name}
                    </h3>
                    <p className="text-sm text-[#8b8378]">{color.usage}</p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Gradientes de exemplo */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-display text-[#0f3d3e] mb-6">
            Gradientes de Uso Comum
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card-premium p-8 overflow-hidden relative">
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  background:
                    "linear-gradient(135deg, #0f3d3e 0%, #156064 100%)",
                }}
              ></div>
              <div className="relative z-10">
                <h3 className="font-bold text-[#2d2d2d] mb-2">
                  Emerald Gradient
                </h3>
                <code className="text-xs text-[#8b8378] block">
                  linear-gradient(135deg, #0f3d3e 0%, #156064 100%)
                </code>
                <p className="text-sm text-[#8b8378] mt-3">
                  Usado em: Botões primários, backgrounds de destaque
                </p>
              </div>
            </div>

            <div className="card-premium p-8 overflow-hidden relative">
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  background:
                    "linear-gradient(90deg, #b8860b, #d4af37, #b8860b)",
                }}
              ></div>
              <div className="relative z-10">
                <h3 className="font-bold text-[#2d2d2d] mb-2">
                  Bronze/Gold Accent
                </h3>
                <code className="text-xs text-[#8b8378] block">
                  linear-gradient(90deg, #b8860b, #d4af37, #b8860b)
                </code>
                <p className="text-sm text-[#8b8378] mt-3">
                  Usado em: Bordas decorativas, indicadores
                </p>
              </div>
            </div>

            <div className="card-premium p-8 overflow-hidden relative">
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  background: "linear-gradient(135deg, #2d8659, #38a169)",
                }}
              ></div>
              <div className="relative z-10">
                <h3 className="font-bold text-[#2d2d2d] mb-2">
                  Success Gradient
                </h3>
                <code className="text-xs text-[#8b8378] block">
                  linear-gradient(135deg, #2d8659, #38a169)
                </code>
                <p className="text-sm text-[#8b8378] mt-3">
                  Usado em: Valores positivos, entradas
                </p>
              </div>
            </div>

            <div className="card-premium p-8 overflow-hidden relative">
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  background: "linear-gradient(135deg, #c44536, #e56b5d)",
                }}
              ></div>
              <div className="relative z-10">
                <h3 className="font-bold text-[#2d2d2d] mb-2">
                  Error Gradient
                </h3>
                <code className="text-xs text-[#8b8378] block">
                  linear-gradient(135deg, #c44536, #e56b5d)
                </code>
                <p className="text-sm text-[#8b8378] mt-3">
                  Usado em: Valores negativos, saídas
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Exemplos de aplicação */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-display text-[#0f3d3e] mb-6">
            Exemplos de Aplicação
          </h2>

          <div className="space-y-6">
            {/* Card de valor positivo */}
            <div className="card-premium p-8">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-[#8b8378] uppercase tracking-wider mb-2">
                    Total de Entradas
                  </p>
                  <h3
                    className="text-4xl font-bold text-financial"
                    style={{ color: "#2d8659" }}
                  >
                    R$ 15.432,50
                  </h3>
                </div>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{
                    background: "linear-gradient(135deg, #2d8659, #38a169)",
                  }}
                >
                  <span className="text-white">↗</span>
                </div>
              </div>
            </div>

            {/* Card de valor negativo */}
            <div className="card-premium p-8">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-[#8b8378] uppercase tracking-wider mb-2">
                    Total de Saídas
                  </p>
                  <h3
                    className="text-4xl font-bold text-financial"
                    style={{ color: "#c44536" }}
                  >
                    R$ 8.721,30
                  </h3>
                </div>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{
                    background: "linear-gradient(135deg, #c44536, #e56b5d)",
                  }}
                >
                  <span className="text-white">↘</span>
                </div>
              </div>
            </div>

            {/* Card com gradient de fundo */}
            <div
              className="card-premium p-8 relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #0f3d3e 0%, #156064 100%)",
              }}
            >
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-10 bg-white"></div>
              <div className="relative z-10">
                <p
                  className="text-sm font-medium uppercase tracking-wider mb-2"
                  style={{ color: "rgba(255, 255, 255, 0.8)" }}
                >
                  Saldo do Mês
                </p>
                <h3 className="text-3xl font-bold text-financial text-white mb-2">
                  R$ 6.711,20
                </h3>
                <div
                  className="flex items-center gap-2 text-xs"
                  style={{ color: "rgba(255, 255, 255, 0.7)" }}
                >
                  <div className="w-2 h-2 rounded-full bg-[#d4af37]"></div>
                  <span>Positivo</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ColorPaletteShowcase;
