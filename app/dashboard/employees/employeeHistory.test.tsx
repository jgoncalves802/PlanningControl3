import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../../node_modules/@testing-library/react';
import '@testing-library/jest-dom';
import { act } from 'react-dom/test-utils';
// Supondo que o modal de histórico foi extraído para um componente HistoryModal
// Caso contrário, adapte para testar via EmployeesPage
import EmployeesPage from './page';
import { mockEmployees, mockContracts } from '@/lib/mock-data';

// Mock useTranslations para i18n
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string, opts?: any) => opts?.default || key
}));

// Mock toast
jest.mock('react-hot-toast', () => ({ toast: jest.fn(), Toaster: () => null }));

// Mock framer-motion para evitar animações
jest.mock('framer-motion', () => ({
  motion: {
    div: (props: any) => <div {...props} />,
    button: (props: any) => <button {...props} />
  }
}));

describe('Employee History Modal', () => {
  it('renders the history modal and shows history entries', async () => {
    render(<EmployeesPage />);
    // Abrir modal de histórico do primeiro funcionário
    const moreButtons = await screen.findAllByRole('button', { name: /mais ações/i });
    act(() => {
      fireEvent.click(moreButtons[0]);
    });
    expect(await screen.findByText(/Histórico de Contratações/i)).toBeInTheDocument();
    // Deve exibir pelo menos um contrato do mock
    expect(screen.getByText(/Contrato/i)).toBeInTheDocument();
  });

  it('shows admission form and validates required fields', async () => {
    render(<EmployeesPage />);
    const moreButtons = await screen.findAllByRole('button', { name: /mais ações/i });
    act(() => {
      fireEvent.click(moreButtons[0]);
    });
    const addAdmissionBtn = await screen.findByRole('button', { name: /nova admissão/i });
    act(() => {
      fireEvent.click(addAdmissionBtn);
    });
    // Tentar salvar sem preencher
    const saveBtn = screen.getByRole('button', { name: /salvar admissão/i });
    act(() => {
      fireEvent.click(saveBtn);
    });
    expect(await screen.findByText(/Contrato e data são obrigatórios/i)).toBeInTheDocument();
  });

  it('adds a new admission to the history', async () => {
    render(<EmployeesPage />);
    const moreButtons = await screen.findAllByRole('button', { name: /mais ações/i });
    act(() => {
      fireEvent.click(moreButtons[0]);
    });
    const addAdmissionBtn = await screen.findByRole('button', { name: /nova admissão/i });
    act(() => {
      fireEvent.click(addAdmissionBtn);
    });
    // Preencher contrato e data
    const contractSelect = screen.getByLabelText(/Contrato/i);
    fireEvent.change(contractSelect, { target: { value: mockContracts[0].id } });
    const dateInput = screen.getByLabelText(/Data de Admissão/i);
    fireEvent.change(dateInput, { target: { value: '2024-07-01' } });
    const saveBtn = screen.getByRole('button', { name: /salvar admissão/i });
    act(() => {
      fireEvent.click(saveBtn);
    });
    expect(await screen.findByText(/Nova admissão registrada com sucesso/i)).toBeInTheDocument();
    // Deve aparecer no histórico
    expect(screen.getByText('2024')).toBeInTheDocument();
  });

  it('registers a dismissal for the last admission', async () => {
    render(<EmployeesPage />);
    const moreButtons = await screen.findAllByRole('button', { name: /mais ações/i });
    act(() => {
      fireEvent.click(moreButtons[0]);
    });
    // Se houver vínculo ativo, botão de demissão deve aparecer
    const addDismissalBtn = await screen.findByRole('button', { name: /registrar demissão/i });
    act(() => {
      fireEvent.click(addDismissalBtn);
    });
    // Tentar salvar sem data
    const saveBtn = screen.getByRole('button', { name: /salvar demissão/i });
    act(() => {
      fireEvent.click(saveBtn);
    });
    expect(await screen.findByText(/Data de demissão é obrigatória/i)).toBeInTheDocument();
    // Preencher data e salvar
    const dateInput = screen.getByLabelText(/Data de Demissão/i);
    fireEvent.change(dateInput, { target: { value: '2024-07-10' } });
    act(() => {
      fireEvent.click(saveBtn);
    });
    expect(await screen.findByText(/Demissão registrada com sucesso/i)).toBeInTheDocument();
    // Deve aparecer no histórico
    expect(screen.getByText('2024')).toBeInTheDocument();
  });

  it('allows re-admission with same CPF if all previous are dismissed', async () => {
    render(<EmployeesPage />);
    // Abrir modal de adicionar funcionário
    const addButton = await screen.findByRole('button', { name: /adicionar funcionário/i });
    act(() => {
      fireEvent.click(addButton);
    });
    // Preencher dados com CPF de um funcionário demitido
    const cpf = mockEmployees.find(emp => emp.status === 'dismissed')?.cpf || '123.456.789-00';
    fireEvent.change(screen.getByLabelText(/nome/i), { target: { value: 'Novo Funcionário' } });
    fireEvent.change(screen.getByLabelText(/cpf/i), { target: { value: cpf } });
    // Avançar etapas obrigatórias
    const nextBtn = screen.getByRole('button', { name: /próximo/i });
    for (let i = 0; i < 4; i++) {
      act(() => { fireEvent.click(nextBtn); });
    }
    // Submeter
    const submitBtn = screen.getByRole('button', { name: /cadastrar|submit/i });
    act(() => {
      fireEvent.click(submitBtn);
    });
    // Deve permitir cadastro e mostrar sucesso
    expect(await screen.findByText(/funcionário cadastrado com sucesso/i)).toBeInTheDocument();
  });

  it('blocks re-admission with same CPF if there is an active employee', async () => {
    render(<EmployeesPage />);
    // Abrir modal de adicionar funcionário
    const addButton = await screen.findByRole('button', { name: /adicionar funcionário/i });
    act(() => {
      fireEvent.click(addButton);
    });
    // Preencher dados com CPF de um funcionário ativo
    const cpf = mockEmployees.find(emp => emp.status === 'active')?.cpf || '123.456.789-00';
    fireEvent.change(screen.getByLabelText(/nome/i), { target: { value: 'Outro Funcionário' } });
    fireEvent.change(screen.getByLabelText(/cpf/i), { target: { value: cpf } });
    // Avançar etapas obrigatórias
    const nextBtn = screen.getByRole('button', { name: /próximo/i });
    for (let i = 0; i < 4; i++) {
      act(() => { fireEvent.click(nextBtn); });
    }
    // Submeter
    const submitBtn = screen.getByRole('button', { name: /cadastrar|submit/i });
    act(() => {
      fireEvent.click(submitBtn);
    });
    // Deve bloquear e mostrar erro
    expect(await screen.findByText(/cpf já cadastrado para outro funcionário ativo/i)).toBeInTheDocument();
  });
}); 