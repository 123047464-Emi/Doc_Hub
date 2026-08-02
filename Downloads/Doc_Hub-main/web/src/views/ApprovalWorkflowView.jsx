// src/views/ApprovalWorkflowView.jsx
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { WORKFLOW_STAGES } from '../data/mockData';
import {
  FilePlus,
  Eye,
  CheckCircle,
  PenTool,
  ShieldCheck,
  ChevronRight,
  User,
  Calendar,
  MessageSquare,
  GitFork,
  ArrowUpRight,
  Save,
  Clock,
  RotateCcw,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function ApprovalWorkflowView() {
  const { documents, updateDocumentStatus, showToast, user } = useApp();
  const [selectedDocId, setSelectedDocId] = useState(documents[0]?.id || '');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [targetStageId, setTargetStageId] = useState('');

  const doc = documents.find(d => d.id === selectedDocId) || documents[0];

  // Helper to calculate progress percentage (0 - 100%) for a document based on workflowStage or estado
  const getDocProgress = (documentItem) => {
    if (!documentItem) return 20;
    const stageStr = (documentItem.workflowStage || documentItem.estado || '').toLowerCase();
    
    if (stageStr.includes('finalizado') || stageStr.includes('sentencia') || stageStr.includes('ejecutoriado')) {
      return 100;
    } else if (stageStr.includes('firma') || stageStr.includes('notarial')) {
      return 80;
    } else if (stageStr.includes('aprobado') || stageStr.includes('autorizado')) {
      return 60;
    } else if (stageStr.includes('revisión') || stageStr.includes('revision')) {
      return 40;
    }
    return 20;
  };

  const getProgressColor = (pct) => {
    if (pct >= 100) return 'var(--success)';
    if (pct >= 80) return 'var(--purple)';
    if (pct >= 60) return 'var(--accent)';
    if (pct >= 40) return 'var(--warning)';
    return 'var(--text-muted)';
  };

  const getStageIcon = (id) => {
    switch (id) {
      case 'creado': return FilePlus;
      case 'en_revision': return Eye;
      case 'aprobado': return CheckCircle;
      case 'firma_digital': return PenTool;
      case 'finalizado': return ShieldCheck;
      default: return CheckCircle;
    }
  };

  const currentStageIndex = doc ? Math.max(0, WORKFLOW_STAGES.findIndex(s => {
    const sLabel = s.label.toLowerCase();
    const docStage = (doc.workflowStage || doc.estado || '').toLowerCase();
    return docStage.includes(s.id) || docStage.includes(sLabel) || sLabel.includes(docStage);
  })) : 0;

  const currentPct = getDocProgress(doc);

  const handleSaveProcess = () => {
    if (!doc) return;

    let nextStageObj = WORKFLOW_STAGES[Math.min(WORKFLOW_STAGES.length - 1, currentStageIndex + 1)];
    if (targetStageId) {
      const found = WORKFLOW_STAGES.find(s => s.id === targetStageId);
      if (found) nextStageObj = found;
    }

    const notesText = approvalNotes.trim() 
      ? approvalNotes 
      : `Avance a la etapa "${nextStageObj.label}" autorizado por ${user.name}`;

    updateDocumentStatus(doc.id, nextStageObj.label, nextStageObj.label, notesText);
    setApprovalNotes('');
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <GitFork color="var(--accent)" size={26} />
            Flujo de Aprobación Documental (Workflow Engine)
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Supervisión, avance de etapas, barras de progreso por expediente y guardado de trazabilidad notarial.
          </p>
        </div>
      </div>

      {/* MASTER SECTION 1: MASTER TABLE WITH PROGRESS BAR PER DOCUMENT */}
      <div className="card-glass" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Monitoreo Global de Progreso por Documento</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Avance en tiempo real de todos los expedientes en flujo</p>
          </div>
          <span className="badge badge-info">{documents.length} Expedientes en Seguimiento</span>
        </div>

        {/* Master Workflow Progress Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.05em' }}>
                <th style={{ padding: '12px 16px' }}>Expediente / Nombre</th>
                <th style={{ padding: '12px 16px' }}>Materia</th>
                <th style={{ padding: '12px 16px' }}>Etapa Actual</th>
                <th style={{ padding: '12px 16px', width: '220px' }}>Barra de Progreso (%)</th>
                <th style={{ padding: '12px 16px' }}>Responsable</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((d) => {
                const pct = getDocProgress(d);
                const barColor = getProgressColor(pct);
                const isSelected = doc?.id === d.id;

                return (
                  <tr
                    key={d.id}
                    onClick={() => setSelectedDocId(d.id)}
                    style={{
                      borderBottom: '1px solid var(--divider-color)',
                      backgroundColor: isSelected ? 'var(--primary-light)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{d.nombre}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{d.expediente}</div>
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <span className="badge badge-purple">{d.categoria}</span>
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <span className={`badge ${pct >= 100 ? 'badge-success' : pct >= 60 ? 'badge-info' : 'badge-warning'}`}>
                        {d.workflowStage || d.estado}
                      </span>
                    </td>

                    {/* Barra de Progreso por Documento */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ flex: 1, height: '8px', backgroundColor: 'var(--bg-app)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                          <div style={{ width: `${pct}%`, height: '100%', backgroundColor: barColor, borderRadius: '4px', transition: 'width 0.4s ease' }} />
                        </div>
                        <span style={{ fontSize: '0.78rem', fontWeight: 800, color: barColor, width: '38px', textAlign: 'right' }}>
                          {pct}%
                        </span>
                      </div>
                    </td>

                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                      {d.autor}
                    </td>

                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button
                        className="btn btn-outline"
                        style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDocId(d.id);
                        }}
                      >
                        Ver Registro <ArrowUpRight size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MASTER SECTION 2: DETAILED WORKFLOW TRACKER & PERSISTENT SAVE CONTROL */}
      {doc && (
        <div className="card-glass" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Header Banner & Large Dynamic Progress Bar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                  Expediente Activo: {doc.nombre}
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {doc.expediente} · Autor: {doc.autor} · Categoría: {doc.categoria}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    PROGRESO GENERAL DEL EXPEDIENTE
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: getProgressColor(currentPct) }}>
                    {currentPct}% Completado
                  </div>
                </div>
              </div>
            </div>

            {/* Large Animated Progress Bar for Selected Document */}
            <div>
              <div style={{ height: '12px', backgroundColor: 'var(--bg-app)', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                <div style={{
                  width: `${currentPct}%`,
                  height: '100%',
                  backgroundColor: getProgressColor(currentPct),
                  borderRadius: '6px',
                  transition: 'width 0.5s ease',
                  boxShadow: '0 0 10px rgba(47,111,237,0.3)'
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px', fontWeight: 600 }}>
                <span>1. Creado (20%)</span>
                <span>2. Revisión Legal (40%)</span>
                <span>3. Autorizado por Juez (60%)</span>
                <span>4. Firma Notarial (80%)</span>
                <span>5. Ejecutoriado (100%)</span>
              </div>
            </div>
          </div>

          {/* Step-by-Step Horizontal Workflow Tracker */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', margin: '10px 0' }}>
            {WORKFLOW_STAGES.map((stage, idx) => {
              const Icon = getStageIcon(stage.id);
              const isCompleted = idx <= currentStageIndex;
              const isCurrent = idx === currentStageIndex;

              return (
                <React.Fragment key={stage.id}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
                    <div style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: '50%',
                      backgroundColor: isCompleted ? (isCurrent ? 'var(--accent)' : 'var(--success)') : 'var(--bg-app)',
                      border: `3px solid ${isCompleted ? (isCurrent ? 'var(--accent)' : 'var(--success)') : 'var(--border-color)'}`,
                      color: isCompleted ? '#FFFFFF' : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: isCurrent ? '0 0 16px rgba(47,111,237,0.4)' : 'none',
                      transition: 'all 0.3s ease'
                    }}>
                      <Icon size={24} />
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: isCurrent ? 800 : 600, color: isCurrent ? 'var(--accent)' : 'var(--text-primary)', marginTop: '10px' }}>
                      {stage.label}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {isCompleted ? (isCurrent ? 'Etapa Actual' : 'Completado') : 'Pendiente'}
                    </span>
                  </div>

                  {idx < WORKFLOW_STAGES.length - 1 && (
                    <div style={{
                      flex: 1,
                      height: '4px',
                      backgroundColor: idx < currentStageIndex ? 'var(--success)' : 'var(--border-color)',
                      margin: '0 12px',
                      marginBottom: '28px',
                      transition: 'background 0.3s ease'
                    }} />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Form to Save Process and Add Notes */}
          <div className="card-glass" style={{ padding: '20px', backgroundColor: 'var(--bg-app)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Save size={18} color="var(--accent)" /> Guardar y Avanzar Proceso del Expediente
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  Seleccionar Etapa Destino:
                </label>
                <select
                  className="input-field"
                  value={targetStageId}
                  onChange={(e) => setTargetStageId(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', fontSize: '0.85rem' }}
                >
                  <option value="">Avanzar a la Siguiente Etapa Automática</option>
                  {WORKFLOW_STAGES.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  Comentario u Observación Judicial de Aprobación:
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ej: Se autoriza tras revisar anexos y convenios de pensión alimenticia..."
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                className="btn btn-primary"
                onClick={handleSaveProcess}
                style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Save size={16} /> Guardar Proceso en API & Base de Datos
              </button>
            </div>
          </div>

          {/* Workflow History / Traceability Log */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} color="var(--purple)" /> Historial de Cambios y Aprobaciones Guardadas ({doc.historial?.length || 0})
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(doc.historial || []).map((h, i) => (
                <div
                  key={i}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-app)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '16px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--success-bg)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '2px' }}>
                      <CheckCircle2 size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {h.cambios}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Autor: {h.autor} · Versión: {h.version} · Estado: {h.estado}
                      </div>
                    </div>
                  </div>

                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {h.fecha}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
