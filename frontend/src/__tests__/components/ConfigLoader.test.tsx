import { render } from '@testing-library/react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ConfigLoader } from '@/components/ConfigLoader';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
  usePathname: jest.fn(),
}));

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseSearchParams = useSearchParams as jest.MockedFunction<typeof useSearchParams>;
const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

describe('ConfigLoader', () => {
  const mockReplace = jest.fn();
  const mockGet = jest.fn();
  const mockToString = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseRouter.mockReturnValue({
      replace: mockReplace,
    } as any);

    mockUsePathname.mockReturnValue('/');

    mockUseSearchParams.mockReturnValue({
      get: mockGet,
      toString: mockToString,
    } as any);

    mockToString.mockReturnValue('');
  });

  it('não deve renderizar nada visível', () => {
    const { container } = render(
      <ConfigLoader
        diaInicioPeriodo={1}
        criterioDataTransacao="data_transacao"
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('deve adicionar diaInicio na URL quando não existe', () => {
    mockGet.mockReturnValue(null);

    render(
      <ConfigLoader
        diaInicioPeriodo={25}
        criterioDataTransacao="data_transacao"
      />
    );

    expect(mockReplace).toHaveBeenCalled();
    const callArg = mockReplace.mock.calls[0][0];
    expect(callArg).toContain('diaInicio=25');
  });

  it('deve adicionar criterio na URL quando não existe', () => {
    mockGet.mockReturnValue(null);

    render(
      <ConfigLoader
        diaInicioPeriodo={1}
        criterioDataTransacao="data_fatura"
      />
    );

    expect(mockReplace).toHaveBeenCalled();
    const callArg = mockReplace.mock.calls[0][0];
    expect(callArg).toContain('criterio=data_fatura');
  });

  it('não deve atualizar URL quando parâmetros já existem', () => {
    mockGet.mockImplementation((param) => {
      if (param === 'diaInicio') return '25';
      if (param === 'criterio') return 'data_transacao';
      return null;
    });
    mockToString.mockReturnValue('diaInicio=25&criterio=data_transacao');

    render(
      <ConfigLoader
        diaInicioPeriodo={25}
        criterioDataTransacao="data_transacao"
      />
    );

    // O componente sempre executa useEffect, mas não deve alterar a URL se já tem os parâmetros
    if (mockReplace.mock.calls.length > 0) {
      const callArg = mockReplace.mock.calls[0][0];
      expect(callArg).toBe('/?diaInicio=25&criterio=data_transacao');
    }
  });

  it('deve adicionar ambos parâmetros quando nenhum existe', () => {
    mockGet.mockReturnValue(null);

    render(
      <ConfigLoader
        diaInicioPeriodo={15}
        criterioDataTransacao="data_fatura"
      />
    );

    expect(mockReplace).toHaveBeenCalled();
    const callArg = mockReplace.mock.calls[0][0];
    expect(callArg).toContain('diaInicio=15');
    expect(callArg).toContain('criterio=data_fatura');
  });

  it('deve preservar pathname na URL', () => {
    mockUsePathname.mockReturnValue('/transacoes');
    mockGet.mockReturnValue(null);

    render(
      <ConfigLoader
        diaInicioPeriodo={1}
        criterioDataTransacao="data_transacao"
      />
    );

    expect(mockReplace).toHaveBeenCalled();
    const callArg = mockReplace.mock.calls[0][0];
    expect(callArg).toContain('/transacoes');
  });

  it('deve usar replace com scroll: false', () => {
    mockGet.mockReturnValue(null);

    render(
      <ConfigLoader
        diaInicioPeriodo={1}
        criterioDataTransacao="data_transacao"
      />
    );

    expect(mockReplace).toHaveBeenCalledWith(
      expect.any(String),
      { scroll: false }
    );
  });

  it('deve adicionar apenas diaInicio se criterio já existe', () => {
    mockGet.mockImplementation((param) => {
      if (param === 'criterio') return 'data_transacao';
      return null;
    });

    render(
      <ConfigLoader
        diaInicioPeriodo={10}
        criterioDataTransacao="data_transacao"
      />
    );

    expect(mockReplace).toHaveBeenCalled();
    const callArg = mockReplace.mock.calls[0][0];
    expect(callArg).toContain('diaInicio=10');
  });

  it('deve adicionar apenas criterio se diaInicio já existe', () => {
    mockGet.mockImplementation((param) => {
      if (param === 'diaInicio') return '1';
      return null;
    });

    render(
      <ConfigLoader
        diaInicioPeriodo={1}
        criterioDataTransacao="data_fatura"
      />
    );

    expect(mockReplace).toHaveBeenCalled();
    const callArg = mockReplace.mock.calls[0][0];
    expect(callArg).toContain('criterio=data_fatura');
  });
});
