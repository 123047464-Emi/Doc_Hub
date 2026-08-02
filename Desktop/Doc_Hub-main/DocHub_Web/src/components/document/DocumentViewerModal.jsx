// src/components/document/DocumentViewerModal.jsx
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Download,
  Share2,
  CheckCircle,
  XCircle,
  PenTool,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  FileText,
  Info,
  History,
  GitBranch,
  MessageSquare,
  Shield,
  Send,
  Printer
} from 'lucide-react';

import { downloadDocumentPDF } from '../../utils/pdfGenerator';

export default function DocumentViewerModal() {
  const { selectedDoc, setSelectedDoc, updateDocumentStatus, setCompareDocs, showToast, user } = useApp();
  const [rightTab, setRightTab] = useState('info'); // 'info' | 'history' | 'versions' | 'comments' | 'permissions'
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [comments, setComments] = useState([
    { id: 1, autor: 'Lic. Mario Torres', fecha: '2026-05-29 14:10', texto: 'Revisado el escrito de demanda, cumple con los requisitos del Código de Procedimientos Civiles.' },
    { id: 2, autor: 'Not. Karla Sánchez', fecha: '2026-05-30 08:30', texto: 'Pendiente únicamente la firma autógrafa digital del Juez Titular.' }
  ]);
  const [newComment, setNewComment] = useState('');

  if (!selectedDoc) return null;

  const totalPages = selectedDoc.paginas || 14;

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setComments(prev => [
      ...prev,
      {
        id: Date.now(),
        autor: user.name,
        fecha: new Date().toISOString().replace('T', ' ').slice(0, 16),
        texto: newComment
      }
    ]);
    setNewComment('');
    showToast('Observación jurídica agregada al expediente', 'success');
  };

  const handleAction = (actionName) => {
    if (actionName === 'Aprobar') {
      updateDocumentStatus(selectedDoc.id, 'Aprobado', 'Autorizado por Juez');
      showToast(`Expediente "${selectedDoc.nombre}" AUTORIZADO JUDICIALMENTE`, 'success');
    } else if (actionName === 'Rechazar') {
      updateDocumentStatus(selectedDoc.id, 'Rechazado', 'En revisión legal');
      showToast(`Expediente "${selectedDoc.nombre}" RECHAZADO`, 'warning');
    } else if (actionName === 'Firmar') {
      updateDocumentStatus(selectedDoc.id, 'Finalizado', 'Sentencia / Ejecutoriado');
      showToast(`Firma e-Firma notarial aplicada a "${selectedDoc.nombre}"`, 'success');
    } else if (actionName === 'Descargar') {
      downloadDocumentPDF(selectedDoc);
      showToast(`Copia certificada "${selectedDoc.nombre}" descargada en PDF`, 'success');
    } else if (actionName === 'Compartir') {
      navigator.clipboard?.writeText(window.location.href);
      showToast('Enlace seguro del expediente copiado al portapapeles', 'info');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(10, 20, 40, 0.85)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 260
    }}>
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        width: '95vw',
        height: '92vh',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid var(--border-color)',
        animation: 'fadeIn 0.25s ease-out'
      }}>
        {/* Top Viewer Header Bar */}
        <div style={{
          height: '60px',
          padding: '0 24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--primary-dark)',
          color: 'white'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', overflow: 'hidden' }}>
            <div style={{ backgroundColor: 'var(--accent)', padding: '6px', borderRadius: '8px', display: 'flex' }}>
              <FileText size={20} color="white" />
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '400px' }}>
                {selectedDoc.nombre}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>
                {selectedDoc.categoria} · {selectedDoc.version} · {selectedDoc.expediente}
              </div>
            </div>
          </div>

          {/* Action Buttons Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button className="btn btn-outline" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => handleAction('Descargar')}>
              <Download size={15} /> Descargar Copia
            </button>
            <button className="btn btn-outline" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => handleAction('Compartir')}>
              <Share2 size={15} /> Compartir
            </button>
            <button className="btn" style={{ backgroundColor: 'var(--success)', color: 'white', padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => handleAction('Aprobar')}>
              <CheckCircle size={15} /> Autorizar Juez
            </button>
            <button className="btn" style={{ backgroundColor: 'var(--danger)', color: 'white', padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => handleAction('Rechazar')}>
              <XCircle size={15} /> Rechazar
            </button>
            <button className="btn" style={{ backgroundColor: 'var(--purple)', color: 'white', padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => handleAction('Firmar')}>
              <PenTool size={15} /> Firmar e-Firma
            </button>
            <button onClick={() => setSelectedDoc(null)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '34px', height: '34px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginLeft: '8px' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Main Body: Left PDF Preview + Right Panel */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Left PDF Canvas Simulated Viewer */}
          <div style={{
            flex: 1,
            backgroundColor: 'var(--bg-app)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Viewer Controls sub-bar */}
            <div style={{
              width: '100%',
              padding: '8px 20px',
              backgroundColor: 'var(--bg-surface)',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.8rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  style={{ border: '1px solid var(--border-color)', background: 'var(--bg-surface)', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer' }}
                >
                  <ChevronLeft size={16} />
                </button>
                <span>Página {currentPage} de {totalPages}</span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  style={{ border: '1px solid var(--border-color)', background: 'var(--bg-surface)', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer' }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button onClick={() => setZoom(z => Math.max(50, z - 10))} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                  <ZoomOut size={18} />
                </button>
                <span style={{ fontWeight: 600 }}>{zoom}%</span>
                <button onClick={() => setZoom(z => Math.min(200, z + 10))} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                  <ZoomIn size={18} />
                </button>
                <button onClick={() => showToast('Enviado a impresión judicial certificada', 'info')} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                  <Printer size={18} />
                </button>
              </div>
            </div>

            {/* Simulated Legal Document Paper */}
            <div style={{
              flex: 1,
              width: '100%',
              overflow: 'auto',
              padding: '40px',
              display: 'flex',
              justifyContent: 'center',
              backgroundColor: '#475569'
            }}>
              <div style={{
                width: `${(650 * zoom) / 100}px`,
                minHeight: `${(850 * zoom) / 100}px`,
                backgroundColor: '#FFFFFF',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                borderRadius: '4px',
                padding: `${(48 * zoom) / 100}px`,
                color: '#1E293B',
                fontFamily: 'serif',
                position: 'relative',
                transition: 'width 0.2s ease, min-height 0.2s ease'
              }}>
                {/* Official Judicial Header */}
                <div style={{ textAlign: 'center', borderBottom: '2px solid #0F2A4A', paddingBottom: '16px', marginBottom: '24px' }}>
                  <h2 style={{ fontSize: `${1.3 * (zoom / 100)}rem`, color: '#0F2A4A', margin: 0, fontFamily: 'Outfit, sans-serif', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    PODER JUDICIAL DEL ESTADO · TRIBUNAL SUPERIOR
                  </h2>
                  <div style={{ fontSize: `${0.85 * (zoom / 100)}rem`, color: '#475569', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>
                    JUZGADO TERCERO DE LO FAMILIAR · REGISTRO JUDICIAL DE EXPEDIENTES
                  </div>
                </div>

                <div style={{ fontSize: `${0.95 * (zoom / 100)}rem`, lineHeight: 1.7, fontFamily: 'Inter, sans-serif' }}>
                  <p style={{ fontWeight: 700, textAlign: 'center', textTransform: 'uppercase', marginBottom: '20px', color: '#1E3A8A' }}>
                    {selectedDoc.nombre.replace('.pdf', '').replace('.docx', '')}
                  </p>

                  <p style={{ marginBottom: '14px' }}>
                    En la secuela procesal del expediente <strong>{selectedDoc.expediente}</strong>, promovido por <strong>{selectedDoc.autor}</strong>, comparecen los interesados a efecto de dar cumplimiento a lo prevenido por el Código de Procedimientos Civiles Vigente.
                  </p>

                  <p style={{ marginBottom: '14px' }}>
                    <strong>CONSIDERANDO PRIMERO (VALIDEZ Y FE PÚBLICA):</strong> Que las partes reconocen la autenticidad del escrito presentado con fecha <strong>{selectedDoc.fecha}</strong> y la eficacia de la Firma Electrónica Avanzada conforme al artículo 4to de la Ley de Firma Digital.
                  </p>

                  <p style={{ marginBottom: '14px' }}>
                    <strong>RESUELVE ÚNICO:</strong> Téngase por autorizado y radicado formalmente el presente instrumento en el libro de gobierno judicial correspondiente a la versión <strong>{selectedDoc.version}</strong>.
                  </p>

                  {/* Stamp / Signature watermark preview */}
                  <div style={{
                    marginTop: '40px',
                    padding: '16px',
                    border: '2px dashed #1E3A8A',
                    borderRadius: '8px',
                    backgroundColor: '#F0F9FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1E3A8A' }}>SELLO Y FIRMA ELECTRÓNICA JUDICIAL</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#047857' }}>✓ FIRMADO DIGITALMENTE POR JUEZ TITULAR</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748B' }}>CADENA ORIGINAL SHA-256: e8f9a0c1d2e3f4b5a6c7d8e9f0</div>
                    </div>
                    <div style={{ width: '60px', height: '60px', border: '2px solid #1E3A8A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800, color: '#1E3A8A', textAlign: 'center' }}>
                      SELLO DE JUZGADO
                    </div>
                  </div>
                </div>

                <div style={{ position: 'absolute', bottom: '20px', left: '48px', right: '48px', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94A3B8', borderTop: '1px solid #E2E8F0', paddingTop: '10px' }}>
                  <span>DocHub Legal · Instrumento Judicial Oficial</span>
                  <span>Página {currentPage} de {totalPages}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Multifunction Panel */}
          <div style={{
            width: '380px',
            backgroundColor: 'var(--bg-surface)',
            borderLeft: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Panel Tabs */}
            <div style={{
              display: 'flex',
              borderBottom: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-app)',
              overflowX: 'auto'
            }}>
              {[
                { id: 'info', label: 'Info', icon: Info },
                { id: 'history', label: 'Historial', icon: History },
                { id: 'versions', label: 'Versiones', icon: GitBranch },
                { id: 'comments', label: 'Observaciones', icon: MessageSquare },
                { id: 'permissions', label: 'Permisos', icon: Shield },
              ].map(t => {
                const Icon = t.icon;
                const isActive = rightTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setRightTab(t.id)}
                    style={{
                      flex: 1,
                      padding: '12px 8px',
                      border: 'none',
                      borderBottom: `2px solid ${isActive ? 'var(--accent)' : 'transparent'}`,
                      backgroundColor: isActive ? 'var(--bg-surface)' : 'transparent',
                      color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                      fontSize: '0.78rem',
                      fontWeight: isActive ? 700 : 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    <Icon size={14} />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Panel Tab Content */}
            <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
              {rightTab === 'info' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Categoría Legal</span>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>{selectedDoc.categoria}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Abogado Promovente</span>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>{selectedDoc.autor}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Fecha de Radicación</span>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>{selectedDoc.fecha}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Estado Procesal</span>
                    <div style={{ marginTop: '4px' }}>
                      <span className={`badge ${selectedDoc.estado === 'Aprobado' || selectedDoc.estado === 'Finalizado' ? 'badge-success' : 'badge-warning'}`}>
                        {selectedDoc.estado}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Etiquetas Legal</span>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                      {selectedDoc.etiquetas?.map((tag, idx) => (
                        <span key={idx} className="badge badge-purple">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {rightTab === 'history' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {selectedDoc.historial?.map((item, idx) => (
                    <div key={idx} style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-app)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span className="badge badge-info">{item.version}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.fecha}</span>
                      </div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>{item.autor}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{item.cambios}</div>
                    </div>
                  ))}
                </div>
              )}

              {rightTab === 'versions' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Compara la versión judicial actual con anteriores:</p>
                  {selectedDoc.historial?.map((v, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{v.version}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{v.fecha}</div>
                      </div>
                      <button
                        className="btn btn-outline"
                        style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                        onClick={() => {
                          setCompareDocs({ doc: selectedDoc, v1: selectedDoc.version, v2: v.version });
                        }}
                      >
                        Comparar
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {rightTab === 'comments' && (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                    {comments.map(c => (
                      <div key={c.id} style={{ padding: '10px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700 }}>
                          <span>{c.autor}</span>
                          <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>{c.fecha}</span>
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{c.texto}</div>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Escribir observación legal..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      style={{ fontSize: '0.8rem' }}
                    />
                    <button type="submit" className="btn btn-primary" style={{ padding: '8px 12px' }}>
                      <Send size={14} />
                    </button>
                  </form>
                </div>
              )}

              {rightTab === 'permissions' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>Acceso al Expediente Judicial</div>
                  {[
                    { role: 'Juez / Titular', access: 'Firma e-Firma, Autorización, Borrado' },
                    { role: 'Notario Público', access: 'Fe Pública, Protocolización' },
                    { role: 'Abogado Litigante', access: 'Carga de Promociones, Observaciones' },
                    { role: 'Consulta Pública', access: 'Solo Lectura de Acuerdos' },
                  ].map((p, idx) => (
                    <div key={idx} style={{ padding: '10px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>{p.role}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{p.access}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
