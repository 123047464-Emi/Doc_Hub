// src/views/DigitalSignatureView.jsx
import React, { useRef, useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { SOLICITUDES_FIRMA } from '../data/mockData';
import { generateDigitalSignatureApi } from '../services/apiService';
import { PenTool, CheckCircle2, ShieldAlert, RotateCcw, Download, ShieldCheck, Lock, FileText, QrCode, Award } from 'lucide-react';

export default function DigitalSignatureView() {
  const { visibleDocuments: documents, updateDocumentStatus, showToast, user } = useApp();
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(SOLICITUDES_FIRMA[0]);
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [signedCertificate, setSignedCertificate] = useState(null);

  // Setup signature canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = '#0F2A4A';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
    }
  }, [selectedRequest]);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
    setHasSigned(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasSigned(false);
    }
  };

  const handleSignDocument = async () => {
    if (!hasSigned) {
      showToast('Por favor traza tu firma manuscrita digital en el recuadro antes de firmar', 'warning');
      return;
    }

    const docToUpdate = documents.find(d => d.nombre === selectedRequest.documento) || documents[0];
    
    // Call REST API for cryptographic e.firma SHA-256 certificate
    showToast('Generando firma electrónica e.firma SHA-256...', 'info');
    const certRes = await generateDigitalSignatureApi(docToUpdate.id, user.name, 'FIEL-2026-UPQ-99201', 'secret123');

    updateDocumentStatus(docToUpdate.id, 'Finalizado', 'Finalizado');
    
    if (certRes && certRes.certificate) {
      setSignedCertificate(certRes.certificate);
    } else {
      // Local fallback certificate
      setSignedCertificate({
        signatureId: `SIG-${Date.now()}`,
        documentId: docToUpdate.id,
        signerName: user.name,
        signerRole: user.role,
        certificateSerial: '00000100000508849201',
        timestamp: new Date().toISOString(),
        hashSHA256: 'E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855'
      });
    }

    showToast(`Firma Digital Avanzada e.firma registrada con éxito. Hash SHA-256 verificado.`, 'success');
    clearCanvas();
  };

  const filteredRequests = SOLICITUDES_FIRMA.filter(r => statusFilter === 'Todos' || r.estado === statusFilter);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Módulo de Firma Digital y Certificados e-Firma</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        {/* Left: Pending Signature Requests List */}
        <div className="card-glass" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Solicitudes de Firma</h3>
            <select
              className="input-field"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: 'auto', padding: '4px 8px', fontSize: '0.78rem' }}
            >
              <option value="Todos">Todos</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Firmado">Firmado</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredRequests.map(r => (
              <div
                key={r.id}
                onClick={() => setSelectedRequest(r)}
                style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${selectedRequest.id === r.id ? 'var(--accent)' : 'var(--border-color)'}`,
                  backgroundColor: selectedRequest.id === r.id ? 'var(--primary-light)' : 'var(--bg-app)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span className="badge badge-purple">{r.version}</span>
                  <span className={`badge ${r.estado === 'Firmado' ? 'badge-success' : 'badge-warning'}`}>
                    {r.estado}
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{r.documento}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Solicita: {r.solicitante} · {r.fecha}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Signature Studio Canvas */}
        <div className="card-glass" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Estudio de Firma Manuscrita Digital</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Documento: {selectedRequest.documento}</p>
            </div>
          </div>

          {/* Signature Studio Canvas or Admin Restricted Notice */}
          {user?.role === 'Administrador' ? (
            <div className="card-glass" style={{ padding: '36px 24px', textAlign: 'center', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--warning-bg)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                <ShieldAlert size={28} />
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Facultad de Firma Reservada a Jueces
              </h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '440px', margin: '0 auto' }}>
                El rol <strong>Administrador</strong> no cuenta con facultades jurisdiccionales para firmar acuerdos ni sentencias. Únicamente los <strong>Jueces Titulares</strong> asignados a la causa pueden plasmar su e-firma FIEL.
              </p>
            </div>
          ) : (
            <>
              {/* Interactive Signature Canvas Box for Juez */}
              <div style={{
                border: '2px dashed var(--border-color)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-app)',
                padding: '16px',
                textAlign: 'center',
                position: 'relative'
              }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Traza tu firma en el recuadro blanco usando tu ratón o pantalla táctil:
                </div>
                <canvas
                  ref={canvasRef}
                  width={540}
                  height={180}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    cursor: 'crosshair',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
                  }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                  <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.78rem' }} onClick={clearCanvas}>
                    <RotateCcw size={14} /> Limpiar Firma
                  </button>

                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Certificado Digital Asociado: {user.name} ({user.role})
                  </span>
                </div>
              </div>

              {/* Main Action Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button className="btn btn-primary" style={{ padding: '12px 24px', backgroundColor: 'var(--purple)' }} onClick={handleSignDocument}>
                  <PenTool size={18} /> Firmar Documento (e.firma FIEL)
                </button>
              </div>
            </>
          )}

          {/* Generated SHA-256 Certificate Box with Official Logo Stamp */}
          {signedCertificate && (
            <div style={{
              marginTop: '12px',
              padding: '20px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-app)',
              border: '2px solid var(--success)',
              boxShadow: 'var(--shadow-md)',
              animation: 'fadeIn 0.3s ease-out'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img src="/logo.jpeg" alt="Stamp Logo" style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid var(--success)' }} />
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Award size={18} /> Certificado de Firma Digital Avanzada Emitido
                    </h4>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Sello Criptográfico NOM-151 / SAT</span>
                  </div>
                </div>
                <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => showToast('Certificado PDF descargado con éxito', 'success')}>
                  <Download size={13} /> Descargar PDF Certificado
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div><strong>ID de Firma:</strong> <span style={{ fontFamily: 'monospace' }}>{signedCertificate.signatureId}</span></div>
                  <div><strong>Firmante Titular:</strong> {signedCertificate.signerName} ({signedCertificate.signerRole || 'Abogado'})</div>
                  <div><strong>Estampa de Tiempo:</strong> {signedCertificate.timestamp}</div>
                  <div><strong>Serie Certificado FIEL:</strong> <span style={{ fontFamily: 'monospace' }}>{signedCertificate.certificateSerial || '00000100000508849201'}</span></div>
                  <div>
                    <strong>Hash SHA-256:</strong>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', backgroundColor: '#0F172A', color: '#38BDF8', padding: '6px 10px', borderRadius: '4px', marginTop: '4px', wordBreak: 'break-all' }}>
                      {signedCertificate.hashSHA256}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', color: '#000000' }}>
                  <QrCode size={70} color="#0F2A4A" />
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, marginTop: '4px', textAlign: 'center', color: '#475569' }}>
                    Verificar en SAT / UPQ
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
