// src/views/DashboardView.jsx
import React from 'react';
import { useApp } from '../context/AppContext';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  PenTool,
  Users,
  TrendingUp,
  ArrowUpRight,
  Activity,
  Upload,
  Smartphone
} from 'lucide-react';

export default function DashboardView() {
  const { visibleDocuments: documents, user, setSelectedDoc, setIsUploadOpen, setActiveTab, auditLogs } = useApp();

  // DYNAMIC REAL-TIME KPI CALCULATIONS
  const totalDocs = documents.length;
  const pendientes = documents.filter(d => d.estado === 'En revisión' || d.estado === 'Pendiente firma').length;
  const aprobados = documents.filter(d => d.estado === 'Aprobado' || d.estado === 'Finalizado').length;
  const rechazados = documents.filter(d => d.estado === 'Rechazado').length;
  const pendientesFirma = documents.filter(d => d.estado === 'Pendiente firma').length;
  const usuariosActivos = 18;

  // DYNAMIC MONTHLY BAR CHART COMPUTATION FROM REAL DOCUMENTS WITH PERCENTAGES
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
  const monthlyData = monthNames.map(m => {
    // Count documents matching month
    const createdInMonth = documents.filter(d => {
      if (!d.fecha) return false;
      const monthNum = parseInt(d.fecha.split('-')[1], 10);
      const mIdx = monthNames.indexOf(m);
      return monthNum === (mIdx + 1);
    });

    const aprobadosInMonth = createdInMonth.filter(d => d.estado === 'Aprobado' || d.estado === 'Finalizado').length;
    const creadosCount = Math.max(createdInMonth.length, 1);
    const aprobadosPct = Math.round((aprobadosInMonth / creadosCount) * 100);

    return {
      mes: m,
      creados: creadosCount,
      aprobados: aprobadosInMonth,
      pctAprobados: aprobadosPct,
      pctCreados: Math.min(Math.round((creadosCount / (totalDocs || 1)) * 100), 100)
    };
  });

  // Calculate max count for scale
  const maxCount = Math.max(...monthlyData.map(d => Math.max(d.creados, d.aprobados)), 5);

  // DYNAMIC STATUS BREAKDOWN
  const aprobadosPct = totalDocs > 0 ? Math.round((aprobados / totalDocs) * 100) : 0;
  const pendientesPct = totalDocs > 0 ? Math.round((pendientes / totalDocs) * 100) : 0;
  const rechazadosPct = totalDocs > 0 ? Math.round((rechazados / totalDocs) * 100) : 0;

  const kpis = [
    { title: 'Total Documentos', value: totalDocs, icon: FileText, color: '#2F6FED', bg: 'var(--info-bg)', trend: `${totalDocs} expedientes` },
    { title: 'Pendientes Revisión', value: pendientes, icon: Clock, color: '#D98A11', bg: 'var(--warning-bg)', trend: `${pendientesPct}% del total` },
    { title: 'Aprobados / Sentencia', value: aprobados, icon: CheckCircle2, color: '#1FA971', bg: 'var(--success-bg)', trend: `${aprobadosPct}% efectivos` },
    { title: 'Rechazados', value: rechazados, icon: XCircle, color: '#E5484D', bg: 'var(--danger-bg)', trend: `${rechazadosPct}% en revisión` },
    { title: 'Pendientes de Firma', value: pendientesFirma, icon: PenTool, color: '#7C5CFC', bg: 'var(--purple-bg)', trend: `${pendientesFirma} por firmar` },
    { title: 'Abogados Activos', value: usuariosActivos, icon: Users, color: '#1E4B8F', bg: 'var(--primary-light)', trend: '100% en línea' },
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'var(--bg-surface)',
        padding: '24px 28px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Panel de Control Legal</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {user?.role === 'Juez' ? `Supervisión de expedientes asignados a: ${user.name}` : 'Consola del Administrador · Supervisión Global del Sistema'}
          </p>
        </div>
        {user?.role === 'Juez' && (
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-primary" onClick={() => setIsUploadOpen(true)}>
              <Upload size={16} /> Subir documento
            </button>
          </div>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '18px'
      }}>
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="card-glass"
              style={{
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{kpi.title}</span>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: kpi.bg, color: kpi.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={20} />
                </div>
              </div>
              <div style={{ marginTop: '16px' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                  {kpi.value}
                </div>
                <div style={{ fontSize: '0.75rem', color: kpi.color, fontWeight: 600, marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <TrendingUp size={12} /> {kpi.trend}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Real Charts Section with PERCENTAGES */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Real Document Activity Bar Chart with Percentage Labels */}
        <div className="card-glass" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Rendimiento por Mes (% Porcentajes)</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Porcentaje de expedientes autorizados sobre creados</p>
            </div>
            <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent)' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent)' }} /> Creados
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success)' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success)' }} /> Aprobados (%)
              </span>
            </div>
          </div>

          {/* SVG Bar Chart Visual with Explicit Percentage Labels Above Each Bar */}
          <div style={{ height: '230px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px', padding: '10px 0' }}>
            {monthlyData.map((item, idx) => (
              <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: '6px' }}>
                
                {/* Percentage Tag Above Bars */}
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--success)', backgroundColor: 'var(--success-bg)', padding: '2px 6px', borderRadius: '6px' }}>
                  {item.pctAprobados}%
                </div>

                <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end', height: '150px', width: '100%', justifyContent: 'center' }}>
                  <div style={{
                    width: '18px',
                    height: `${(item.creados / maxCount) * 100}%`,
                    backgroundColor: 'var(--accent)',
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 0.4s ease'
                  }} title={`Creados: ${item.creados}`} />
                  <div style={{
                    width: '18px',
                    height: `${(item.aprobados / maxCount) * 100}%`,
                    backgroundColor: 'var(--success)',
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 0.4s ease'
                  }} title={`Aprobados: ${item.aprobados} (${item.pctAprobados}%)`} />
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{item.mes}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Real Document Status Breakdown Donut/Distribution with Percentages */}
        <div className="card-glass" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Distribución por Estado (%)</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Porcentaje exacto de expedientes</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', margin: '20px 0' }}>
            {[
              { label: 'Aprobados / Sentencia', count: aprobados, pct: aprobadosPct, color: 'var(--success)' },
              { label: 'En revisión & Firma', count: pendientes, pct: pendientesPct, color: 'var(--warning)' },
              { label: 'Rechazados / Ajustes', count: rechazados, pct: rechazadosPct, color: 'var(--danger)' },
            ].map((st, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>
                  <span>{st.label} ({st.count})</span>
                  <span style={{ color: st.color }}>{st.pct}%</span>
                </div>
                <div style={{ height: '10px', backgroundColor: 'var(--bg-app)', borderRadius: '5px', overflow: 'hidden' }}>
                  <div style={{ width: `${st.pct}%`, height: '100%', backgroundColor: st.color, borderRadius: '5px', transition: 'width 0.4s ease' }} />
                </div>
              </div>
            ))}
          </div>

          <button className="btn btn-outline" style={{ width: '100%', fontSize: '0.8rem' }} onClick={() => setActiveTab('reportes')}>
            Ver Reportes Detallados <ArrowUpRight size={14} />
          </button>
        </div>
      </div>

      {/* Real Audit Activity Stream & Quick Document Access */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Real Recent Activity Timeline from auditLogs */}
        <div className="card-glass" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Actividad Reciente</h3>
            <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => setActiveTab('auditoria')}>
              Ver Trazabilidad ({auditLogs.length})
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {auditLogs.slice(0, 4).map((log) => (
              <div key={log.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--divider-color)' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--info-bg)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '2px' }}>
                  <Activity size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{log.usuario}: {log.accion}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>{log.fecha} · IP: {log.ip}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Documents Preview */}
        <div className="card-glass" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Documentos Destacados</h3>
            <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => setActiveTab('documentos')}>
              Ver todos ({documents.length})
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {documents.slice(0, 3).map(doc => (
              <div
                key={doc.id}
                onClick={() => setSelectedDoc(doc)}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-app)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                  <FileText size={18} color="var(--primary)" />
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {doc.nombre}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {doc.categoria} · {doc.version}
                    </div>
                  </div>
                </div>
                <span className={`badge ${doc.estado === 'Aprobado' || doc.estado === 'Finalizado' ? 'badge-success' : 'badge-warning'}`}>
                  {doc.estado}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>


    </div>
  );
}
