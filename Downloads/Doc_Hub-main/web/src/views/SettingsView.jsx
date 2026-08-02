// src/views/SettingsView.jsx
import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { getInitialsAvatar } from '../utils/avatarUtils';
import { User, Lock, Bell, Moon, Sun, Key, Save, Camera, CheckCircle2 } from 'lucide-react';

export default function SettingsView() {
  const { user, updateUserAvatar, theme, toggleTheme, showToast } = useApp();
  const [activeTab, setActiveTab] = useState('perfil'); // 'perfil' | 'seguridad' | 'notificaciones' | 'firma'

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [cargo, setCargo] = useState(user.cargo);

  // Hidden File Input Ref for Change Profile Picture
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          updateUserAvatar(reader.result.toString());
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    showToast('Perfil de abogado actualizado correctamente', 'success');
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Configuración de la Cuenta de Abogado</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Ajustes de perfil, firma notarial, credenciales de acceso y preferencias.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '24px' }}>
        {/* Left Subnav */}
        <div className="card-glass" style={{ padding: '12px', height: 'fit-content', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {[
            { id: 'perfil', label: 'Editar Perfil', icon: User },
            { id: 'seguridad', label: 'Seguridad y Contraseña', icon: Lock },
            { id: 'notificaciones', label: 'Notificaciones', icon: Bell },
            { id: 'firma', label: 'Firma Notarial y Certificado', icon: Key },
          ].map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                  color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <Icon size={16} /> {item.label}
              </button>
            );
          })}
        </div>

        {/* Right Settings Form Body */}
        <div className="card-glass" style={{ padding: '28px' }}>
          {activeTab === 'perfil' && (
            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '540px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Información Personal y Profesional</h3>

              {/* Working Change Profile Photo Input */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ position: 'relative' }}>
                  <img
                    src={user.avatar}
                    alt={user.name}
                    style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--accent)', boxShadow: 'var(--shadow-md)' }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      position: 'absolute',
                      bottom: '0',
                      right: '0',
                      backgroundColor: 'var(--accent)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '28px',
                      height: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                    title="Cambiar Foto"
                  >
                    <Camera size={14} />
                  </button>
                </div>

                {/* Hidden File Picker */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />

                <div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => fileInputRef.current?.click()}
                      style={{ fontSize: '0.82rem' }}
                    >
                      <Camera size={15} /> Subir Imagen
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => updateUserAvatar(getInitialsAvatar(user.name))}
                      style={{ fontSize: '0.82rem' }}
                    >
                      Usar Insignia de Iniciales
                    </button>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Formato PNG, JPG o Insignia vectorial limpia. Max 2MB.
                  </div>
                </div>
              </div>

              <div>
                <label className="input-label">Nombre Completo del Abogado/Titular</label>
                <input type="text" className="input-field" value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div>
                <label className="input-label">Correo Electrónico Institucional / Despacho</label>
                <input type="email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>

              <div>
                <label className="input-label">Cargo Judicial / Título Profesional</label>
                <input type="text" className="input-field" value={cargo} onChange={(e) => setCargo(e.target.value)} />
              </div>

              {/* Theme Selector */}
              <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                <label className="input-label" style={{ display: 'block', marginBottom: '8px' }}>Apariencia Visual (Tema)</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="button"
                    className={`btn ${theme === 'light' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => theme !== 'light' && toggleTheme()}
                  >
                    <Sun size={16} /> Modo Claro
                  </button>
                  <button
                    type="button"
                    className={`btn ${theme === 'dark' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => theme !== 'dark' && toggleTheme()}
                  >
                    <Moon size={16} /> Modo Oscuro
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="submit" className="btn btn-primary">
                  <Save size={16} /> Guardar Cambios
                </button>
              </div>
            </form>
          )}

          {activeTab === 'seguridad' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '540px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Cambiar Contraseña de Acceso</h3>
              <div>
                <label className="input-label">Contraseña Actual</label>
                <input type="password" className="input-field" placeholder="••••••••" />
              </div>
              <div>
                <label className="input-label">Nueva Contraseña</label>
                <input type="password" className="input-field" placeholder="••••••••" />
              </div>
              <div>
                <label className="input-label">Confirmar Nueva Contraseña</label>
                <input type="password" className="input-field" placeholder="••••••••" />
              </div>
              <button className="btn btn-primary" style={{ width: 'fit-content' }} onClick={() => showToast('Contraseña actualizada con éxito', 'success')}>
                Actualizar Contraseña
              </button>
            </div>
          )}

          {activeTab === 'notificaciones' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '540px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Preferencias de Notificación Judicial</h3>
              {[
                { label: 'Notificarme al correo cuando un escrito requiera firma notarial', default: true },
                { label: 'Notificarme al ser citado o publicado un auto en juzgado', default: true },
                { label: 'Resumen semanal de expediente con estado de acuerdos', default: false },
              ].map((item, i) => (
                <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input type="checkbox" defaultChecked={item.default} style={{ width: '18px', height: '18px', accentColor: 'var(--accent)' }} />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          )}

          {activeTab === 'firma' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '540px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Certificado Digital Notarial / FIEL</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Estado actual: <span style={{ color: 'var(--success)', fontWeight: 700 }}>✓ Certificado e-Firma Activo (.cer / .key)</span>
              </p>
              <button className="btn btn-outline" style={{ width: 'fit-content' }} onClick={() => showToast('Certificado notarial actualizado', 'success')}>
                Renovar Certificado Notarial
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
