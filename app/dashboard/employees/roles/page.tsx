"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface Role {
  id: string;
  name: string;
  type: "Direto" | "Indireto";
}

const mockRoles: Role[] = [
  { id: "1", name: "ADMINISTRATIVO DE OBRAS", type: "Indireto" },
  { id: "2", name: "ENCANADOR", type: "Direto" },
  { id: "3", name: "ENGENHEIRO CIVIL", type: "Indireto" },
];

export default function RolesPage() {
  const t = useTranslations("roles");
  const [roles, setRoles] = useState<Role[]>(mockRoles);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditDrawer, setShowEditDrawer] = useState(false);
  const [editRole, setEditRole] = useState<Role | null>(null);
  const [addForm, setAddForm] = useState({ name: "", type: "Direto" });
  const [addError, setAddError] = useState("");
  const [editForm, setEditForm] = useState({ name: "", type: "Direto" });
  const [editError, setEditError] = useState("");

  // Função para abrir drawer de edição
  const handleEdit = (role: Role) => {
    setEditRole(role);
    setEditForm({ name: role.name, type: role.type });
    setShowEditDrawer(true);
  };

  // Função para adicionar função
  const handleAdd = () => {
    if (!addForm.name.trim()) {
      setAddError(t('form.name_required', { default: 'Nome é obrigatório' }));
      return;
    }
    setRoles(prev => [
      ...prev,
      { id: String(Date.now()), name: addForm.name.trim(), type: addForm.type as Role['type'] }
    ]);
    setAddForm({ name: "", type: "Direto" });
    setAddError("");
    setShowAddModal(false);
  };

  // Função para salvar edição
  const handleEditSave = () => {
    if (!editForm.name.trim()) {
      setEditError(t('form.name_required', { default: 'Nome é obrigatório' }));
      return;
    }
    setRoles(prev => prev.map(r => r.id === editRole?.id ? { ...r, name: editForm.name.trim(), type: editForm.type as Role['type'] } : r));
    setShowEditDrawer(false);
    setEditRole(null);
    setEditError("");
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t('title', { default: 'Funções' })}</CardTitle>
          <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" /> {t('add', { default: 'Adicionar Função' })}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>{t('table.name', { default: 'Função' })}</th>
                  <th>{t('table.type', { default: 'Tipo' })}</th>
                  <th className="w-24 text-center">{t('table.actions', { default: 'Ações' })}</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((role) => (
                  <tr key={role.id}>
                    <td>{role.name}</td>
                    <td>{role.type}</td>
                    <td className="flex gap-2 justify-center">
                      <Button variant="ghost" size="sm" aria-label={t('edit', { default: 'Editar' })} onClick={() => handleEdit(role)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" aria-label={t('delete', { default: 'Excluir' })}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal Adicionar Função */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">{t('add', { default: 'Adicionar Função' })}</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">{t('form.name', { default: 'Nome da Função' })}</label>
              <input
                className="input input-bordered w-full"
                value={addForm.name}
                onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
                maxLength={60}
                autoFocus
              />
              {addError && <span className="text-xs text-red-500 mt-1 block">{addError}</span>}
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">{t('form.type', { default: 'Tipo' })}</label>
              <select
                className="select select-bordered w-full"
                value={addForm.type}
                onChange={e => setAddForm(f => ({ ...f, type: e.target.value }))}
              >
                <option value="Direto">{t('form.direct', { default: 'Direto' })}</option>
                <option value="Indireto">{t('form.indirect', { default: 'Indireto' })}</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => { setShowAddModal(false); setAddError(""); }}>{t('form.cancel', { default: 'Cancelar' })}</Button>
              <Button variant="primary" onClick={handleAdd}>{t('form.save', { default: 'Salvar' })}</Button>
            </div>
          </div>
        </div>
      )}

      {/* Drawer Editar Função */}
      {showEditDrawer && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1" onClick={() => setShowEditDrawer(false)} />
          <div className="w-full max-w-md bg-white dark:bg-slate-800 h-full shadow-xl p-8 overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">{t('edit', { default: 'Editar Função' })}</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">{t('form.name', { default: 'Nome da Função' })}</label>
              <input
                className="input input-bordered w-full"
                value={editForm.name}
                onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                maxLength={60}
                autoFocus
              />
              {editError && <span className="text-xs text-red-500 mt-1 block">{editError}</span>}
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">{t('form.type', { default: 'Tipo' })}</label>
              <select
                className="select select-bordered w-full"
                value={editForm.type}
                onChange={e => setEditForm(f => ({ ...f, type: e.target.value }))}
              >
                <option value="Direto">{t('form.direct', { default: 'Direto' })}</option>
                <option value="Indireto">{t('form.indirect', { default: 'Indireto' })}</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowEditDrawer(false)}>{t('form.cancel', { default: 'Cancelar' })}</Button>
              <Button variant="primary" onClick={handleEditSave}>{t('form.save', { default: 'Salvar' })}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 