// src/components/document/VersionComparatorModal.jsx
import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, GitCompare, ArrowRight, Download, RotateCcw } from 'lucide-react';

export default function VersionComparatorModal() {
  const { compareDocs, setCompareDocs, showToast } = useApp();

  if (!compareDocs) return null;

  const { doc, v1, v2 } = compareDocs;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(10, 20, 40, 0.75)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 270
    }}>
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        width: '90vw',
        height: '85vh',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid var(--border-color)',
        animation: 'fadeIn 0.25s ease-out'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--primary-dark)',
          color: 'white'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <GitCompare size={20} color="var(--accent)" />
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'white' }}>Comparador Visual de Versiones</h3>
              <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)' }}>{doc.nombre}</p>
            </div>
          </div>
          <button onClick={() => setCompareDocs(null)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Side by Side Content */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Left Version (Original v1.0) */}
          <div style={{ flex: 1, borderRight: '1px solid var(--border-color)', padding: '24px', overflowY: 'auto', backgroundColor: 'var(--bg-app)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span className="badge badge-info" style={{ fontSize: '0.85rem' }}>Versión Anterior ({v2 || 'v1.0'})</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Autor: Lic. Mario Torres</span>
            </div>
            <div style={{ backgroundColor: 'var(--bg-surface)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.88rem', lineHeight: 1.7 }}>
              <h4 style={{ color: 'var(--primary)', marginBottom: '12px' }}>CLÁUSULA CUARTA: VIGENCIA Y REVISIÓN</h4>
              <p style={{ backgroundColor: 'rgba(239,68,68,0.1)', padding: '6px 10px', borderRadius: '4px', borderLeft: '3px solid var(--danger)', marginBottom: '10px' }}>
                - El presente convenio tendrá una vigencia improrrogable de 12 meses a partir de su firma notariada.
              </p>
              <p>
                Las partes acuerdan someter cualquier controversia a la jurisdicción de los tribunales locales ordinarios.
              </p>
            </div>
          </div>

          {/* Right Version (Current v3.2) */}
          <div style={{ flex: 1, padding: '24px', overflowY: 'auto', backgroundColor: 'var(--bg-app)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span className="badge badge-success" style={{ fontSize: '0.85rem' }}>Versión Actual ({v1 || 'v3.2'})</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Autor: Dra. Ana Gómez</span>
            </div>
            <div style={{ backgroundColor: 'var(--bg-surface)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.88rem', lineHeight: 1.7 }}>
              <h4 style={{ color: 'var(--primary)', marginBottom: '12px' }}>CLÁUSULA CUARTA: VIGENCIA Y REVISIÓN</h4>
              <p style={{ backgroundColor: 'rgba(31,169,113,0.15)', padding: '6px 10px', borderRadius: '4px', borderLeft: '3px solid var(--success)', marginBottom: '10px' }}>
                + El presente convenio tendrá una vigencia renovable automáticamente por periodos de 36 meses previa evaluación de desempeño interinstitucional.
              </p>
              <p style={{ backgroundColor: 'rgba(31,169,113,0.15)', padding: '6px 10px', borderRadius: '4px', borderLeft: '3px solid var(--success)', marginBottom: '10px' }}>
                + Adicionalmente se incluye la cláusula de mediación y arbitraje universitario digital.
              </p>
              <p>
                Las partes acuerdan someter cualquier controversia a la jurisdicción de los tribunales locales ordinarios.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--bg-surface)'
        }}>
          <button className="btn btn-secondary" onClick={() => {
            showToast('Versión v1.0 restaurada exitosamente', 'success');
            setCompareDocs(null);
          }}>
            <RotateCcw size={16} /> Restaurar esta versión
          </button>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-outline" onClick={() => setCompareDocs(null)}>Cerrar</button>
            <button className="btn btn-primary" onClick={() => {
              showToast('Informe de diferencias exportado en PDF', 'info');
              setCompareDocs(null);
            }}>
              <Download size={16} /> Exportar Comparativa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
