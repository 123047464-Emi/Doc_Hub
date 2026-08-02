// src/components/layout/Sidebar.jsx
import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  FileText,
  History,
  GitFork,
  PenTool,
  Users,
  ShieldCheck,
  Activity,
  BarChart3,
  Settings,
  LogOut,
  Scale,
  Lock
} from 'lucide-react';

export default function Sidebar() {
  const { activeTab, setActiveTab, user, logout, visibleDocuments } = useApp();

  const isAdmin = user?.role === 'Administrador';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard Legal', icon: LayoutDashboard },
    { id: 'documentos', label: 'Documentos', icon: FileText, badge: String(visibleDocuments?.length || 0) },
    { id: 'version_control', label: 'Control de versiones', icon: History },
    { id: 'flujo_aprobacion', label: 'Flujo de aprobación', icon: GitFork },
    { id: 'firmas', label: 'Firmas digitales (FIEL)', icon: PenTool, badge: String(visibleDocuments?.filter(d => d.estado === 'Pendiente firma').length || 0), badgeColor: 'purple' },
    { id: 'usuarios', label: 'Gestión de Usuarios', icon: Users, adminOnly: true },
    { id: 'roles', label: 'Roles y permisos', icon: ShieldCheck, adminOnly: true },
    { id: 'auditoria', label: 'Auditoría Judicial', icon: Activity, adminOnly: true },
    { id: 'reportes', label: 'Reportes', icon: BarChart3 },
    { id: 'configuracion', label: 'Configuración', icon: Settings },
  ];

  return (
    <aside style={{
      width: '280px',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      backgroundColor: 'var(--primary-dark)',
      color: '#FFFFFF',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 50,
      borderRight: '1px solid rgba(255,255,255,0.1)',
      boxShadow: '4px 0 20px rgba(0,0,0,0.15)'
    }}>
      {/* Brand Header with Official Logo */}
      <div style={{
        padding: '20px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        borderBottom: '1px solid rgba(255,255,255,0.08)'
      }}>
        <img
          src="/logo.jpeg"
          alt="DocHub Logo"
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: '2px solid var(--accent)',
            boxShadow: '0 4px 12px rgba(47,111,237,0.4)'
          }}
        />
        <div>
          <h1 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.2, margin: 0 }}>DocHub Legal</h1>
          <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>Control Jurídico Notarial</span>
        </div>
      </div>

      {/* Navigation Items */}
      <div style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontWeight: 700, padding: '0 12px 8px 12px', letterSpacing: '0.05em' }}>
          Menú Principal
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isRestricted = item.adminOnly && !isAdmin;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: isActive ? 'var(--accent)' : 'transparent',
                  color: isActive ? '#FFFFFF' : isRestricted ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.78)',
                  cursor: 'pointer',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.9rem',
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.color = '#FFFFFF';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = isRestricted ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.78)';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Icon size={19} color={isActive ? '#FFFFFF' : isRestricted ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.7)'} />
                  <span>{item.label}</span>
                </div>
                {isRestricted ? (
                  <Lock size={13} color="rgba(255,255,255,0.4)" />
                ) : item.badge ? (
                  <span style={{
                    backgroundColor: item.badgeColor === 'purple' ? '#7C5CFC' : 'rgba(255,255,255,0.2)',
                    color: '#FFFFFF',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: '12px'
                  }}>
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Profile Bottom Card - Clickable to open Profile & Logout */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        backgroundColor: 'rgba(0,0,0,0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div
            onClick={() => setActiveTab('configuracion')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden', cursor: 'pointer' }}
            title="Ver / Editar Perfil"
          >
            <img
              src={user.avatar}
              alt={user.name}
              style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent)' }}
            />
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.name}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.role}
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            title="Cerrar sesión"
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: 'none',
              borderRadius: '8px',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#F87171',
              transition: 'background 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
