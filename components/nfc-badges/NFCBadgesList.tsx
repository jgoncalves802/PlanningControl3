'use client';

import { useState } from 'react';
import { Eye, Edit, Trash2, UserPlus, UserMinus, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { NFCBadge, NFCBadgeStatus, NFCBadgeStatusLabels, NFCBadgeStatusColors } from '@/lib/types/nfc-badges';
import { formatNFCBadgeId } from '@/lib/types/nfc-badges';

interface NFCBadgesListProps {
  badges: NFCBadge[];
  isLoading: boolean;
  onView: (badge: NFCBadge) => void;
  onEdit: (badge: NFCBadge) => void;
  onDelete: (badge: NFCBadge) => void;
  onAssign: (badge: NFCBadge) => void;
  onRevoke: (badge: NFCBadge) => void;
}

export default function NFCBadgesList({
  badges,
  isLoading,
  onView,
  onEdit,
  onDelete,
  onAssign,
  onRevoke,
}: NFCBadgesListProps) {
  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (badges.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="text-gray-500">
          <p className="text-lg font-medium">Nenhum crachá encontrado</p>
          <p className="text-sm">Crie um novo crachá para começar</p>
        </div>
      </Card>
    );
  }

  const getStatusBadge = (status: NFCBadgeStatus) => {
    const color = NFCBadgeStatusColors[status];
    const label = NFCBadgeStatusLabels[status];
    
    const colorClasses = {
      green: 'bg-green-100 text-green-800',
      blue: 'bg-blue-100 text-blue-800',
      red: 'bg-red-100 text-red-800',
      orange: 'bg-orange-100 text-orange-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      gray: 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses[color as keyof typeof colorClasses]}`}>
        {label}
      </span>
    );
  };

  const canAssign = (badge: NFCBadge) => {
    return badge.status === NFCBadgeStatus.AVAILABLE && badge.isActive;
  };

  const canRevoke = (badge: NFCBadge) => {
    return badge.status === NFCBadgeStatus.ASSIGNED && badge.isActive;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={selectedBadges.length === badges.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedBadges(badges.map(b => b.id));
                    } else {
                      setSelectedBadges([]);
                    }
                  }}
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID do Crachá
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Funcionário
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Atribuído em
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {badges.map((badge) => (
              <tr key={badge.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={selectedBadges.includes(badge.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedBadges([...selectedBadges, badge.id]);
                      } else {
                        setSelectedBadges(selectedBadges.filter(id => id !== badge.id));
                      }
                    }}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-sm">
                          {badge.badgeId.slice(-2)}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {formatNFCBadgeId(badge.badgeId)}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {badge.badgeId}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(badge.status)}
                    {!badge.isActive && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Inativo
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {badge.employee ? (
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {badge.employee.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {badge.employee.registration || badge.employee.cpf}
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(badge.assignedAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(badge)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(badge)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {canAssign(badge) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onAssign(badge)}
                        className="text-green-600 hover:text-green-900"
                        title="Atribuir a funcionário"
                      >
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    )}
                    {canRevoke(badge) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRevoke(badge)}
                        className="text-orange-600 hover:text-orange-900"
                        title="Revogar crachá"
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(badge)}
                      className="text-red-600 hover:text-red-900"
                      disabled={badge.status === NFCBadgeStatus.ASSIGNED}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
} 