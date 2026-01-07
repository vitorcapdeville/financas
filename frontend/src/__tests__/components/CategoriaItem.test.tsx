import { render, screen, fireEvent } from '@testing-library/react';
import CategoriaItem from '@/components/CategoriaItem';

describe('CategoriaItem Component', () => {
  it('deve renderizar categoria e valor', () => {
    render(
      <CategoriaItem 
        categoria="Alimentação" 
        valor={500.50} 
        tipo="saida"
      />
    );

    expect(screen.getByText('Alimentação')).toBeInTheDocument();
    expect(screen.getByText('R$ 500,50')).toBeInTheDocument();
  });

  it('deve aplicar cor verde para entradas', () => {
    render(
      <CategoriaItem 
        categoria="Salário" 
        valor={5000} 
        tipo="entrada"
      />
    );

    const valorElement = screen.getByText('R$ 5.000,00');
    expect(valorElement).toHaveClass('text-green-600');
  });

  it('deve aplicar cor vermelha para saídas', () => {
    render(
      <CategoriaItem 
        categoria="Transporte" 
        valor={200} 
        tipo="saida"
      />
    );

    const valorElement = screen.getByText('R$ 200,00');
    expect(valorElement).toHaveClass('text-red-600');
  });

  it('deve mostrar ícone de entrada (↑) para entradas', () => {
    render(
      <CategoriaItem 
        categoria="Salário" 
        valor={5000} 
        tipo="entrada"
      />
    );

    expect(screen.getByText('↑')).toBeInTheDocument();
  });

  it('deve mostrar ícone de saída (↓) para saídas', () => {
    render(
      <CategoriaItem 
        categoria="Alimentação" 
        valor={500} 
        tipo="saida"
      />
    );

    expect(screen.getByText('↓')).toBeInTheDocument();
  });

  it('deve renderizar botão editar quando onClick é fornecido', () => {
    const mockOnClick = jest.fn();
    render(
      <CategoriaItem 
        categoria="Alimentação" 
        valor={500} 
        tipo="saida"
        onClick={mockOnClick}
      />
    );

    expect(screen.getByText('editar')).toBeInTheDocument();
  });

  it('não deve renderizar botão editar quando onClick não é fornecido', () => {
    render(
      <CategoriaItem 
        categoria="Alimentação" 
        valor={500} 
        tipo="saida"
      />
    );

    expect(screen.queryByText('editar')).not.toBeInTheDocument();
  });

  it('deve chamar onClick quando botão editar é clicado', () => {
    const mockOnClick = jest.fn();
    render(
      <CategoriaItem 
        categoria="Alimentação" 
        valor={500} 
        tipo="saida"
        onClick={mockOnClick}
      />
    );

    fireEvent.click(screen.getByText('editar'));
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('deve formatar valores grandes corretamente', () => {
    render(
      <CategoriaItem 
        categoria="Investimento" 
        valor={25000.75} 
        tipo="entrada"
      />
    );

    expect(screen.getByText('R$ 25.000,75')).toBeInTheDocument();
  });

  it('deve formatar valores pequenos corretamente', () => {
    render(
      <CategoriaItem 
        categoria="Lanche" 
        valor={10.50} 
        tipo="saida"
      />
    );

    expect(screen.getByText('R$ 10,50')).toBeInTheDocument();
  });
});
