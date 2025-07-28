import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { Budget, BudgetsResponse, CreateBudgetData } from '@/lib/types/budgets';

const API_BASE = '/api/budgets';

// Função fetcher para SWR com melhor tratamento de erro
const fetcher = async (url: string) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error('Erro no fetcher:', error);
    throw error;
  }
};

// Hook para listar orçamentos
export function useBudgets(page: number = 1, search?: string, status?: string) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: '10',
    ...(search && { search }),
    ...(status && { status }),
  });

  const { data, error, isLoading, mutate: refresh } = useSWR<BudgetsResponse>(
    `${API_BASE}?${params}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      errorRetryCount: 3,
      errorRetryInterval: 1000,
    }
  );

  return {
    budgets: data?.budgets || [],
    pagination: data?.pagination,
    isLoading,
    error,
    refresh,
  };
}

// Hook para buscar um orçamento específico
export function useBudget(id: string) {
  const { data, error, isLoading, mutate: refresh } = useSWR<Budget>(
    id ? `${API_BASE}/${id}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      errorRetryCount: 3,
      errorRetryInterval: 1000,
    }
  );

  return {
    budget: data,
    isLoading,
    error,
    refresh,
  };
}

// Função para criar orçamento
export async function createBudget(budgetData: CreateBudgetData): Promise<Budget> {
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(budgetData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao criar orçamento');
    }

    return response.json();
  } catch (error) {
    console.error('Erro ao criar orçamento:', error);
    throw error;
  }
}

// Função para atualizar orçamento
export async function updateBudget(id: string, budgetData: Partial<CreateBudgetData>): Promise<Budget> {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(budgetData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao atualizar orçamento');
    }

    return response.json();
  } catch (error) {
    console.error('Erro ao atualizar orçamento:', error);
    throw error;
  }
}

// Função para excluir orçamento
export async function deleteBudget(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao excluir orçamento');
    }
  } catch (error) {
    console.error('Erro ao excluir orçamento:', error);
    throw error;
  }
}

// Função para invalidar cache de orçamentos
export function invalidateBudgets() {
  mutate((key: string) => key.startsWith(API_BASE));
}

// Hook para gerenciar estado de criação/edição
export function useBudgetForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBudgetWithState = async (budgetData: CreateBudgetData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      const result = await createBudget(budgetData);
      invalidateBudgets();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao criar orçamento:', err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateBudgetWithState = async (id: string, budgetData: Partial<CreateBudgetData>) => {
    try {
      setIsSubmitting(true);
      setError(null);
      const result = await updateBudget(id, budgetData);
      invalidateBudgets();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao atualizar orçamento:', err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteBudgetWithState = async (id: string) => {
    try {
      setIsSubmitting(true);
      setError(null);
      await deleteBudget(id);
      invalidateBudgets();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao excluir orçamento:', err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    error,
    createBudget: createBudgetWithState,
    updateBudget: updateBudgetWithState,
    deleteBudget: deleteBudgetWithState,
    clearError: () => setError(null),
  };
} 