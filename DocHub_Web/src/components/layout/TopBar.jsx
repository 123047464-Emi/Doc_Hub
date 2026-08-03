// src/components/layout/TopBar.jsx
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Bell,
  MessageSquare,
  HelpCircle,
  Sun,
  Moon,
  Upload,
  User,
  CheckCircle2,
  AlertCircle,
  FileText,
  X,
  LogOut,
  Settings,
  ShieldCheck,
  Menu
} from 'lucide-react';

export default function TopBar() {
  const {
    theme,
    toggleTheme,
    user,
    logout,
    setActiveTab,
    toggleMobileMenu,
    searchQuery,
    setSearchQuery,
    notifications,
    isNotifOpen,
    setIsNotifOpen,
    markAllNotifsRead,
    setIsUploadOpen,
    visibleDocuments: documents,
    setSelectedDoc,
    showToast
  } = useApp();

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.leido).length;

  const searchResults = searchQuery.trim() !== ''
    ? documents.filter(d =>
        d.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.categoria.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.autor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.expediente.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <header className="app-topbar" style={{
      height: '70px',
      position: 'fixed',
      top: 0,
      left: '280px',
      right: 0,
      backgroundColor: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      zIndex: 40,
      boxShadow: 'var(--shadow-sm)',
      transition: 'background-color var(--transition-normal)'
    }}>
      {/* Left Section: Mobile Menu Toggle & Global Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, maxWidth: '520px' }}>
        <button
          onClick={toggleMobileMenu}
          className="mobile-menu-btn"
          title="Abrir menú de navegación"
          aria-label="Abrir menú de navegación"
        >
          <Menu size={22} />
        </button>

        <div className="search-bar-container" style={{ position: 'relative', width: '100%', maxWidth: '380px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: 'var(--bg-app)',
            border: `1px solid ${isSearchFocused ? 'var(--accent)' : 'var(--border-color)'}`,
            borderRadius: 'var(--radius-full)',
            padding: '8px 16px',
            transition: 'all 0.2s ease',
            boxShadow: isSearchFocused ? '0 0 0 3px rgba(47,111,237,0.15)' : 'none'
          }}>
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Búsqueda de expedientes, folio, demanda o cliente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              width: '100%',
              fontSize: '0.85rem',
              color: 'var(--text-primary)'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Live Search Results Dropdown */}
        {isSearchFocused && searchQuery.trim() !== '' && (
          <div style={{
            position: 'absolute',
            top: '48px',
            left: 0,
            right: 0,
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            maxHeight: '320px',
            overflowY: 'auto',
            zIndex: 100,
            padding: '8px 0'
          }}>
            <div style={{ padding: '8px 16px', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Expedientes Encontrados ({searchResults.length})
            </div>
            {searchResults.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                No se encontraron expedientes coincidentes.
              </div>
            ) : (
              searchResults.map(doc => (
                <div
                  key={doc.id}
                  onClick={() => {
                    setSelectedDoc(doc);
                    setSearchQuery('');
                  }}
                  style={{
                    padding: '10px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease',
                    borderBottom: '1px solid var(--divider-color)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <FileText size={18} color="var(--primary)" />
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {doc.nombre}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {doc.categoria} · {doc.expediente}
                    </div>
                  </div>
                  <span className="badge badge-info">{doc.version}</span>
                </div>
              ))
            )}
          </div>
        )}
        </div>
      </div>

      {/* Right Controls Bar */}
      <div className="topbar-right-controls" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Upload Document Primary Button (Juez Only) */}
        {user?.role === 'Juez' && (
          <button
            onClick={() => setIsUploadOpen(true)}
            className="btn btn-primary"
            style={{ padding: '8px 16px', borderRadius: 'var(--radius-full)' }}
          >
            <Upload size={16} />
            <span>Subir documento</span>
          </button>
        )}

        {/* Theme Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'light' ? 'Cambiar a Modo Oscuro' : 'Cambiar a Modo Claro'}
          style={{
            background: 'var(--bg-app)',
            border: '1px solid var(--border-color)',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-primary)',
            transition: 'all 0.2s ease'
          }}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} color="#F59E0B" />}
        </button>

        {/* Help Center Trigger */}
        <button
          onClick={() => setIsHelpOpen(true)}
          title="Centro de Ayuda Legal"
          style={{
            background: 'var(--bg-app)',
            border: '1px solid var(--border-color)',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-secondary)'
          }}
        >
          <HelpCircle size={18} />
        </button>

        {/* Messages */}
        <button
          onClick={() => showToast('Mensajes legales: sin nuevas notificaciones judiciales', 'info')}
          title="Mensajes"
          style={{
            background: 'var(--bg-app)',
            border: '1px solid var(--border-color)',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-secondary)'
          }}
        >
          <MessageSquare size={18} />
        </button>

        {/* Notification Bell */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            title="Notificaciones Judiciales"
            style={{
              background: 'var(--bg-app)',
              border: '1px solid var(--border-color)',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              position: 'relative'
            }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                backgroundColor: 'var(--danger)',
                color: 'white',
                fontSize: '0.65rem',
                fontWeight: 800,
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 5px rgba(229,72,77,0.4)'
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {isNotifOpen && (
            <div style={{
              position: 'absolute',
              top: '52px',
              right: 0,
              width: '340px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 100,
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '14px 18px',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Notificaciones Judiciales</div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotifsRead}
                    style={{ background: 'none', border: 'none', fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Marcar leídas
                  </button>
                )}
              </div>

              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {notifications.map(n => (
                  <div
                    key={n.id}
                    style={{
                      padding: '12px 18px',
                      borderBottom: '1px solid var(--divider-color)',
                      backgroundColor: n.leido ? 'transparent' : 'var(--info-bg)',
                      display: 'flex',
                      gap: '12px'
                    }}
                  >
                    <div style={{ marginTop: '2px' }}>
                      {n.tipo === 'firma' ? <AlertCircle size={16} color="var(--purple)" /> : <CheckCircle2 size={16} color="var(--success)" />}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>{n.titulo}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{n.mensaje}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>{n.hora}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar Clickable Dropdown Menu */}
        <div style={{ position: 'relative' }}>
          <div
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              paddingLeft: '8px',
              borderLeft: '1px solid var(--border-color)',
              cursor: 'pointer'
            }}
            title="Opciones de perfil de abogado"
          >
            <img
              src={user.avatar}
              alt={user.name}
              style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent)' }}
            />
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{user.name}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{user.role}</div>
            </div>
          </div>

          {/* User Profile Dropdown */}
          {isProfileMenuOpen && (
            <div style={{
              position: 'absolute',
              top: '50px',
              right: 0,
              width: '220px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 100,
              padding: '8px 0',
              animation: 'fadeIn 0.15s ease-out'
            }}>
              <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--divider-color)' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{user.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.cargo}</div>
              </div>

              <button
                onClick={() => {
                  setActiveTab('configuracion');
                  setIsProfileMenuOpen(false);
                }}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  color: 'var(--text-primary)',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <Settings size={16} /> Editar Perfil
              </button>

              <button
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  logout();
                }}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  color: 'var(--danger)',
                  fontWeight: 600,
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--danger-bg)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <LogOut size={16} /> Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Help Modal */}
      {isHelpOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 200
        }}>
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            padding: '24px',
            borderRadius: 'var(--radius-lg)',
            maxWidth: '480px',
            width: '90%',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.1rem' }}>Centro de Ayuda Legal y Judicial</h3>
              <button onClick={() => setIsHelpOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Bienvenido al Sistema Integral de Gestión y Control Documental para Abogados y Notarios.
            </p>
            <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', paddingLeft: '20px', lineHeight: 1.6 }}>
              <li><strong>Radicar Documento:</strong> Usa el botón superior o arrastra demandas y expedientes.</li>
              <li><strong>Firmas Notariales:</strong> Firma electrónicamente actas y demandas con hash SHA-256.</li>
              <li><strong>Historial y Comparador:</strong> Revisa el historial de cláusulas modificadas.</li>
              <li><strong>Modo Oscuro:</strong> Haz clic en el sol/luna en la barra superior.</li>
            </ul>
            <button className="btn btn-primary" onClick={() => setIsHelpOpen(false)} style={{ marginTop: '20px', width: '100%' }}>Entendido</button>
          </div>
        </div>
      )}
    </header>
  );
}
