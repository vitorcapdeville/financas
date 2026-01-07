import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import FormularioConfiguracoes from '@/components/FormularioConfiguracoes';
import { salvarDiaInicioAction, salvarCriterioAction } from '@/app/configuracoes/actions';

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}));

jest.mock('react-hot-toast');

jest.mock('@/app/configuracoes/actions', () => ({
  salvarDiaInicioAction: jest.fn(),
  salvarCriterioAction: jest.fn(),
}));

const mockUseSearchParams = useSearchParams as jest.MockedFunction<typeof useSearchParams>;
const mockSalvarDiaInicioAction = salvarDiaInicioAction as jest.MockedFunction<typeof salvarDiaInicioAction>;
const mockSalvarCriterioAction = salvarCriterioAction as jest.MockedFunction<typeof salvarCriterioAction>;

describe('FormularioConfiguracoes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSearchParams.mockReturnValue({
      toString: jest.fn().mockReturnValue(''),
    } as any);
    mockSalvarDiaInicioAction.mockResolvedValue(undefined);
    mockSalvarCriterioAction.mockResolvedValue(undefined);
  });

  it('deve renderizar título de dia de início', () => {
    render(
      <FormularioConfiguracoes
        diaInicioPeriodo={1}
        criterioDataTransacao="data_transacao"
      />
    );

    expect(screen.getByText('Dia de Início do Período')).toBeInTheDocument();
  });

  it('deve renderizar select com dia atual selecionado', () => {
    render(
      <FormularioConfiguracoes
        diaInicioPeriodo={15}
        criterioDataTransacao="data_transacao"
      />
    );

    const option = screen.getByText('Dia 15');
    expect(option).toBeInTheDocument();
  });

  it('deve ter opções de 1 a 28 no select', () => {
    render(
      <FormularioConfiguracoes
        diaInicioPeriodo={1}
        criterioDataTransacao="data_transacao"
      />
    );

    const options = screen.getAllByRole('option');
    expect(options.length).toBeGreaterThanOrEqual(28);
  });

  it('deve renderizar seção de critério de data', () => {
    render(
      <FormularioConfiguracoes
        diaInicioPeriodo={1}
        criterioDataTransacao="data_transacao"
      />
    );

    expect(screen.getByText(/Critério de Data para Gastos/i)).toBeInTheDocument();
  });

  it('deve ter radio buttons para critério', () => {
    render(
      <FormularioConfiguracoes
        diaInicioPeriodo={1}
        criterioDataTransacao="data_transacao"
      />
    );

    const radios = screen.getAllByRole('radio');
    expect(radios.length).toBe(2);
  });

  it('deve selecionar critério atual', () => {
    render(
      <FormularioConfiguracoes
        diaInicioPeriodo={1}
        criterioDataTransacao="data_transacao"
      />
    );

    const radioTransacao = screen.getByDisplayValue('data_transacao');
    expect(radioTransacao).toBeChecked();
  });

  it('deve chamar salvarDiaInicioAction ao submeter formulário de dia', async () => {
    render(
      <FormularioConfiguracoes
        diaInicioPeriodo={1}
        criterioDataTransacao="data_transacao"
      />
    );

    const botaoSalvar = screen.getByText('Salvar Dia de Início');
    fireEvent.click(botaoSalvar);

    await waitFor(() => {
      expect(mockSalvarDiaInicioAction).toHaveBeenCalledWith(1);
    });
  });

  it('deve exibir toast de sucesso ao salvar dia', async () => {
    render(
      <FormularioConfiguracoes
        diaInicioPeriodo={1}
        criterioDataTransacao="data_transacao"
      />
    );

    const botaoSalvar = screen.getByText('Salvar Dia de Início');
    fireEvent.click(botaoSalvar);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Dia de início salvo com sucesso!');
    });
  });

  it('deve chamar salvarCriterioAction ao submeter formulário de critério', async () => {
    render(
      <FormularioConfiguracoes
        diaInicioPeriodo={1}
        criterioDataTransacao="data_transacao"
      />
    );

    const radioFatura = screen.getByDisplayValue('data_fatura');
    fireEvent.click(radioFatura);

    const botaoSalvarCriterio = screen.getByText('Salvar Critério de Data');
    fireEvent.click(botaoSalvarCriterio);

    await waitFor(() => {
      expect(mockSalvarCriterioAction).toHaveBeenCalledWith('data_fatura');
    });
  });

  it('deve exibir toast de sucesso ao salvar critério', async () => {
    render(
      <FormularioConfiguracoes
        diaInicioPeriodo={1}
        criterioDataTransacao="data_transacao"
      />
    );

    const botaoSalvar = screen.getByText('Salvar Critério de Data');
    fireEvent.click(botaoSalvar);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Critério de data salvo com sucesso!');
    });
  });

  it('deve exibir toast de erro quando falha ao salvar dia', async () => {
    mockSalvarDiaInicioAction.mockRejectedValue(new Error('Erro ao salvar'));

    render(
      <FormularioConfiguracoes
        diaInicioPeriodo={1}
        criterioDataTransacao="data_transacao"
      />
    );

    const botaoSalvar = screen.getByText('Salvar Dia de Início');
    fireEvent.click(botaoSalvar);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });

  it('deve exibir toast de erro quando falha ao salvar critério', async () => {
    mockSalvarCriterioAction.mockRejectedValue(new Error('Erro ao salvar'));

    render(
      <FormularioConfiguracoes
        diaInicioPeriodo={1}
        criterioDataTransacao="data_transacao"
      />
    );

    const botaoSalvar = screen.getByText('Salvar Critério de Data');
    fireEvent.click(botaoSalvar);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });

  it('deve ter botões de salvar para cada configuração', () => {
    render(
      <FormularioConfiguracoes
        diaInicioPeriodo={1}
        criterioDataTransacao="data_transacao"
      />
    );

    expect(screen.getByText('Salvar Dia de Início')).toBeInTheDocument();
    expect(screen.getByText('Salvar Critério de Data')).toBeInTheDocument();
  });
});
