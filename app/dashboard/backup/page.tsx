'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Database, Shield, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import BackupManager from '@/components/budgets/BackupManager';

export default function BackupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleBackup = async (options: any) => {
    try {
      setLoading(true);
      console.log('Criando backup com opções:', options);
      // Aqui seria implementada a lógica real de backup
      alert('Backup criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar backup:', error);
      alert('Erro ao criar backup');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (backupId: string) => {
    try {
      setLoading(true);
      console.log('Restaurando backup:', backupId);
      // Aqui seria implementada a lógica real de restauração
      alert('Backup restaurado com sucesso!');
    } catch (error) {
      console.error('Erro ao restaurar backup:', error);
      alert('Erro ao restaurar backup');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (backupId: string) => {
    try {
      setLoading(true);
      console.log('Excluindo backup:', backupId);
      // Aqui seria implementada a lógica real de exclusão
      alert('Backup excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir backup:', error);
      alert('Erro ao excluir backup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gerenciador de Backup</h1>
            <p className="text-gray-600 mt-1">
              Gerencie backups e restaurações do sistema
            </p>
          </div>
        </div>
      </div>

      {/* Cards de Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-0 bg-gradient-to-r from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-200 rounded-lg">
                <Database className="w-6 h-6 text-blue-700" />
              </div>
              <div>
                <p className="text-sm text-blue-700 font-medium">Último Backup</p>
                <p className="text-2xl font-bold text-blue-900">Hoje, 10:30</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-r from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-200 rounded-lg">
                <Shield className="w-6 h-6 text-green-700" />
              </div>
              <div>
                <p className="text-sm text-green-700 font-medium">Status do Sistema</p>
                <p className="text-2xl font-bold text-green-900">Protegido</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-r from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-200 rounded-lg">
                <Settings className="w-6 h-6 text-purple-700" />
              </div>
              <div>
                <p className="text-sm text-purple-700 font-medium">Backups Disponíveis</p>
                <p className="text-2xl font-bold text-purple-900">12</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gerenciador de Backup */}
      <BackupManager
        onBackup={handleBackup}
        onRestore={handleRestore}
        onDelete={handleDelete}
        loading={loading}
      />
    </div>
  );
} 