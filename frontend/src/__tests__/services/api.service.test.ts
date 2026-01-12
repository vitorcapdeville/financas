import {
  transacoesService,
  tagsService,
  configuracoesService,
} from "@/services/api.service";
import { TipoTransacao } from "@/types";

// Mock do fetch global
global.fetch = jest.fn();

describe("API Services", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("transacoesService", () => {
    describe("listar", () => {
      it("deve listar transações com parâmetros", async () => {
        const mockTransacoes = [
          { id: 1, descricao: "Compra", valor: 100, tipo: "saida" },
          { id: 2, descricao: "Salário", valor: 5000, tipo: "entrada" },
        ];

        const mockData = JSON.stringify(mockTransacoes);
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          headers: {
            get: jest.fn((name: string) => {
              if (name === "content-type") return "application/json";
              if (name === "content-length") return mockData.length.toString();
              return null;
            }),
          },
          text: async () => mockData,
          json: async () => mockTransacoes,
        });

        const result = await transacoesService.listar({
          mes: 6,
          ano: 2024,
          categoria: "Alimentação",
        });

        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining(
            "/transacoes?mes=6&ano=2024&categoria=Alimenta"
          ),
          { cache: "no-store" }
        );
        expect(result).toEqual(mockTransacoes);
      });

      it("deve listar transações sem parâmetros", async () => {
        const mockData = JSON.stringify([]);
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          headers: {
            get: jest.fn((name: string) => {
              if (name === "content-type") return "application/json";
              if (name === "content-length") return mockData.length.toString();
              return null;
            }),
          },
          text: async () => mockData,
          json: async () => [],
        });

        await transacoesService.listar();

        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("/transacoes"),
          { cache: "no-store" }
        );
      });
    });

    describe("obter", () => {
      it("deve obter transação por ID", async () => {
        const mockTransacao = { id: 1, descricao: "Teste", valor: 100 };
        const mockData = JSON.stringify(mockTransacao);

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          headers: {
            get: jest.fn((name: string) => {
              if (name === "content-type") return "application/json";
              if (name === "content-length") return mockData.length.toString();
              return null;
            }),
          },
          text: async () => mockData,
          json: async () => mockTransacao,
        });

        const result = await transacoesService.obter(1);

        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("/transacoes/1"),
          { cache: "no-store" }
        );
        expect(result).toEqual(mockTransacao);
      });
    });

    describe("criar", () => {
      it("deve criar transação", async () => {
        const novaTransacao = {
          data: "2024-06-15",
          descricao: "Compra supermercado",
          valor: 150.5,
          tipo: TipoTransacao.SAIDA,
          categoria: "Alimentação",
        };

        const mockResposta = { id: 1, ...novaTransacao };
        const mockData = JSON.stringify(mockResposta);

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          headers: {
            get: jest.fn((name: string) => {
              if (name === "content-type") return "application/json";
              if (name === "content-length") return mockData.length.toString();
              return null;
            }),
          },
          text: async () => mockData,
          json: async () => mockResposta,
        });

        const result = await transacoesService.criar(novaTransacao);

        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("/transacoes"),
          expect.objectContaining({
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(novaTransacao),
          })
        );
        expect(result).toEqual(mockResposta);
      });
    });

    describe("atualizar", () => {
      it("deve atualizar transação", async () => {
        const atualizacao = { categoria: "Transporte", valor: 200 };
        const mockResposta = { id: 1, ...atualizacao };
        const mockData = JSON.stringify(mockResposta);

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          headers: {
            get: jest.fn((name: string) => {
              if (name === "content-type") return "application/json";
              if (name === "content-length") return mockData.length.toString();
              return null;
            }),
          },
          text: async () => mockData,
          json: async () => mockResposta,
        });

        const result = await transacoesService.atualizar(1, atualizacao);

        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("/transacoes/1"),
          expect.objectContaining({
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(atualizacao),
          })
        );
        expect(result).toEqual(mockResposta);
      });
    });
  });

  describe("tagsService", () => {
    describe("listar", () => {
      it("deve listar todas as tags", async () => {
        const mockTags = [
          { id: 1, nome: "Essencial", cor: "#ff0000" },
          { id: 2, nome: "Lazer", cor: "#00ff00" },
        ];
        const mockData = JSON.stringify(mockTags);

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          headers: {
            get: jest.fn((name: string) => {
              if (name === "content-type") return "application/json";
              if (name === "content-length") return mockData.length.toString();
              return null;
            }),
          },
          text: async () => mockData,
          json: async () => mockTags,
        });

        const result = await tagsService.listar();

        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("/tags"),
          { cache: "no-store" }
        );
        expect(result).toEqual(mockTags);
      });
    });

    describe("criar", () => {
      it("deve criar tag", async () => {
        const novaTag = { nome: "Assinaturas", cor: "#0000ff" };
        const mockResposta = { id: 1, ...novaTag };
        const mockData = JSON.stringify(mockResposta);

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          headers: {
            get: jest.fn((name: string) => {
              if (name === "content-type") return "application/json";
              if (name === "content-length") return mockData.length.toString();
              return null;
            }),
          },
          text: async () => mockData,
          json: async () => mockResposta,
        });

        const result = await tagsService.criar(novaTag);

        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("/tags"),
          expect.objectContaining({
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(novaTag),
          })
        );
        expect(result).toEqual(mockResposta);
      });
    });
  });

  describe("configuracoesService", () => {
    describe("salvar", () => {
      it("deve salvar configuração", async () => {
        const mockResposta = { chave: "diaInicioPeriodo", valor: "25" };
        const mockData = JSON.stringify(mockResposta);

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          headers: {
            get: jest.fn((name: string) => {
              if (name === "content-type") return "application/json";
              if (name === "content-length") return mockData.length.toString();
              return null;
            }),
          },
          text: async () => mockData,
          json: async () => mockResposta,
        });

        const result = await configuracoesService.salvar(
          "diaInicioPeriodo",
          "25"
        );

        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("/configuracoes/"),
          expect.objectContaining({
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chave: "diaInicioPeriodo",
              valor: "25",
            }),
          })
        );
        expect(result).toEqual(mockResposta);
      });
    });
  });
});
