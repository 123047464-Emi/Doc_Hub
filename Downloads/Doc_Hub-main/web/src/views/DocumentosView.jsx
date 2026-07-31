// src/views/DocumentosView.jsx
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  FileText,
  Search,
  Filter,
  Eye,
  Edit,
  Download,
  Trash2,
  History,
  Star,
  Plus,
  Upload
} from 'lucide-react';

export default function DocumentosView() {
  const {
    documents,
    setSelectedDoc,
    setCompareDocs,
    toggleFavorite,
    deleteDocument,
    setIsUploadOpen,
    showToast
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('Todos');
  const [filterCategoria, setFilterCategoria] = useState('Todas');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const categories = ['Todas', 'Juicio Civil / Familiar', 'Amparo y Constitucional', 'Convenio Notarial', 'Contrato Mercantil', 'Dictamen Pericial'];
  const statuses = ['Todos', 'Pendiente firma', 'Aprobado', 'En revisión', 'Finalizado'];

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.autor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.expediente.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstado = filterEstado === 'Todos' || doc.estado === filterEstado;
    const matchesCat = filterCategoria === 'Todas' || doc.categoria === filterCategoria;
    const matchesFav = !showFavoritesOnly || doc.favorito;
    return matchesSearch && matchesEstado && matchesCat && matchesFav;
  });

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
      {/* Header and Controls Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Gestión de Expedientes y Documentos Legales</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Radica, examina, firma y administra los juicios y convenios notariales.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setIsUploadOpen(true)}>
          <Upload size={16} /> Radicar documento
        </button>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="card-glass" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        {/* Search input */}
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="input-field"
            placeholder="Buscar por expediente, abogado o juicio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '36px', fontSize: '0.85rem' }}
          />
        </div>

        {/* Dropdown Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={15} color="var(--text-muted)" />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Estado:</span>
            <select
              className="input-field"
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              style={{ width: 'auto', padding: '6px 12px', fontSize: '0.8rem' }}
            >
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Materia / Categoría:</span>
            <select
              className="input-field"
              value={filterCategoria}
              onChange={(e) => setFilterCategoria(e.target.value)}
              style={{ width: 'auto', padding: '6px 12px', fontSize: '0.8rem' }}
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <button
            className={`btn ${showFavoritesOnly ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
          >
            <Star size={14} fill={showFavoritesOnly ? 'white' : 'none'} /> Destacados
          </button>
        </div>
      </div>

      {/* Main Documents Table */}
      <div className="card-glass" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.05em' }}>
                <th style={{ padding: '14px 20px', width: '40px' }}>Fav</th>
                <th style={{ padding: '14px 20px' }}>Nombre del escrito / Documento</th>
                <th style={{ padding: '14px 20px' }}>Abogado Promovente</th>
                <th style={{ padding: '14px 20px' }}>Materia</th>
                <th style={{ padding: '14px 20px' }}>Fecha Radicación</th>
                <th style={{ padding: '14px 20px' }}>Estado Procesal</th>
                <th style={{ padding: '14px 20px' }}>Versión</th>
                <th style={{ padding: '14px 20px', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No se encontraron expedientes con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => (
                  <tr
                    key={doc.id}
                    style={{ borderBottom: '1px solid var(--divider-color)', transition: 'background 0.15s ease' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {/* Star Favorite */}
                    <td style={{ padding: '14px 20px' }}>
                      <button
                        onClick={() => toggleFavorite(doc.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: doc.favorito ? '#F59E0B' : 'var(--text-muted)' }}
                      >
                        <Star size={16} fill={doc.favorito ? '#F59E0B' : 'none'} />
                      </button>
                    </td>

                    {/* Doc Title & File Size */}
                    <td style={{ padding: '14px 20px' }}>
                      <div
                        onClick={() => setSelectedDoc(doc)}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                      >
                        <div style={{ backgroundColor: 'var(--info-bg)', color: 'var(--accent)', padding: '6px', borderRadius: '8px', display: 'flex' }}>
                          <FileText size={18} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{doc.nombre}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{doc.expediente} · {doc.tamano}</div>
                        </div>
                      </div>
                    </td>

                    {/* Autor */}
                    <td style={{ padding: '14px 20px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                      {doc.autor}
                    </td>

                    {/* Categoría */}
                    <td style={{ padding: '14px 20px' }}>
                      <span className="badge badge-purple">{doc.categoria}</span>
                    </td>

                    {/* Fecha */}
                    <td style={{ padding: '14px 20px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {doc.fecha}
                    </td>

                    {/* Estado Badge */}
                    <td style={{ padding: '14px 20px' }}>
                      <span className={`badge ${
                        doc.estado === 'Aprobado' || doc.estado === 'Finalizado' ? 'badge-success' :
                        doc.estado === 'Pendiente firma' || doc.estado === 'En revisión' ? 'badge-warning' : 'badge-info'
                      }`}>
                        {doc.estado}
                      </span>
                    </td>

                    {/* Versión */}
                    <td style={{ padding: '14px 20px' }}>
                      <span className="badge badge-info">{doc.version}</span>
                    </td>

                    {/* Action Buttons Row */}
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                        <button
                          onClick={() => setSelectedDoc(doc)}
                          title="Ver Expediente"
                          style={{ padding: '6px', background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', borderRadius: '4px' }}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => {
                            showToast(`Modo edición activado para ${doc.nombre}`, 'info');
                            setSelectedDoc(doc);
                          }}
                          title="Editar escrito"
                          style={{ padding: '6px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', borderRadius: '4px' }}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => showToast(`Descargando ${doc.nombre}...`, 'info')}
                          title="Descargar copia certificada"
                          style={{ padding: '6px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', borderRadius: '4px' }}
                        >
                          <Download size={16} />
                        </button>
                        <button
                          onClick={() => setCompareDocs({ doc, v1: doc.version, v2: 'v1.0' })}
                          title="Historial y Comparativa"
                          style={{ padding: '6px', background: 'none', border: 'none', color: 'var(--purple)', cursor: 'pointer', borderRadius: '4px' }}
                        >
                          <History size={16} />
                        </button>
                        <button
                          onClick={() => deleteDocument(doc.id)}
                          title="Eliminar"
                          style={{ padding: '6px', background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', borderRadius: '4px' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Action Button (FAB) for Drag & Drop Upload */}
      <button
        onClick={() => setIsUploadOpen(true)}
        title="Radicar nuevo expediente (Drag & Drop)"
        style={{
          position: 'fixed',
          bottom: '32px',
          right: '32px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'var(--accent)',
          color: 'white',
          border: 'none',
          boxShadow: '0 8px 24px rgba(47,111,237,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 80,
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <Plus size={24} />
      </button>
    </div>
  );
}
