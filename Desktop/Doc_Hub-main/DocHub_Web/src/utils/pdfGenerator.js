import { jsPDF } from 'jspdf';

/**
 * Generates a real, valid binary PDF document for a judicial file copy
 */
export function downloadDocumentPDF(doc) {
  if (!doc) return;

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = pdf.internal.pageSize.getWidth();

  // Colors
  const darkNavy = '#0F2A4A';
  const accentBlue = '#2F6FED';
  const textDark = '#1E293B';
  const textMuted = '#64748B';

  // Title Header
  pdf.setFillColor(15, 42, 74);
  pdf.rect(0, 0, pageWidth, 28, 'F');

  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.text('PODER JUDICIAL DEL ESTADO · TRIBUNAL SUPERIOR', pageWidth / 2, 12, { align: 'center' });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.text('JUZGADO TERCERO DE LO FAMILIAR · REGISTRO JUDICIAL DE EXPEDIENTES', pageWidth / 2, 19, { align: 'center' });

  // Document Title & Metadata Box
  pdf.setTextColor(15, 42, 74);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(13);
  pdf.text(doc.nombre || 'Expediente Judicial', 20, 40);

  pdf.setDrawColor(226, 232, 240);
  pdf.setFillColor(248, 250, 252);
  pdf.roundedRect(20, 46, pageWidth - 40, 32, 3, 3, 'FD');

  pdf.setFontSize(9);
  pdf.setTextColor(30, 41, 59);

  pdf.setFont('helvetica', 'bold');
  pdf.text('Folio / Expediente:', 25, 54);
  pdf.setFont('helvetica', 'normal');
  pdf.text(String(doc.expediente || doc.id), 60, 54);

  pdf.setFont('helvetica', 'bold');
  pdf.text('Abogado Promovente:', 25, 62);
  pdf.setFont('helvetica', 'normal');
  pdf.text(String(doc.autor || 'Lic. Mario Torres'), 60, 62);

  pdf.setFont('helvetica', 'bold');
  pdf.text('Materia / Categoría:', 25, 70);
  pdf.setFont('helvetica', 'normal');
  pdf.text(String(doc.categoria || 'Judicial'), 60, 70);

  pdf.setFont('helvetica', 'bold');
  pdf.text('Fecha Radicación:', 115, 54);
  pdf.setFont('helvetica', 'normal');
  pdf.text(String(doc.fecha || ''), 150, 54);

  pdf.setFont('helvetica', 'bold');
  pdf.text('Estado Procesal:', 115, 62);
  pdf.setFont('helvetica', 'normal');
  pdf.text(String(doc.estado || 'Aprobado'), 150, 62);

  pdf.setFont('helvetica', 'bold');
  pdf.text('Versión Registrada:', 115, 70);
  pdf.setFont('helvetica', 'normal');
  pdf.text(String(doc.version || 'v1.0'), 150, 70);

  // Body Text - Legal Content
  let y = 90;
  pdf.setTextColor(30, 41, 59);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.text('RESUMEN DE AUTO Y RESOLUCIÓN JUDICIAL:', 20, y);

  y += 8;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9.5);

  const paragraph1 = `En la secuela procesal del expediente ${doc.expediente || doc.id}, promovido por ${doc.autor || 'el interesado'}, comparecen las partes a efecto de dar cumplimiento a lo prevenido por el Código de Procedimientos Civiles Vigente.`;
  const splitP1 = pdf.splitTextToSize(paragraph1, pageWidth - 40);
  pdf.text(splitP1, 20, y);
  y += splitP1.length * 6 + 4;

  const paragraph2 = `CONSIDERANDO PRIMERO (VALIDEZ Y FE PÚBLICA): Que las partes reconocen la autenticidad del escrito presentado con fecha ${doc.fecha || '2026-05-30'} y la eficacia de la Firma Electrónica Avanzada conforme a la Ley de Firma Digital.`;
  const splitP2 = pdf.splitTextToSize(paragraph2, pageWidth - 40);
  pdf.text(splitP2, 20, y);
  y += splitP2.length * 6 + 4;

  const paragraph3 = `RESUELVE ÚNICO: Téngase por autorizado y radicado formalmente el presente instrumento en el libro de gobierno judicial correspondiente a la versión ${doc.version || 'v1.0'}.`;
  const splitP3 = pdf.splitTextToSize(paragraph3, pageWidth - 40);
  pdf.text(splitP3, 20, y);
  y += splitP3.length * 6 + 12;

  // Stamp & Security Signature Box
  pdf.setDrawColor(47, 111, 237);
  pdf.setFillColor(240, 249, 255);
  pdf.roundedRect(20, y, pageWidth - 40, 30, 3, 3, 'FD');

  pdf.setTextColor(47, 111, 237);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.text('SELLO Y CERTIFICACIÓN DE FIRMA DIGITAL ELECTRÓNICA (FIEL)', 25, y + 8);

  pdf.setTextColor(4, 120, 87);
  pdf.setFontSize(8.5);
  pdf.text('✓ FIRMADO Y REVISADO POR JUEZ TITULAR EN CONSOLA DOCHUB', 25, y + 15);

  pdf.setTextColor(100, 116, 139);
  pdf.setFont('courier', 'normal');
  pdf.setFontSize(7.5);
  pdf.text('HASH SHA-256: e8f9a0c1d2e3f4b5a6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9', 25, y + 23);

  // Footer
  pdf.setDrawColor(226, 232, 240);
  pdf.line(20, 280, pageWidth - 20, 280);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(148, 163, 184);
  pdf.text('DocHub Legal · Documento Certificado Oficial', 20, 286);
  pdf.text('Página 1 de 1', pageWidth - 20, 286, { align: 'right' });

  // Save binary PDF directly
  const filename = (doc.nombre || 'Expediente_Judicial').replace(/\.(docx|txt|html)$/i, '') + '.pdf';
  pdf.save(filename);
}

