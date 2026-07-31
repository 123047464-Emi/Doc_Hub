// src/components/document/UploadModal.jsx
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { createDocumentApi } from '../../services/apiService';
import { UploadCloud, X, FileText, CheckCircle2 } from 'lucide-react';

export default function UploadModal() {
  const { isUploadOpen, setIsUploadOpen, addDocument, user } = useApp();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [categoria, setCategoria] = useState('Juicio Civil / Familiar');
  const [etiquetasStr, setEtiquetasStr] = useState('Litigio, Urgente, Familiar');

  if (!isUploadOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fileName = selectedFile ? selectedFile.name : 'Promocion_Escrito_Judicial.pdf';
    const newDoc = {
      id: `EXP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      nombre: fileName,
      autor: user.name,
      categoria: categoria,
      fecha: new Date().toISOString().split('T')[0],
      estado: 'Pendiente firma',
      version: 'v1.0',
      tamano: selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB` : '2.4 MB',
      paginas: 5,
      expediente: `Juzgado 3° · Exp #${Math.floor(Math.random() * 899 + 100)}/2026`,
      favorito: false,
      etiquetas: etiquetasStr.split(',').map(s => s.trim()).filter(Boolean),
      workflowStage: 'En revisión legal',
      responsable: user.name,
      historial: [
        {
          version: 'v1.0',
          autor: user.name,
          fecha: new Date().toISOString().replace('T', ' ').slice(0, 16),
          cambios: 'Radicación inicial del expediente mediante Drag & Drop',
          estado: 'En revisión legal'
        }
      ]
    };

    // Call REST API
    await createDocumentApi(newDoc);

    addDocument(newDoc);
    setIsUploadOpen(false);
    setSelectedFile(null);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(10, 20, 40, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 250
    }}>
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        width: '540px',
        maxWidth: '92%',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border-color)',
        overflow: 'hidden',
        animation: 'fadeIn 0.25s ease-out'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Subir Documento Legal</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Carga de escrituras, demandas y promociones con trazabilidad</p>
          </div>
          <button onClick={() => setIsUploadOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {/* Drag and Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            style={{
              border: `2px dashed ${dragActive ? 'var(--accent)' : 'var(--border-color)'}`,
              borderRadius: 'var(--radius-md)',
              padding: '32px 20px',
              textAlign: 'center',
              backgroundColor: dragActive ? 'var(--primary-light)' : 'var(--bg-app)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              marginBottom: '20px'
            }}
          >
            <input
              type="file"
              id="file-upload-input"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
              accept=".pdf,.doc,.docx,.jpg,.png"
            />
            <label htmlFor="file-upload-input" style={{ cursor: 'pointer' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--info-bg)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
                <UploadCloud size={24} />
              </div>
              {selectedFile ? (
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <CheckCircle2 size={18} /> {selectedFile.name}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · Haz clic para cambiar de archivo
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Arrastra el archivo PDF o escrito aquí
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Soporta PDF, DOCX, JPG hasta 50MB
                  </div>
                </div>
              )}
            </label>
          </div>

          {/* Form Fields */}
          <div style={{ marginBottom: '16px' }}>
            <label className="input-label" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Categoría Legal
            </label>
            <select
              className="input-field"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            >
              <option value="Juicio Civil / Familiar">Juicio Civil / Familiar</option>
              <option value="Amparo y Constitucional">Amparo y Constitucional</option>
              <option value="Convenio Notarial">Convenio Notarial</option>
              <option value="Contrato Mercantil">Contrato Mercantil</option>
              <option value="Dictamen Pericial">Dictamen Pericial</option>
            </select>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label className="input-label" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Etiquetas Judiciales (separadas por comas)
            </label>
            <input
              type="text"
              className="input-field"
              value={etiquetasStr}
              onChange={(e) => setEtiquetasStr(e.target.value)}
              placeholder="Ej: Litigio, Urgente, Familiar"
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsUploadOpen(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              <UploadCloud size={16} /> Radicar Expediente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
