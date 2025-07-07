// Troque a implementação para Supabase futuramente
// Hoje usa mock, amanhã pode ser fetch/axios para backend próprio

export async function getEmployees() {
  const res = await fetch('/api/employees');
  if (!res.ok) throw new Error('Erro ao buscar funcionários');
  return res.json();
}

export async function createEmployee(data) {
  const res = await fetch('/api/employees', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Erro ao criar funcionário');
  return res.json();
}

export async function updateEmployee(id, updates) {
  const res = await fetch(`/api/employees/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Erro ao atualizar funcionário:', errorText);
    throw new Error('Erro ao atualizar funcionário');
  }
  
  return res.json();
}

export async function deleteEmployee(id) {
  const res = await fetch(`/api/employees/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Erro ao deletar funcionário');
  return res.json();
}

export async function addAdmission(id, admission) {
  const res = await fetch(`/api/employees/${id}/admission`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(admission),
  });
  if (!res.ok) throw new Error('Erro ao registrar admissão');
  return res.json();
}

export async function addDismissal(id, dismissalDate) {
  const res = await fetch(`/api/employees/${id}/dismissal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dismissalDate }),
  });
  if (!res.ok) throw new Error('Erro ao registrar demissão');
  return res.json();
}

export async function updateEmployeeAvatar(id, avatar) {
  const res = await fetch(`/api/employees/${id}/avatar`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ avatar }),
  });
  if (!res.ok) throw new Error('Erro ao atualizar avatar');
  return res.json();
}

export async function updateEmploymentHistory(id, employmentHistory) {
  const res = await fetch(`/api/employees/${id}/history`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ employmentHistory }),
  });
  if (!res.ok) throw new Error('Erro ao atualizar histórico');
  return res.json();
} 