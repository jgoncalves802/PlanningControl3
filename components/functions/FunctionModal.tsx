'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Briefcase, Save, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CompanyFunction, CreateFunctionData, UpdateFunctionData } from '@/lib/useFunctions'

interface FunctionModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateFunctionData | UpdateFunctionData) => Promise<void>
  function?: CompanyFunction | null
  isLoading?: boolean
}

export default function FunctionModal({
  isOpen,
  onClose,
  onSubmit,
  function: editFunction,
  isLoading = false
}: FunctionModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    laborType: 'DIRETO' as 'DIRETO' | 'INDIRETO',
    isActive: true
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEditing = !!editFunction

  // Resetar formulário quando modal abre/fecha ou função muda
  useEffect(() => {
    if (isOpen) {
      if (editFunction) {
        setFormData({
          name: editFunction.name,
          laborType: editFunction.laborType,
          isActive: editFunction.isActive
        })
      } else {
        setFormData({
          name: '',
          laborType: 'DIRETO',
          isActive: true
        })
      }
      setErrors({})
    }
  }, [isOpen, editFunction])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Nome da função é obrigatório'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres'
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Nome deve ter no máximo 100 caracteres'
    }

    if (!formData.laborType) {
      newErrors.laborType = 'Tipo de mão de obra é obrigatório'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      const submitData = isEditing 
        ? {
            name: formData.name.trim(),
            laborType: formData.laborType,
            isActive: formData.isActive
          }
        : {
            name: formData.name.trim(),
            laborType: formData.laborType
          }

      await onSubmit(submitData)
      onClose()
    } catch (error) {
      console.error('Erro ao salvar função:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting && !isLoading) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Briefcase className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">
                {isEditing ? 'Editar Função' : 'Nova Função'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                {isEditing ? 'Atualize os dados da função' : 'Cadastre uma nova função/cargo'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={isSubmitting || isLoading}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nome da Função */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Nome da Função *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, name: e.target.value }))
                if (errors.name) {
                  setErrors(prev => ({ ...prev, name: '' }))
                }
              }}
              placeholder="Ex: PEDREIRO, SOLDADOR, ENGENHEIRO CIVIL"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                errors.name 
                  ? 'border-red-300 dark:border-red-600' 
                  : 'border-gray-300 dark:border-slate-600'
              } bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100`}
              disabled={isSubmitting || isLoading}
              autoFocus
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                {errors.name}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
              O nome será automaticamente convertido para maiúsculas
            </p>
          </div>

          {/* Tipo de Mão de Obra */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Tipo de Mão de Obra *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`relative flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                formData.laborType === 'DIRETO'
                  ? 'border-primary bg-primary/5 dark:bg-primary/10'
                  : 'border-gray-300 dark:border-slate-600 hover:border-gray-400 dark:hover:border-slate-500'
              }`}>
                <input
                  type="radio"
                  name="laborType"
                  value="DIRETO"
                  checked={formData.laborType === 'DIRETO'}
                  onChange={(e) => setFormData(prev => ({ ...prev, laborType: e.target.value as 'DIRETO' | 'INDIRETO' }))}
                  className="sr-only"
                  disabled={isSubmitting || isLoading}
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900 dark:text-slate-100">
                    Mão de Obra Direta
                  </span>
                  <span className="text-xs text-gray-500 dark:text-slate-400">
                    Operacional, produtiva
                  </span>
                </div>
                {formData.laborType === 'DIRETO' && (
                  <div className="absolute top-2 right-2 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </label>

              <label className={`relative flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                formData.laborType === 'INDIRETO'
                  ? 'border-primary bg-primary/5 dark:bg-primary/10'
                  : 'border-gray-300 dark:border-slate-600 hover:border-gray-400 dark:hover:border-slate-500'
              }`}>
                <input
                  type="radio"
                  name="laborType"
                  value="INDIRETO"
                  checked={formData.laborType === 'INDIRETO'}
                  onChange={(e) => setFormData(prev => ({ ...prev, laborType: e.target.value as 'DIRETO' | 'INDIRETO' }))}
                  className="sr-only"
                  disabled={isSubmitting || isLoading}
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900 dark:text-slate-100">
                    Mão de Obra Indireta
                  </span>
                  <span className="text-xs text-gray-500 dark:text-slate-400">
                    Administrativa, suporte
                  </span>
                </div>
                {formData.laborType === 'INDIRETO' && (
                  <div className="absolute top-2 right-2 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </label>
            </div>
            {errors.laborType && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                {errors.laborType}
              </p>
            )}
          </div>

          {/* Status (apenas para edição) */}
          {isEditing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Status
              </label>
              <label className="flex items-center gap-3 p-3 border border-gray-300 dark:border-slate-600 rounded-lg cursor-pointer hover:border-gray-400 dark:hover:border-slate-500 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded border-gray-300 dark:border-slate-600 text-primary focus:ring-primary focus:ring-offset-0"
                  disabled={isSubmitting || isLoading}
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900 dark:text-slate-100">
                    Função Ativa
                  </span>
                  <span className="text-xs text-gray-500 dark:text-slate-400">
                    Disponível para uso no sistema
                  </span>
                </div>
              </label>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/50">
          <div className="text-sm text-gray-500 dark:text-slate-400">
            * Campos obrigatórios
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={isSubmitting || isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting || isLoading}
              className="bg-primary hover:bg-primary/90"
            >
              {isSubmitting || isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Salvando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {isEditing ? 'Atualizar' : 'Criar'} Função
                </div>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
} 