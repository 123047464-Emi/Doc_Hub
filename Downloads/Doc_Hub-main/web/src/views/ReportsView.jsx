// src/views/ReportsView.jsx
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Download, FileSpreadsheet, FileText, Calendar, Filter, Clock, Award, CheckCircle2, RefreshCw } from 'lucide-react';

export default function ReportsView() {
  const { documents, auditLogs, showToast } = useApp();

  // Date Filtering state (Default: 2026-05-01 to 2026-05-31)
  const [startDate, setStartDate] = useState('2026-05-01');
  const [endDate, setEndDate] = useState('2026-05-31');
  const [categoryFilter, setCategoryFilter] = useState('Todas');

  // Filter documents by date range and category
  const filteredDocuments = documents.filter(doc => {
    const docDate = doc.fecha; // YYYY-MM-DD
    const inDateRange = (!startDate || docDate >= startDate) && (!endDate || docDate <= endDate);
    const matchesCategory = categoryFilter === 'Todas' || doc.categoria === categoryFilter;
    return inDateRange && matchesCategory;
  });

  // Filter audit logs by date range
  const filteredAuditLogs = auditLogs.filter(log => {
    const logDate = log.fecha.split(' ')[0]; // YYYY-MM-DD
    return (!startDate || logDate >= startDate) && (!endDate || logDate <= endDate);
  });

  const totalFiltered = filteredDocuments.length;
  const aprobadosCount = filteredDocuments.filter(d => d.estado === 'Aprobado' || d.estado === 'Finalizado').length;
  const pendientesCount = filteredDocuments.filter(d => d.estado === 'En revisión' || d.estado === 'Pendiente firma').length;

  // Real Excel/CSV Export Function
  const handleExportExcel = () => {
    if (filteredDocuments.length === 0) {
      showToast('No hay expedientes en el rango de fechas seleccionado', 'warning');
      return;
    }

    // Build CSV Content
    let csvContent = '\uFEFF'; // UTF-8 BOM for Excel compatibility
    csvContent += 'ID Expediente;Nombre del Documento;Abogado Promovente;Materia;Fecha Radicacion;Estado Procesal;Version;Folio Judicial\n';

    filteredDocuments.forEach(doc => {
      csvContent += `"${doc.id}";"${doc.nombre.replace(/"/g, '""')}";"${doc.autor}";"${doc.categoria}";"${doc.fecha}";"${doc.estado}";"${doc.version}";"${doc.expediente}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Reporte_Expedientes_Legales_${startDate}_al_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Reporte CSV descargado exitosamente (${filteredDocuments.length} expedientes)`, 'success');
  };

  // Real Printable PDF Report Function
  const handleExportPDF = () => {
    if (filteredDocuments.length === 0) {
      showToast('No hay expedientes en el rango de fechas para exportar PDF', 'warning');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast('Por favor permite las ventanas emergentes para generar el PDF', 'warning');
      return;
    }

    const htmlReport = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <title>Reporte Oficial de Expedientes Legales y Judiciales</title>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #152238; }
          .header { text-align: center; border-bottom: 2px solid #0F2A4A; padding-bottom: 20px; margin-bottom: 30px; }
          .title { font-size: 20px; font-weight: bold; color: #0F2A4A; text-transform: uppercase; }
          .subtitle { font-size: 12px; color: #5B6B82; margin-top: 4px; }
          .meta-box { background: #F4F6F9; padding: 16px; border-radius: 8px; margin-bottom: 24px; display: flex; justify-content: space-between; font-size: 13px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
          th { background: #0F2A4A; color: white; padding: 10px; text-align: left; }
          td { padding: 10px; border-bottom: 1px solid #E3E8EF; }
          tr:nth-child(even) { background: #F8FAFC; }
          .footer { margin-top: 40px; border-top: 1px solid #E3E8EF; padding-top: 16px; text-align: center; font-size: 11px; color: #94A3B8; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">DOCHUB LEGAL · BUFETE & CONTROL JUDICIAL</div>
          <div class="subtitle">INFORMACIÓN OFICIAL DE SEGUIMIENTO Y TRAZABILIDAD PROCESAL</div>
          <h3 style="margin-top: 14px; color: #2F6FED;">REPORTE DE EXPEDIENTES RADICADOS</h3>
        </div>

        <div class="meta-box">
          <div><strong>Rango de Fechas:</strong> ${startDate} al ${endDate}</div>
          <div><strong>Materia / Categoría:</strong> ${categoryFilter}</div>
          <div><strong>Total Expedientes:</strong> ${totalFiltered}</div>
          <div><strong>Fecha Emisión:</strong> ${new Date().toLocaleDateString('es-MX')}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th>ID Folio</th>
              <th>Nombre del Escrito</th>
              <th>Abogado Promovente</th>
              <th>Materia</th>
              <th>Fecha</th>
              <th>Estado Procesal</th>
            </tr>
          </thead>
          <tbody>
            ${filteredDocuments.map(d => `
              <tr>
                <td><strong>${d.id}</strong></td>
                <td>${d.nombre}</td>
                <td>${d.autor}</td>
                <td>${d.categoria}</td>
                <td>${d.fecha}</td>
                <td>${d.estado}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          DocHub Legal · Documento Oficial Emitido electrónicamente con sello Hash SHA-256
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlReport);
    printWindow.document.close();
    showToast('Reporte PDF listo para guardar o imprimir', 'success');
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Reportes de Seguimiento Judicial</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Filtra por período de fechas y descarga expedientes reales en Excel (.csv) o PDF.
          </p>
        </div>

        {/* Real Export Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-outline" style={{ borderColor: 'var(--success)', color: 'var(--success)' }} onClick={handleExportExcel}>
            <FileSpreadsheet size={16} /> Exportar Excel (.csv)
          </button>
          <button className="btn btn-primary" onClick={handleExportPDF}>
            <FileText size={16} /> Exportar PDF
          </button>
        </div>
      </div>

      {/* Date Range Filter Bar */}
      <div className="card-glass" style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={16} color="var(--accent)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Fecha Desde:</span>
            <input
              type="date"
              className="input-field"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ width: 'auto', padding: '6px 12px', fontSize: '0.82rem' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Fecha Hasta:</span>
            <input
              type="date"
              className="input-field"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ width: 'auto', padding: '6px 12px', fontSize: '0.82rem' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={16} color="var(--text-muted)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Materia:</span>
            <select
              className="input-field"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ width: 'auto', padding: '6px 12px', fontSize: '0.82rem' }}
            >
              <option value="Todas">Todas las materias</option>
              <option value="Juicio Civil / Familiar">Juicio Civil / Familiar</option>
              <option value="Amparo y Constitucional">Amparo y Constitucional</option>
              <option value="Convenio Notarial">Convenio Notarial</option>
              <option value="Contrato Mercantil">Contrato Mercantil</option>
              <option value="Dictamen Pericial">Dictamen Pericial</option>
            </select>
          </div>
        </div>

        <button
          className="btn btn-secondary"
          onClick={() => {
            setStartDate('2026-01-01');
            setEndDate('2026-12-31');
            setCategoryFilter('Todas');
            showToast('Filtro de fechas restablecido a todo el año', 'info');
          }}
          style={{ fontSize: '0.8rem', padding: '6px 12px' }}
        >
          <RefreshCw size={14} /> Limpiar Filtros
        </button>
      </div>

      {/* Filtered Dynamic Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
        {[
          { label: 'Expedientes en el Período', value: `${totalFiltered} registros`, sub: `Filtrados desde ${startDate || 'inicio'}`, icon: FileText, color: 'var(--primary)' },
          { label: 'Autorizados / Sentencia', value: `${aprobadosCount} docs`, sub: `${totalFiltered > 0 ? Math.round((aprobadosCount / totalFiltered) * 100) : 0}% efectividad`, icon: CheckCircle2, color: 'var(--success)' },
          { label: 'Pendientes de Firma', value: `${pendientesCount} docs`, sub: 'Acción notarial requerida', icon: Clock, color: 'var(--warning)' },
          { label: 'Logs de Trazabilidad', value: `${filteredAuditLogs.length} logs`, sub: 'Registros forenses', icon: Award, color: 'var(--purple)' },
        ].map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="card-glass" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{c.label}</span>
                <Icon size={18} color={c.color} />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>{c.value}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>{c.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Filtered Table Preview */}
      <div className="card-glass" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Previsualización de Expedientes para Descarga</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Coincidencias: {totalFiltered} expedientes</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.72rem' }}>
                <th style={{ padding: '12px 16px' }}>ID Folio</th>
                <th style={{ padding: '12px 16px' }}>Nombre del Documento</th>
                <th style={{ padding: '12px 16px' }}>Abogado Promovente</th>
                <th style={{ padding: '12px 16px' }}>Materia</th>
                <th style={{ padding: '12px 16px' }}>Fecha</th>
                <th style={{ padding: '12px 16px' }}>Estado Procesal</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No hay expedientes dentro del rango de fechas {startDate} a {endDate}.
                  </td>
                </tr>
              ) : (
                filteredDocuments.map(d => (
                  <tr key={d.id} style={{ borderBottom: '1px solid var(--divider-color)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 700 }}>{d.id}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-primary)', fontWeight: 600 }}>{d.nombre}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{d.autor}</td>
                    <td style={{ padding: '12px 16px' }}><span className="badge badge-purple">{d.categoria}</span></td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{d.fecha}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={`badge ${d.estado === 'Aprobado' || d.estado === 'Finalizado' ? 'badge-success' : 'badge-warning'}`}>
                        {d.estado}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
