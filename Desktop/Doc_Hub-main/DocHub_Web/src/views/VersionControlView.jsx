// src/views/VersionControlView.jsx
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { History, GitCompare, Download, RotateCcw, FileText, User, Calendar, CheckCircle2 } from 'lucide-react';

export default function VersionControlView() {
  const { visibleDocuments: documents, setCompareDocs, showToast } = useApp();
  const [selectedDocId, setSelectedDocId] = useState(documents[0]?.id || '');

  const activeDoc = documents.find(d => d.id === selectedDocId) || documents[0];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Control de Versiones y Trazabilidad Histórica</h2>
        </div>
      </div>

      {/* Selector of Document */}
      <div className="card-glass" style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <FileText size={20} color="var(--primary)" />
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Seleccionar Documento:</span>
        <select
          className="input-field"
          value={selectedDocId}
          onChange={(e) => setSelectedDocId(e.target.value)}
          style={{ flex: 1, maxWidth: '500px' }}
        >
          {documents.map(d => (
            <option key={d.id} value={d.id}>
              {d.nombre} ({d.version})
            </option>
          ))}
        </select>
      </div>

      {activeDoc && (
        <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '24px' }}>
          {/* Main Timeline View */}
          <div className="card-glass" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{activeDoc.nombre}</h3>
                <span className="badge badge-info" style={{ marginTop: '4px' }}>Versión actual: {activeDoc.version}</span>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => setCompareDocs({ doc: activeDoc, v1: activeDoc.version, v2: 'v1.0' })}
              >
                <GitCompare size={16} /> Comparar Versión Actual vs v1.0
              </button>
            </div>

            {/* Timeline Tree */}
            <div style={{ position: 'relative', paddingLeft: '28px', borderLeft: '2px dashed var(--border-color)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {activeDoc.historial?.map((h, idx) => (
                <div key={idx} style={{ position: 'relative' }}>
                  {/* Timeline Dot */}
                  <div style={{
                    position: 'absolute',
                    left: '-37px',
                    top: '4px',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    backgroundColor: idx === 0 ? 'var(--accent)' : 'var(--bg-surface)',
                    border: `3px solid ${idx === 0 ? 'var(--accent)' : 'var(--text-muted)'}`
                  }} />

                  <div className="card-glass" style={{ padding: '18px 20px', backgroundColor: 'var(--bg-app)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className="badge badge-purple" style={{ fontSize: '0.85rem' }}>{h.version}</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{h.autor}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <Calendar size={13} /> {h.fecha}
                      </div>
                    </div>

                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '8px 0 14px 0' }}>
                      {h.cambios}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                      <span className={`badge ${h.estado === 'Aprobado' || h.estado === 'Finalizado' ? 'badge-success' : 'badge-warning'}`}>
                        {h.estado}
                      </span>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="btn btn-outline"
                          style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                          onClick={() => setCompareDocs({ doc: activeDoc, v1: activeDoc.version, v2: h.version })}
                        >
                          <GitCompare size={14} /> Comparar
                        </button>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                          onClick={() => showToast(`Restaurando versión ${h.version}...`, 'success')}
                        >
                          <RotateCcw size={14} /> Restaurar
                        </button>
                        <button
                          className="btn btn-outline"
                          style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                          onClick={() => showToast(`Descargando copia de ${h.version}...`, 'info')}
                        >
                          <Download size={14} /> Descargar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Version Info Summary Panel */}
          <div className="card-glass" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Resumen del Expediente</h3>
            <div style={{ fontSize: '0.85rem' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Folio Oficial</div>
              <div style={{ fontWeight: 700, marginTop: '2px' }}>{activeDoc.id}</div>
            </div>
            <div style={{ fontSize: '0.85rem' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Total de Revisiones</div>
              <div style={{ fontWeight: 700, marginTop: '2px' }}>{activeDoc.historial?.length || 1} iteraciones</div>
            </div>
            <div style={{ fontSize: '0.85rem' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Integridad de Archivo</div>
              <div style={{ color: 'var(--success)', fontWeight: 700, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={14} /> Encriptación SHA-256
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
