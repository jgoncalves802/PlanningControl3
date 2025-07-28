import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { Composition, CompositionsResponse, CreateCompositionData } from '@/lib/types/budgets';

const API_BASE = '/api/compositions';

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

// Hook para listar composições
export function useCompositions(page: number = 1, search?: string, category?: string) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: '10',
    ...(search && { search }),
    ...(category && { category }),
  });

  const { data, error, isLoading, mutate: refresh } = useSWR<CompositionsResponse>(
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
    compositions: data?.compositions || [],
    pagination: data?.pagination,
    isLoading,
    error,
    refresh,
  };
}

// Hook para buscar uma composição específica
export function useComposition(id: string) {
  const { data, error, isLoading, mutate: refresh } = useSWR<Composition>(
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
    composition: data,
    isLoading,
    error,
    refresh,
  };
}

// Função para criar composição
export async function createComposition(compositionData: CreateCompositionData): Promise<Composition> {
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(compositionData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao criar composição');
    }

    return response.json();
  } catch (error) {
    console.error('Erro ao criar composição:', error);
    throw error;
  }
}

// Função para atualizar composição
export async function updateComposition(id: string, compositionData: Partial<CreateCompositionData>): Promise<Composition> {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(compositionData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao atualizar composição');
    }

    return response.json();
  } catch (error) {
    console.error('Erro ao atualizar composição:', error);
    throw error;
  }
}

// Função para excluir composição
export async function deleteComposition(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao excluir composição');
    }
  } catch (error) {
    console.error('Erro ao excluir composição:', error);
    throw error;
  }
}

// Função para invalidar cache de composições
export function invalidateCompositions() {
  mutate((key: string) => key.startsWith(API_BASE));
}

// Hook para gerenciar estado de criação/edição de composições
export function useCompositionForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCompositionWithState = async (compositionData: CreateCompositionData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      const result = await createComposition(compositionData);
      invalidateCompositions();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao criar composição:', err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateCompositionWithState = async (id: string, compositionData: Partial<CreateCompositionData>) => {
    try {
      setIsSubmitting(true);
      setError(null);
      const result = await updateComposition(id, compositionData);
      invalidateCompositions();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao atualizar composição:', err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteCompositionWithState = async (id: string) => {
    try {
      setIsSubmitting(true);
      setError(null);
      await deleteComposition(id);
      invalidateCompositions();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao excluir composição:', err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    error,
    createComposition: createCompositionWithState,
    updateComposition: updateCompositionWithState,
    deleteComposition: deleteCompositionWithState,
    clearError: () => setError(null),
  };
} 