'use client'

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, AlertTriangle, Trash2, FileText, User, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'react-hot-toast';

interface TransferRequest {
  id: string;
  status: string;
  requestedAt: string;
  fromContract: { name: string };
  toContract: { name: string };
  requestedBy: { name: string };
}

interface DeleteEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: { id: string; name: string } | null;
  onConfirmDelete: (employeeId: string) => void;
  onRemoveTransfersFirst: (employeeId: string) => void;
}

const DeleteEmployeeModal: React.FC<DeleteEmployeeModalProps> = ({
  isOpen,
  onClose,
  employee,
  onConfirmDelete,
  onRemoveTransfersFirst
}) => {
  const [transferRequests, setTransferRequests] = useState<TransferRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasTransfers, setHasTransfers] = useState(false);

  useEffect(() => {
    if (isOpen && employee) {
      checkTransferRequests();
    }
  }, [isOpen, employee]);

  const checkTransferRequests = async () => {
    if (!employee) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/employees/${employee.id}`, {
        method: 'DELETE'
      });
      
      if (response.status === 400) {
        const errorData = await response.json();
        if (errorData.transferDetails) {
          setTransferRequests(errorData.transferDetails);
          setHasTransfers(true);
        }
      } else if (response.ok) {
        setHasTransfers(false);
      }
    } catch (error) {
      console.error('Erro ao verificar transferências:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveTransfers = async () => {
    if (!employee) return;
    
    try {
      setIsLoading(true);
      
      // Remover transferências
      const deleteTransfersResponse = await fetch(`/api/transfer-requests/bulk-delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          employeeId: employee.id
        })
      });
      
      if (deleteTransfersResponse.ok) {
        toast.success('Transferências removidas com sucesso!');
        setHasTransfers(false);
        setTransferRequests([]);
        onRemoveTransfersFirst(employee.id);
      } else {
        toast.error('Erro ao remover transferências');
      }
    } catch (error) {
      console.error('Erro ao remover transferências:', error);
      toast.error('Erro ao remover transferências');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !employee) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl"
      >
        <Card className="bg-white dark:bg-slate-800 border-0 shadow-2xl">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-red-600 dark:text-red-400">
                <AlertTriangle className="h-6 w-6" />
                Confirmar Exclusão
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Verificando...</p>
              </div>
            ) : hasTransfers ? (
              <>
                {/* Aviso sobre transferências */}
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-900 dark:text-red-100 mb-1">
                        Não é possível excluir este funcionário
                      </h4>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        O funcionário <strong>{employee.name}</strong> possui {transferRequests.length} transferência(s) associada(s) que precisam ser removidas primeiro.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Lista de transferências */}
                <div className="space-y-3">
                  <h5 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Transferências Associadas
                  </h5>
                  
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {transferRequests.map((transfer, index) => (
                      <div
                        key={transfer.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              Transferência #{index + 1}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              transfer.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                              transfer.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                              transfer.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {transfer.status}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            <div>De: <strong>{transfer.fromContract}</strong></div>
                            <div>Para: <strong>{transfer.toContract}</strong></div>
                            <div>Solicitado por: <strong>{transfer.requestedBy}</strong></div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(transfer.requestedAt).toLocaleDateString('pt-BR')}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
                  <Button variant="outline" onClick={onClose}>
                    Cancelar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleRemoveTransfers}
                    disabled={isLoading}
                    className="border-orange-300 text-orange-700 hover:bg-orange-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remover Transferências Primeiro
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* Confirmação de deleção */}
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trash2 className="h-8 w-8 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Excluir Funcionário
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Tem certeza que deseja excluir o funcionário <strong>{employee.name}</strong>?
                    <br />
                    <span className="text-sm text-red-600 dark:text-red-400">
                      Esta ação não pode ser desfeita.
                    </span>
                  </p>
                </div>

                {/* Ações */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
                  <Button variant="outline" onClick={onClose}>
                    Cancelar
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      onConfirmDelete(employee.id);
                      onClose();
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir Funcionário
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default DeleteEmployeeModal; 