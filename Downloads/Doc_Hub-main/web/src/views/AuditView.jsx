// src/views/AuditView.jsx
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Filter, ShieldCheck, Download, Activity, CheckCircle2, XCircle } from 'lucide-react';

export default function AuditView() {
  const { auditLogs, showToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [resultFilter, setResultFilter] = useState('Todos');

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.accion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.documento.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.ip.includes(searchTerm);
    const matchesResult = resultFilter === 'Todos' || log.resultado === resultFilter;
    return matchesSearch && matchesResult;
  });

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Auditoría y Trazabilidad Forense</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Registro inalterable de todos los accesos, firmas, cargas y autorizaciones del sistema.
          </p>
        </div>

        <button className="btn btn-outline" onClick={() => showToast('Log de auditoría exportado en CSV/PDF', 'info')}>
          <Download size={16} /> Exportar Registro Completo
        </button>
      </div>

      <div className="card-glass" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="input-field"
            placeholder="Buscar por usuario, acción o IP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '36px', fontSize: '0.85rem' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Resultado:</span>
          <select
            className="input-field"
            value={resultFilter}
            onChange={(e) => setResultFilter(e.target.value)}
            style={{ width: 'auto', padding: '6px 12px', fontSize: '0.8rem' }}
          >
            <option value="Todos">Todos</option>
            <option value="Exitoso">Exitoso</option>
            <option value="Denegado">Denegado</option>
          </select>
        </div>
      </div>

      <div className="card-glass" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.05em' }}>
              <th style={{ padding: '14px 20px' }}>Usuario</th>
              <th style={{ padding: '14px 20px' }}>Acción Realizada</th>
              <th style={{ padding: '14px 20px' }}>Documento / Folio</th>
              <th style={{ padding: '14px 20px' }}>Fecha y Hora</th>
              <th style={{ padding: '14px 20px' }}>Dirección IP</th>
              <th style={{ padding: '14px 20px' }}>Resultado</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map(log => (
              <tr key={log.id} style={{ borderBottom: '1px solid var(--divider-color)' }}>
                <td style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--text-primary)' }}>{log.usuario}</td>
                <td style={{ padding: '14px 20px', color: 'var(--text-secondary)' }}>{log.accion}</td>
                <td style={{ padding: '14px 20px' }}><span className="badge badge-purple">{log.documento}</span></td>
                <td style={{ padding: '14px 20px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{log.fecha}</td>
                <td style={{ padding: '14px 20px', fontFamily: 'monospace', fontSize: '0.8rem' }}>{log.ip}</td>
                <td style={{ padding: '14px 20px' }}>
                  <span className={`badge ${log.resultado === 'Exitoso' ? 'badge-success' : 'badge-danger'}`}>
                    {log.resultado}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
