import React from 'react';
import { motion } from 'framer-motion';
import { X, User, FileText, Briefcase, Calendar, CheckCircle, XCircle, Clock, Users, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { useTransferHistory } from '@/lib/hooks/useTransferHistory';
import { formatDate } from '@/lib/utils';

interface TransferHistoryData {
  history?: any[];
}

interface TransferDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  transfer: any;
  onApprove?: () => void;
  onReject?: () => void;
  onComplete?: () => void;
}

export const TransferDetailModal: React.FC<TransferDetailModalProps> = ({
  isOpen,
  onClose,
  transfer,
  onApprove,
  onReject,
  onComplete,
}) => {
  const { data: history, isLoading: loadingHistory } = useTransferHistory({ employeeId: transfer?.employee?.id, limit: 5 }) as { data?: TransferHistoryData, isLoading: boolean };
  if (!isOpen || !transfer) return null;

  // Impedimentos reais de segurança
  const safety = transfer.safetyValidation;
  const realImpediments = [
    ...(safety?.missingTrainings || []),
    ...(safety?.expiringASOs || []),
    ...(safety?.expiringTrainings || []),
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Pendente';
      case 'APPROVED': return 'Aprovada';
      case 'COMPLETED': return 'Concluída';
      case 'REJECTED': return 'Rejeitada';
      default: return status;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <Avatar src={transfer.employee?.avatar || ''} alt={transfer.employee?.name || 'Funcionário'} />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">{transfer.employee?.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transfer.status)}`}>{getStatusLabel(transfer.status)}</span>
                <span className="text-sm text-gray-600 dark:text-slate-400">Matrícula: {transfer.employee?.registration}</span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-8">
          {/* Dados do Funcionário */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <User className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100">Dados do Funcionário</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">Nome</label>
                <p className="text-sm text-gray-900 dark:text-slate-100">{transfer.employee?.name}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">CPF</label>
                <p className="text-sm text-gray-900 dark:text-slate-100">{transfer.employee?.cpf}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">Matrícula</label>
                <p className="text-sm text-gray-900 dark:text-slate-100">{transfer.employee?.registration}</p>
              </div>
            </div>
          </div>
          {/* Dados da Transferência */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Briefcase className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100">Dados da Transferência</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">Contrato Destino</label>
                <p className="text-sm text-gray-900 dark:text-slate-100">{transfer.toContractId}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">Função</label>
                <p className="text-sm text-gray-900 dark:text-slate-100">{transfer.employee?.currentFunction?.name || transfer.employee?.companyFunction?.name || '-'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">Data Agendada</label>
                <p className="text-sm text-gray-900 dark:text-slate-100">{transfer.scheduledDate ? formatDate(transfer.scheduledDate) : '-'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">Solicitante</label>
                <p className="text-sm text-gray-900 dark:text-slate-100">{transfer.requestedBy?.name}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">Aprovador</label>
                <p className="text-sm text-gray-900 dark:text-slate-100">{transfer.approvedBy?.name ?? '-'}</p>
              </div>
            </div>
          </div>
          {/* Impedimentos */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <h3 className="text-lg font-medium text-yellow-700 dark:text-yellow-300">Impedimentos</h3>
            </div>
            {realImpediments.length > 0 ? (
              <ul className="list-disc ml-8 text-sm text-yellow-700 dark:text-yellow-300">
                {realImpediments.map((imp, idx) => <li key={idx}>{imp}</li>)}
              </ul>
            ) : (
              <div className="flex items-center gap-2 text-green-700 dark:text-green-300 text-sm my-2">
                <CheckCircle className="h-5 w-5" />
                Todos os requisitos de segurança estão em dia.
              </div>
            )}
          </div>
          {/* Histórico de transferências do funcionário */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Users className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100">Histórico do Funcionário</h3>
            </div>
            {loadingHistory ? (
              <p className="text-gray-400">Carregando histórico...</p>
            ) : !history?.history?.length ? (
              <p className="text-gray-400">Nenhuma transferência anterior encontrada.</p>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-slate-800">
                {history?.history?.map((h: any) => (
                  <li key={h.id} className="py-2 flex flex-col md:flex-row md:items-center md:gap-4">
                    <span className="text-sm text-gray-900 dark:text-slate-100">Contrato: {h.contractId}</span>
                    <span className="text-sm text-gray-500">Função: {h.functionId}</span>
                    <span className="text-xs text-gray-400">Início: {h.startDate ? formatDate(h.startDate) : '-'}</span>
                    <span className="text-xs text-gray-400">Fim: {h.endDate ? formatDate(h.endDate) : '-'}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {/* Ações contextuais */}
          <div className="flex gap-4 mt-8 justify-end">
            {onApprove && <Button onClick={onApprove} variant="primary">Aprovar</Button>}
            {onReject && <Button onClick={onReject} variant="danger">Rejeitar</Button>}
            {onComplete && <Button onClick={onComplete} variant="primary">Concluir</Button>}
          </div>
        </div>
      </motion.div>
    </div>
  );
}; 