/**
 * Generates a real, valid binary PDF document for the Judicial Reports summary
 */
export function downloadReportPDF(documentsList, startDate, endDate, categoryFilter) {
  if (!documentsList || documentsList.length === 0) return;

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = pdf.internal.pageSize.getWidth();

  // Header Banner
  pdf.setFillColor(15, 42, 74);
  pdf.rect(0, 0, pageWidth, 24, 'F');

  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(13);
  pdf.text('DOCHUB LEGAL · REPORTE OFICIAL DE EXPEDIENTES Y PROCESOS JUDICIALES', pageWidth / 2, 11, { align: 'center' });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.text('SEGUIMIENTO DE AUDITORÍA Y ESTADO DE CAUSAS PROCESALES', pageWidth / 2, 18, { align: 'center' });

  // Metadata Box
  pdf.setFillColor(244, 246, 249);
  pdf.rect(14, 28, pageWidth - 28, 14, 'F');

  pdf.setTextColor(30, 41, 59);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8.5);

  pdf.text(`Rango de Fechas: ${startDate} al ${endDate}`, 18, 36);
  pdf.text(`Materia: ${categoryFilter}`, 105, 36);
  pdf.text(`Total Expedientes: ${documentsList.length}`, 190, 36);
  pdf.text(`Fecha Emisión: ${new Date().toLocaleDateString('es-MX')}`, 250, 36);

  // Table Header
  let y = 48;
  pdf.setFillColor(15, 42, 74);
  pdf.rect(14, y, pageWidth - 28, 8, 'F');

  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);

  pdf.text('ID FOLIO', 18, y + 5.5);
  pdf.text('NOMBRE DEL ESCRITO / DOCUMENTO', 55, y + 5.5);
  pdf.text('PROMOVENTE', 150, y + 5.5);
  pdf.text('MATERIA', 195, y + 5.5);
  pdf.text('FECHA', 245, y + 5.5);
  pdf.text('ESTADO PROCESAL', 270, y + 5.5);

  y += 8;

  // Table Rows
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);

  documentsList.forEach((doc, idx) => {
    if (y > 185) {
      pdf.addPage();
      y = 20;

      // Repeat Table Header
      pdf.setFillColor(15, 42, 74);
      pdf.rect(14, y, pageWidth - 28, 8, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.text('ID FOLIO', 18, y + 5.5);
      pdf.text('NOMBRE DEL ESCRITO / DOCUMENTO', 55, y + 5.5);
      pdf.text('PROMOVENTE', 150, y + 5.5);
      pdf.text('MATERIA', 195, y + 5.5);
      pdf.text('FECHA', 245, y + 5.5);
      pdf.text('ESTADO PROCESAL', 270, y + 5.5);
      y += 8;
      pdf.setFont('helvetica', 'normal');
    }

    // Row Background
    if (idx % 2 === 0) {
      pdf.setFillColor(248, 250, 252);
      pdf.rect(14, y, pageWidth - 28, 7.5, 'F');
    }

    pdf.setTextColor(30, 41, 59);
    pdf.text(String(doc.id || ''), 18, y + 5);

    const truncatedName = (doc.nombre || '').length > 48 ? (doc.nombre || '').slice(0, 45) + '...' : (doc.nombre || '');
    pdf.text(truncatedName, 55, y + 5);

    const truncatedAutor = (doc.autor || '').length > 22 ? (doc.autor || '').slice(0, 20) + '...' : (doc.autor || '');
    pdf.text(truncatedAutor, 150, y + 5);

    pdf.text(String(doc.categoria || ''), 195, y + 5);
    pdf.text(String(doc.fecha || ''), 245, y + 5);

    if (doc.estado === 'Aprobado' || doc.estado === 'Finalizado') {
      pdf.setTextColor(4, 120, 87);
    } else {
      pdf.setTextColor(217, 138, 17);
    }
    pdf.text(String(doc.estado || ''), 270, y + 5);

    y += 7.5;
  });

  // Footer
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  pdf.setTextColor(148, 163, 184);
  pdf.text('DocHub Legal · Reporte Judicial Generado Oficialmente', 14, 200);

  // Save binary PDF directly
  pdf.save(`Reporte_Expedientes_Judiciales_${startDate}_al_${endDate}.pdf`);
}
