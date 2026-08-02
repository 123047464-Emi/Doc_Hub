// src/components/common/Toast.jsx
import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast() {
  const { toast } = useApp();

  if (!toast) return null;

  const bg = toast.type === 'success' ? '#1FA971' : toast.type === 'warning' ? '#D98A11' : '#2F6FED';

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      backgroundColor: bg,
      color: '#FFFFFF',
      padding: '12px 20px',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-lg)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      zIndex: 300,
      animation: 'fadeIn 0.3s ease-out'
    }}>
      {toast.type === 'success' && <CheckCircle2 size={20} />}
      {toast.type === 'warning' && <AlertCircle size={20} />}
      {toast.type === 'info' && <Info size={20} />}
      <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{toast.message}</span>
    </div>
  );
}
