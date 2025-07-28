'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Download, Upload, Database, Clock, CheckCircle, AlertTriangle, Trash2, RefreshCw, Settings, Shield } from 'lucide-react';

interface BackupInfo {
  id: string;
  name: string;
  description: string;
  size: number;
  createdAt: Date;
  type: 'MANUAL' | 'AUTOMATIC';
  status: 'SUCCESS' | 'FAILED' | 'IN_PROGRESS';
  tables: string[];
  recordCount: number;
}

interface BackupManagerProps {
  onBackup: (options: BackupOptions) => void;
  onRestore: (backupId: string) => void;
  onDelete: (backupId: string) => void;
  loading?: boolean;
}

interface BackupOptions {
  name: string;
  description: string;
  includeData: boolean;
  includeSchema: boolean;
  includeFiles: boolean;
  compression: boolean;
  encryption: boolean;
}

export default function BackupManager({ onBackup, onRestore, onDelete, loading = false }: BackupManagerProps) {
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [selectedBackup, setSelectedBackup] = useState<string | null>(null);
  const [backupOptions, setBackupOptions] = useState<BackupOptions>({
    name: '',
    description: '',
    includeData: true,
    includeSchema: true,
    includeFiles: false,
    compression: true,
    encryption: false,
  });

  useEffect(() => {
    // Simular carregamento de backups
    loadBackups();
  }, []);

  const loadBackups = () => {
    // Simular dados de backup
    const mockBackups: BackupInfo[] = [
      {
        id: '1',
        name: 'Backup Completo - Dezembro 2024',
        description: 'Backup completo do sistema incluindo todos os dados',
        size: 1024 * 1024 * 50, // 50MB
        createdAt: new Date('2024-12-01T10:00:00'),
        type: 'MANUAL',
        status: 'SUCCESS',
        tables: ['budgets', 'employees', 'functions', 'nfc_badges'],
        recordCount: 1250,
      },
      {
        id: '2',
        name: 'Backup Automático - Novembro 2024',
        description: 'Backup automático diário',
        size: 1024 * 1024 * 25, // 25MB
        createdAt: new Date('2024-11-30T23:00:00'),
        type: 'AUTOMATIC',
        status: 'SUCCESS',
        tables: ['budgets', 'employees'],
        recordCount: 850,
      },
      {
        id: '3',
        name: 'Backup Parcial - Orçamentos',
        description: 'Backup apenas dos dados de orçamentos',
        size: 1024 * 1024 * 15, // 15MB
        createdAt: new Date('2024-11-29T15:30:00'),
        type: 'MANUAL',
        status: 'SUCCESS',
        tables: ['budgets'],
        recordCount: 320,
      },
    ];
    setBackups(mockBackups);
  };

  const handleCreateBackup = () => {
    if (!backupOptions.name) {
      alert('Nome do backup é obrigatório');
      return;
    }

    onBackup(backupOptions);
    
    // Limpar formulário
    setBackupOptions({
      name: '',
      description: '',
      includeData: true,
      includeSchema: true,
      includeFiles: false,
      compression: true,
      encryption: false,
    });
  };

  const handleRestore = (backupId: string) => {
    if (confirm('Tem certeza que deseja restaurar este backup? Esta ação irá sobrescrever os dados atuais.')) {
      onRestore(backupId);
    }
  };

  const handleDelete = (backupId: string) => {
    if (confirm('Tem certeza que deseja excluir este backup?')) {
      onDelete(backupId);
      setBackups(backups.filter(b => b.id !== backupId));
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'bg-green-100 text-green-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="w-4 h-4" />;
      case 'FAILED':
        return <AlertTriangle className="w-4 h-4" />;
      case 'IN_PROGRESS':
        return <RefreshCw className="w-4 h-4 animate-spin" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'MANUAL' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800';
  };

  return (
    <div className="space-y-6">
      {/* Criar Novo Backup */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Database className="w-5 h-5 text-blue-600" />
            Criar Novo Backup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="backupName" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                Nome do Backup <span className="text-red-500">*</span>
              </Label>
              <Input
                id="backupName"
                value={backupOptions.name}
                onChange={(e) => setBackupOptions({ ...backupOptions, name: e.target.value })}
                placeholder="Ex: Backup Completo - Dezembro 2024"
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="backupDescription" className="text-sm font-medium text-gray-700">
                Descrição
              </Label>
              <Input
                id="backupDescription"
                value={backupOptions.description}
                onChange={(e) => setBackupOptions({ ...backupOptions, description: e.target.value })}
                placeholder="Descrição do backup"
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="includeData"
                checked={backupOptions.includeData}
                onChange={(e) => setBackupOptions({ ...backupOptions, includeData: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="includeData" className="text-sm text-gray-700">
                Incluir Dados
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="includeSchema"
                checked={backupOptions.includeSchema}
                onChange={(e) => setBackupOptions({ ...backupOptions, includeSchema: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="includeSchema" className="text-sm text-gray-700">
                Incluir Schema
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="includeFiles"
                checked={backupOptions.includeFiles}
                onChange={(e) => setBackupOptions({ ...backupOptions, includeFiles: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="includeFiles" className="text-sm text-gray-700">
                Incluir Arquivos
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="compression"
                checked={backupOptions.compression}
                onChange={(e) => setBackupOptions({ ...backupOptions, compression: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="compression" className="text-sm text-gray-700">
                Comprimir
              </Label>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="encryption"
              checked={backupOptions.encryption}
              onChange={(e) => setBackupOptions({ ...backupOptions, encryption: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <Label htmlFor="encryption" className="text-sm text-gray-700">
              Criptografar Backup
            </Label>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleCreateBackup}
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Database className="w-4 h-4 mr-2" />
              {loading ? 'Criando Backup...' : 'Criar Backup'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Backups */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Shield className="w-5 h-5 text-green-600" />
              Backups Disponíveis
            </CardTitle>
            <Button
              onClick={loadBackups}
              variant="outline"
              size="sm"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {backups.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Database className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum backup encontrado</h3>
              <p className="text-gray-600">
                Crie seu primeiro backup para proteger seus dados
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {backups.map((backup) => (
                <div key={backup.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors duration-150">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium text-gray-900">{backup.name}</h4>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(backup.status)}`}>
                          {getStatusIcon(backup.status)}
                          <span className="ml-1">{backup.status}</span>
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(backup.type)}`}>
                          {backup.type === 'MANUAL' ? 'Manual' : 'Automático'}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{backup.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Tamanho:</span>
                          <span className="ml-1 font-medium">{formatFileSize(backup.size)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Criado em:</span>
                          <span className="ml-1 font-medium">{formatDate(backup.createdAt)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Tabelas:</span>
                          <span className="ml-1 font-medium">{backup.tables.length}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Registros:</span>
                          <span className="ml-1 font-medium">{backup.recordCount.toLocaleString()}</span>
                        </div>
                      </div>

                      {backup.tables.length > 0 && (
                        <div className="mt-3">
                          <span className="text-xs text-gray-500">Tabelas incluídas:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {backup.tables.map((table, index) => (
                              <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                                {table}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        onClick={() => handleRestore(backup.id)}
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        disabled={backup.status !== 'SUCCESS'}
                      >
                        <Upload className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        onClick={() => handleDelete(backup.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configurações de Backup */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Settings className="w-5 h-5 text-purple-600" />
            Configurações de Backup Automático
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Frequência de Backup</h4>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="daily"
                    name="frequency"
                    value="daily"
                    className="border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="daily" className="text-sm text-gray-700">
                    Diário (recomendado)
                  </Label>
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="weekly"
                    name="frequency"
                    value="weekly"
                    className="border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="weekly" className="text-sm text-gray-700">
                    Semanal
                  </Label>
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="monthly"
                    name="frequency"
                    value="monthly"
                    className="border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="monthly" className="text-sm text-gray-700">
                    Mensal
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Retenção de Backups</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Manter backups por:</span>
                  <select className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="7">7 dias</option>
                    <option value="30">30 dias</option>
                    <option value="90">90 dias</option>
                    <option value="365">1 ano</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="compressOld"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="compressOld" className="text-sm text-gray-700">
                    Comprimir backups antigos
                  </Label>
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="notifyOnFailure"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="notifyOnFailure" className="text-sm text-gray-700">
                    Notificar em caso de falha
                  </Label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <Settings className="w-4 h-4 mr-2" />
              Salvar Configurações
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 