// src/views/UsersView.jsx
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { USERS } from '../data/mockData';
import { getInitialsAvatar } from '../utils/avatarUtils';
import { createProfileApi } from '../services/apiService';
import { UserPlus, Search, Edit, Lock, Unlock } from 'lucide-react';

export default function UsersView() {
  const { showToast } = useApp();
  const [usersList, setUsersList] = useState(USERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('Revisor');

  const filteredUsers = usersList.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.cargo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleUserStatus = (id) => {
    setUsersList(prev => prev.map(u => {
      if (u.id === id) {
        const nextStatus = u.status === 'Activo' ? 'Bloqueado' : 'Activo';
        showToast(`Acceso legal de ${u.name} cambiado a: ${nextStatus}`, 'info');
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;
    const newUser = {
      id: `u-${Date.now()}`,
      username: newUserName.toLowerCase().replace(/^(lic\.|not\.|dra\.|dr\.|ing\.|mtro\.)\s+/i, '').trim().replace(/\s+/g, ''),
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      cargo: 'Abogado Litigante / Consultor Legal',
      avatar: getInitialsAvatar(newUserName),
      status: 'Activo',
      lastAccess: 'Ahora mismo'
    };

    // Call REST API to sync with mobile app
    await createProfileApi(newUser);

    setUsersList(prev => [newUser, ...prev]);
    showToast(`Cuenta unificada "${newUserName}" creada y sincronizada con la App Móvil`, 'success');
    setIsModalOpen(false);
    setNewUserName('');
    setNewUserEmail('');
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Gestión de Perfiles y Usuarios Unificados (Web ↔ Móvil)</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Administración centralizada de cuentas vinculadas 1-a-1 por la API REST entre la Plataforma Web y la App Móvil.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <UserPlus size={16} /> Registrar Abogado
        </button>
      </div>

      {/* Unified API Profiles Banner */}
      <div className="card-glass" style={{ padding: '20px', backgroundColor: 'var(--bg-surface)', borderLeft: '4px solid var(--accent)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              🌐 ENDPOINT ACTIVO: /api/profiles & /api/auth/login
            </span>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginTop: '2px' }}>
              Ecosistema Integrado: 5 Perfiles Compartidos en Tiempo Real
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Los mismos usuarios (`juez1`, `notario1`, `abogado1`, `parte1`, `testigo1`) con clave `1234` inician sesión con las mismas credenciales tanto en la Web como en la App Móvil.
            </p>
          </div>
          <span className="badge badge-success" style={{ fontWeight: 800 }}>
            API Sync: Conectado (Port 3001)
          </span>
        </div>
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
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Abogados registrados: {usersList.length}</span>
      </div>

      {/* Users Table */}
      <div className="card-glass" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.05em' }}>
              <th style={{ padding: '14px 20px' }}>Fotografía & Abogado</th>
              <th style={{ padding: '14px 20px' }}>Correo Electrónico</th>
              <th style={{ padding: '14px 20px' }}>Rol Asignado</th>
              <th style={{ padding: '14px 20px' }}>Estado</th>
              <th style={{ padding: '14px 20px' }}>Último Acceso</th>
              <th style={{ padding: '14px 20px', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(u => (
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
                  <span className={`badge ${u.status === 'Activo' ? 'badge-success' : 'badge-danger'}`}>{u.status}</span>
                </td>
                <td style={{ padding: '14px 20px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{u.lastAccess}</td>
                <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => showToast(`Editando usuario ${u.name}`, 'info')}>
                      <Edit size={14} /> Editar
                    </button>
                    <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '0.75rem', color: u.status === 'Activo' ? 'var(--warning)' : 'var(--success)' }} onClick={() => toggleUserStatus(u.id)}>
                      {u.status === 'Activo' ? <Lock size={14} /> : <Unlock size={14} />} {u.status === 'Activo' ? 'Bloquear' : 'Activar'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New User Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300 }}>
          <div className="card-glass" style={{ width: '440px', padding: '24px', backgroundColor: 'var(--bg-surface)' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Registrar Nuevo Abogado / Notario</h3>
            <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="input-label">Nombre Completo (Lic./Dr.)</label>
                <input type="text" className="input-field" value={newUserName} onChange={e => setNewUserName(e.target.value)} required />
              </div>
              <div>
                <label className="input-label">Correo Profesional</label>
                <input type="email" className="input-field" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} required />
              </div>
              <div>
                <label className="input-label">Rol Notarial / Judicial</label>
                <select className="input-field" value={newUserRole} onChange={e => setNewUserRole(e.target.value)}>
                  <option value="Administrador">Administrador / Titular</option>
                  <option value="Supervisor">Supervisor / Notario</option>
                  <option value="Revisor">Revisor / Abogado Litigante</option>
                  <option value="Firmante">Firmante / Representante</option>
                  <option value="Usuario">Usuario / Perito</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Crear Cuenta Legal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
