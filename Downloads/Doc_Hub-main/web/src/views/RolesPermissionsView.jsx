// src/views/RolesPermissionsView.jsx
import React from 'react';
import { useApp } from '../context/AppContext';
import { ROLES_DATA } from '../data/mockData';
import { ShieldCheck, Check, Edit, Users, Lock } from 'lucide-react';

export default function RolesPermissionsView() {
  const { showToast } = useApp();

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Matriz de Roles y Permisos</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Configuración granular de facultades de consulta, firma, aprobación y eliminación.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {ROLES_DATA.map(role => (
          <div key={role.id} className="card-glass" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ backgroundColor: 'var(--purple-bg)', color: 'var(--purple)', padding: '8px', borderRadius: '10px' }}>
                    <ShieldCheck size={20} />
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{role.nombre}</h3>
                </div>
                <span className="badge badge-info">{role.usuariosCount} usuarios</span>
              </div>

              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
                {role.descripcion}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Permisos Asignados:</div>
                {role.permisos.map((perm, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: 'var(--success-bg)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={10} />
                    </div>
                    <span>{perm}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              className="btn btn-outline"
              style={{ marginTop: '20px', width: '100%', fontSize: '0.8rem' }}
              onClick={() => showToast(`Editando permisos del rol ${role.nombre}`, 'info')}
            >
              <Edit size={14} /> Editar Permisos de Rol
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
