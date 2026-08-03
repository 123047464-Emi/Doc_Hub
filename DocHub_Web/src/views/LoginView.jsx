// src/views/LoginView.jsx
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { USERS } from '../data/mockData';
import { Building2, Lock, User, ShieldCheck, ArrowRight } from 'lucide-react';

export default function LoginView() {
  const { login } = useApp();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('1234');

  const handleSubmit = (e) => {
    e.preventDefault();
    login(username, password);
  };

  const handleQuickLogin = (u) => {
    setUsername(u.username);
    setPassword('1234');
    login(u.username, '1234');
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--primary-dark)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      color: '#FFFFFF'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        width: '100%',
        maxWidth: '480px',
        padding: '36px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
        border: '1px solid var(--border-color)',
        color: 'var(--text-primary)',
        animation: 'fadeIn 0.3s ease-out'
      }}>
        {/* Brand Header with Official Logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <img
            src="/logo.jpeg"
            alt="DocHub Logo"
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              objectFit: 'cover',
              margin: '0 auto 14px auto',
              border: '3px solid var(--accent)',
              boxShadow: '0 8px 24px rgba(47,111,237,0.4)',
              display: 'block'
            }}
          />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            DocHub Legal
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Acceso Exclusivo para Administradores y Jueces
          </p>
        </div>

        {/* Quick User Selector */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px', textAlign: 'center' }}>
            Seleccionar Usuario de Prueba
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
            {USERS.filter(u => u.role === 'Administrador' || u.role === 'Juez').map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => handleQuickLogin(u)}
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-app)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
              >
                <img src={u.avatar} alt={u.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{u.cargo} ({u.role})</div>
                </div>
                <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>{u.username}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="input-label" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Usuario o Correo Institucional
            </label>
            <div style={{ position: 'relative', marginTop: '6px' }}>
              <User size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="input-field"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ej: juez1 o correo@universidad.edu.mx"
                style={{ paddingLeft: '36px' }}
                required
              />
            </div>
          </div>

          <div>
            <label className="input-label" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Contraseña
            </label>
            <div style={{ position: 'relative', marginTop: '6px' }}>
              <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ paddingLeft: '36px' }}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: '8px', fontSize: '0.95rem' }}>
            Iniciar Sesión <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
