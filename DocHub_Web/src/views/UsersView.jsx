// src/views/UsersView.jsx
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { USERS } from '../data/mockData';
import { getInitialsAvatar } from '../utils/avatarUtils';
import { createProfileApi } from '../services/apiService';
import { UserPlus, Search, Edit, Trash2 } from 'lucide-react';

export default function UsersView() {
  const { usersList, addUser, updateUser, deleteUser, showToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('Juez');
  const [newUserCargo, setNewUserCargo] = useState('');

  const filteredUsers = usersList.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.cargo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    let defaultCargo = `${newUserRole} del Sistema`;
    if (newUserRole === 'Juez') defaultCargo = 'Juez 3° Familiar';
    else if (newUserRole === 'Notario') defaultCargo = 'Notaría Pública 24';
    else if (newUserRole === 'Abogado') defaultCargo = 'Abogado Litigante';
    else if (newUserRole === 'Parte') defaultCargo = 'Parte solicitante';
    else if (newUserRole === 'Testigo') defaultCargo = 'Testigo / Perito';
    else if (newUserRole === 'Administrador') defaultCargo = 'Administrador del Sistema';

    const selectedCargo = newUserCargo.trim() || defaultCargo;
    const isWebRole = newUserRole === 'Administrador' || newUserRole === 'Juez';

    const newUser = {
      id: `u-${Date.now()}`,
      username: newUserName.toLowerCase().replace(/^(lic\.|not\.|dra\.|dr\.|ing\.|mtro\.)\s+/i, '').trim().replace(/\s+/g, ''),
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      cargo: selectedCargo,
      avatar: getInitialsAvatar(newUserName),
      status: 'Activo',
      lastAccess: 'Ahora mismo',
      accesoWeb: isWebRole,
      accesoMobile: true
    };

    await createProfileApi(newUser);
    addUser(newUser);

    showToast(`Usuario "${newUserName}" agregado exitosamente con el rol "${newUserRole}" (Sincronizado App Móvil)`, 'success');
    setIsModalOpen(false);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserRole('Abogado');
    setNewUserCargo('');
  };

  const handleSaveEditUser = (e) => {
    e.preventDefault();
    if (!editingUser) return;

    const isWebRole = editingUser.role === 'Administrador' || editingUser.role === 'Juez';
    const updated = {
      ...editingUser,
      accesoWeb: isWebRole,
      accesoMobile: true
    };

    updateUser(updated);
    setEditingUser(null);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Gestión de Perfiles y Usuarios</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Consola del Administrador · Asignación y edición de roles para la plataforma Web y App Móvil
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <UserPlus size={16} /> Agregar Usuario
        </button>
      </div>

      {/* Search */}
      <div className="card-glass" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="input-field"
            placeholder="Buscar por nombre, correo, cédula o rol..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '36px', fontSize: '0.85rem' }}
          />
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Usuarios registrados: {usersList.length}</span>
      </div>

      {/* Users Table */}
      <div className="card-glass" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.05em' }}>
              <th style={{ padding: '14px 20px' }}>Fotografía & Usuario</th>
              <th style={{ padding: '14px 20px' }}>Correo Electrónico</th>
              <th style={{ padding: '14px 20px' }}>Rol Asignado</th>
              <th style={{ padding: '14px 20px' }}>Acceso Plataforma</th>
              <th style={{ padding: '14px 20px' }}>Estado</th>
              <th style={{ padding: '14px 20px' }}>Último Acceso</th>
              <th style={{ padding: '14px 20px', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(u => {
              const isWebRole = u.role === 'Administrador' || u.role === 'Juez';
              return (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--divider-color)' }}>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img src={u.avatar} alt={u.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{u.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.cargo}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px', color: 'var(--text-secondary)' }}>{u.email}</td>
                  <td style={{ padding: '14px 20px' }}><span className="badge badge-purple">{u.role}</span></td>
                  <td style={{ padding: '14px 20px' }}>
                    <span className={`badge ${isWebRole ? 'badge-success' : 'badge-info'}`}>
                      {isWebRole ? 'Web + App Móvil' : 'Solo App Móvil'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span className={`badge ${u.status === 'Activo' ? 'badge-success' : 'badge-danger'}`}>{u.status}</span>
                  </td>
                  <td style={{ padding: '14px 20px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{u.lastAccess}</td>
                  <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => setEditingUser(u)}>
                        <Edit size={14} /> Editar Rol
                      </button>
                      <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '0.75rem', color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => deleteUser(u.id)}>
                        <Trash2 size={14} /> Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* New User Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300 }}>
          <div className="card-glass" style={{ width: '460px', padding: '24px', backgroundColor: 'var(--bg-surface)' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Agregar Nuevo Usuario</h3>
            <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="input-label">Nombre Completo</label>
                <input type="text" className="input-field" placeholder="Ej. Lic. Roberto Gómez" value={newUserName} onChange={e => setNewUserName(e.target.value)} required />
              </div>
              <div>
                <label className="input-label">Correo Electrónico</label>
                <input type="email" className="input-field" placeholder="usuario@ejemplo.com" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} required />
              </div>
              <div>
                <label className="input-label">Rol del Usuario</label>
                <select className="input-field" value={newUserRole} onChange={e => setNewUserRole(e.target.value)}>
                  <option value="Juez">Juez (Web + Móvil)</option>
                  <option value="Notario">Notario (Solo Móvil)</option>
                  <option value="Abogado">Abogado (Solo Móvil)</option>
                  <option value="Parte">Parte (Solo Móvil)</option>
                  <option value="Testigo">Testigo (Solo Móvil)</option>
                  <option value="Administrador">Administrador (Web + Móvil)</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Agregar Usuario</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User & Role Modal (Admin Only) */}
      {editingUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300 }}>
          <div className="card-glass" style={{ width: '480px', padding: '24px', backgroundColor: 'var(--bg-surface)' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '4px', fontWeight: 800 }}>Editar Usuario y Rol Asignado</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Cambio exclusivo por el Administrador para la Plataforma Web y App Móvil
            </p>

            <form onSubmit={handleSaveEditUser} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="input-label">Nombre Completo</label>
                <input
                  type="text"
                  className="input-field"
                  value={editingUser.name}
                  onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="input-label">Correo Electrónico (No modificable)</label>
                <input
                  type="email"
                  className="input-field"
                  value={editingUser.email}
                  disabled
                  style={{ cursor: 'not-allowed', backgroundColor: 'var(--bg-app)', color: 'var(--text-secondary)' }}
                />
              </div>

              <div>
                <label className="input-label" style={{ fontWeight: 700, color: 'var(--accent)' }}>Rol del Usuario (Asignación Administrativa)</label>
                <select
                  className="input-field"
                  value={editingUser.role}
                  onChange={e => setEditingUser({ ...editingUser, role: e.target.value })}
                  style={{ border: '2px solid var(--accent)' }}
                >
                  <option value="Juez">Juez (Web + Móvil)</option>
                  <option value="Notario">Notario (Solo Móvil)</option>
                  <option value="Abogado">Abogado (Solo Móvil)</option>
                  <option value="Parte">Parte (Solo Móvil)</option>
                  <option value="Testigo">Testigo (Solo Móvil)</option>
                  <option value="Administrador">Administrador (Web + Móvil)</option>
                </select>
              </div>

              <div>
                <label className="input-label">Cargo o Título Profesional</label>
                <input
                  type="text"
                  className="input-field"
                  value={editingUser.cargo}
                  onChange={e => setEditingUser({ ...editingUser, cargo: e.target.value })}
                />
              </div>

              <div>
                <label className="input-label">Estado de la Cuenta</label>
                <select
                  className="input-field"
                  value={editingUser.status}
                  onChange={e => setEditingUser({ ...editingUser, status: e.target.value })}
                >
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingUser(null)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

