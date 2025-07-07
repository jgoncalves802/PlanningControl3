"use client";
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2, Users } from "lucide-react";
import { mockContracts, Contract } from '@/lib/mock-data'
import { 
  getCurrentUser, 
  getUserPermissions, 
  validateUserAccess,
  User,
  UserRole
} from '@/lib/auth'

interface Role {
  id: string;
  name: string;
  description: string;
  contractId: string;
  isActive: boolean;
}

const mockRoles: Role[] = [
  { id: "1", name: "ADMINISTRATIVO DE OBRAS", description: "Função administrativa", contractId: "1", isActive: true },
  { id: "2", name: "ENCANADOR", description: "Função operacional", contractId: "1", isActive: true },
  { id: "3", name: "ENGENHEIRO CIVIL", description: "Função técnica", contractId: "2", isActive: true },
];

export default function RolesPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [userPermissions, setUserPermissions] = useState<any>(null)
  const [roles, setRoles] = useState<Role[]>(mockRoles)
  const [contracts] = useState<Contract[]>(mockContracts)
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditDrawer, setShowEditDrawer] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");

  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUser(user)
    
    const permissions = getUserPermissions(user)
    setUserPermissions(permissions)
  }, [])

  const handleAddRole = () => {
    if (newRoleName.trim()) {
      const newRole: Role = {
        id: Date.now().toString(),
        name: newRoleName.trim(),
        description: newRoleDescription.trim(),
        contractId: "1", // Default contract
        isActive: true
    }
      setRoles(prev => [...prev, newRole])
      setNewRoleName("")
      setNewRoleDescription("")
      setShowAddModal(false)
    }
  }

  const handleDeleteRole = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta função?")) {
      setRoles(prev => prev.filter(role => role.id !== id))
    }
  }

  if (!currentUser || !userPermissions) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Carregando...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Funções</h1>
          <p className="text-gray-600">Gerencie as funções disponíveis nos contratos</p>
        </div>
        {validateUserAccess(currentUser, 'MANAGE_EMPLOYEES') && (
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Função
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Funções Cadastradas ({roles.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
                {roles.map((role) => (
              <div key={role.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">{role.name}</h3>
                  <p className="text-sm text-gray-600">{role.description}</p>
                </div>
                {validateUserAccess(currentUser, 'MANAGE_EMPLOYEES') && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedRole(role)
                        setShowEditDrawer(true)
                      }}
                    >
                        <Edit className="h-4 w-4" />
                      </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteRole(role.id)}
                    >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                  </div>
                )}
              </div>
                ))}
          </div>
        </CardContent>
      </Card>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Adicionar Nova Função</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome da Função</label>
              <input
                  type="text"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Digite o nome da função"
                />
            </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descrição</label>
              <input
                  type="text"
                  value={newRoleDescription}
                  onChange={(e) => setNewRoleDescription(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Digite a descrição da função"
                />
            </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddRole}>
                Adicionar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 