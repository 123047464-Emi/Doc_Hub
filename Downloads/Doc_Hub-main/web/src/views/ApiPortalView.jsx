// src/views/ApiPortalView.jsx
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { fetchHealth, fetchDocuments, runOcrExtractionApi, generateDigitalSignatureApi, fetchMobileSyncStatusApi, fetchProfilesApi, loginApi } from '../services/apiService';
import {
  Code2,
  Terminal,
  Play,
  Copy,
  CheckCircle2,
  Server,
  Key,
  Smartphone,
  Globe,
  RefreshCw
} from 'lucide-react';

export default function ApiPortalView() {
  const { showToast } = useApp();
  const [selectedEndpoint, setSelectedEndpoint] = useState('GET /api/profiles');
  const [apiResponse, setApiResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [serverHealth, setServerHealth] = useState(null);
  const [apiKey, setApiKey] = useState('dh_live_8849201948172649102');

  const checkHealth = async () => {
    const health = await fetchHealth();
    setServerHealth(health);
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const endpoints = [
    { method: 'GET', path: '/api/health', name: 'Servidor & Diagnóstico (Health)', desc: 'Verifica el estado del servidor API REST y capacidades del sistema.' },
    { method: 'GET', path: '/api/profiles', name: 'Perfiles Unificados Web-Móvil', desc: 'Obtiene la lista de perfiles compartidos 1-a-1 entre la Web y la App Móvil.' },
    { method: 'POST', path: '/api/auth/login', name: 'Autenticación Unificada (Login)', desc: 'Valida credenciales de acceso para clientes Web y móviles.' },
    { method: 'GET', path: '/api/documents', name: 'Listar Expedientes (Documents)', desc: 'Obtiene todos los expedientes con filtros de búsqueda, estado y categoría.' },
    { method: 'POST', path: '/api/documents', name: 'Radicar Expediente (Create Doc)', desc: 'Registra un nuevo documento o escrito en la base de datos central.' },
    { method: 'POST', path: '/api/ocr/extract', name: 'Extracción OCR & LFPDPPP', desc: 'Analiza texto escaneado y aplica enmascaramiento automático de datos sensibles.' },
    { method: 'POST', path: '/api/signatures/sign', name: 'Firma Electrónica FIEL SHA-256', desc: 'Genera estampado criptográfico SHA-256 con validez jurídica NOM-151.' },
    { method: 'GET', path: '/api/mobile/sync', name: 'Gateway Móvil (Mobile Sync)', desc: 'Estado de sincronización en tiempo real con la aplicación móvil.' }
  ];

  const handleExecuteApi = async () => {
    setIsLoading(true);
    setApiResponse(null);
    showToast(`Ejecutando ${selectedEndpoint}...`, 'info');

    let responseData = null;
    const startTime = performance.now();

    try {
      if (selectedEndpoint.includes('/api/health')) {
        responseData = await fetchHealth();
      } else if (selectedEndpoint.includes('/api/profiles')) {
        responseData = await fetchProfilesApi();
      } else if (selectedEndpoint.includes('/api/auth/login')) {
        responseData = await loginApi('juez1', '1234');
      } else if (selectedEndpoint.includes('GET /api/documents')) {
        responseData = await fetchDocuments();
      } else if (selectedEndpoint.includes('POST /api/documents')) {
        responseData = {
          success: true,
          message: 'Expediente radicado vía API',
          data: {
            id: 'DOC-2026-999',
            expediente: 'EXP-2026-API-88',
            nombre: 'Escrito de Demanda vía API',
            autor: 'Lic. Fernando Reyes',
            estado: 'En revisión'
          }
        };
      } else if (selectedEndpoint.includes('/api/ocr/extract')) {
        responseData = await runOcrExtractionApi('CURP TEST123456HDFRR00', 'Sentencia', true);
      } else if (selectedEndpoint.includes('/api/signatures/sign')) {
        responseData = await generateDigitalSignatureApi('DOC-2026-001', 'Lic. Fernando Reyes', 'FIEL-2026-UPQ', 'pass123');
      } else if (selectedEndpoint.includes('/api/mobile/sync')) {
        responseData = await fetchMobileSyncStatusApi();
      }

      const endTime = performance.now();
      const latencyMs = Math.round(endTime - startTime);

      setApiResponse({
        status: 200,
        statusText: 'OK',
        latencyMs,
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'x-powered-by': 'DocHub UPQ Express API Server',
          'access-control-allow-origin': '*'
        },
        data: responseData || { status: 'mocked_ok', note: 'Servidor local respondiendo correctamente' }
      });
      showToast('Petición API ejecutada con éxito (HTTP 200 OK)', 'success');
    } catch (err) {
      setApiResponse({
        status: 500,
        statusText: 'Internal Server Error',
        latencyMs: 12,
        data: { error: err.message }
      });
      showToast('Error al ejecutar petición API', 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  const getCurlSnippet = () => {
    const current = endpoints.find(e => `${e.method} ${e.path}` === selectedEndpoint) || endpoints[0];
    if (current.method === 'GET') {
      return `curl -X GET "http://localhost:3001${current.path}" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Accept: application/json"`;
    } else {
      return `curl -X POST "http://localhost:3001${current.path}" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"documentId": "DOC-2026-001", "signerName": "Lic. Fernando Reyes"}'`;
    }
  };

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    showToast('Código cURL copiado al portapapeles', 'success');
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Code2 color="var(--accent)" size={26} />
            Portal REST API & Integración para Desarrolladores
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Documentación interactiva y servidor de pruebas REST para la integración con la app móvil y sistemas de terceros.
          </p>
        </div>

        {/* Server status pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn btn-outline" onClick={checkHealth} style={{ padding: '8px 12px', fontSize: '0.8rem' }}>
            <RefreshCw size={14} /> Verificar Servidor
          </button>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '20px',
            backgroundColor: serverHealth?.status === 'online' ? 'var(--success-bg)' : 'var(--warning-bg)',
            color: serverHealth?.status === 'online' ? 'var(--success)' : 'var(--warning)',
            fontWeight: 700,
            fontSize: '0.85rem'
          }}>
            <Server size={16} />
            API Server: {serverHealth?.status === 'online' ? 'ONLINE (Port 3001)' : 'STANDALONE (Proxy Mode)'}
          </div>
        </div>
      </div>

      {/* API Key Management Box */}
      <div className="card-glass" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'var(--purple-bg)', color: 'var(--purple)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Key size={22} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Llave de Autenticación de API (Bearer Token)</h4>
            <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {apiKey}
            </div>
          </div>
        </div>

        <button
          className="btn btn-outline"
          onClick={() => {
            const newK = 'dh_live_' + Math.random().toString(36).substring(2, 18);
            setApiKey(newK);
            showToast('Nueva API Key regenerada', 'success');
          }}
          style={{ fontSize: '0.8rem' }}
        >
          Regenerar Token
        </button>
      </div>

      {/* Interactive Explorer Container */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '24px' }}>
        {/* Endpoints Selection List */}
        <div className="card-glass" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe size={18} color="var(--accent)" /> Catálogo de Endpoints REST
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
            {endpoints.map((ep) => {
              const fullKey = `${ep.method} ${ep.path}`;
              const isSelected = selectedEndpoint === fullKey;
              return (
                <div
                  key={fullKey}
                  onClick={() => setSelectedEndpoint(fullKey)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: isSelected ? '2px solid var(--accent)' : '1px solid var(--border-color)',
                    backgroundColor: isSelected ? 'var(--info-bg)' : 'var(--bg-app)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className={`badge ${ep.method === 'GET' ? 'badge-info' : 'badge-purple'}`} style={{ fontWeight: 800 }}>
                        {ep.method}
                      </span>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                        {ep.path}
                      </span>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                    {ep.desc}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Runner & Response Output Console */}
        <div className="card-glass" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Terminal size={18} color="var(--success)" /> Consola Ejecutora de API
            </h3>

            <button className="btn btn-primary" onClick={handleExecuteApi} disabled={isLoading}>
              <Play size={15} fill="white" />
              {isLoading ? 'Ejecutando...' : 'Enviar Petición (Send)'}
            </button>
          </div>

          {/* cURL Snippet Box */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>COMANDO cURL DE PRUEBA:</span>
              <button
                onClick={() => copyText(getCurlSnippet())}
                style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Copy size={13} /> Copiar cURL
              </button>
            </div>
            <div style={{ backgroundColor: '#1E293B', color: '#38BDF8', padding: '14px', borderRadius: 'var(--radius-md)', fontFamily: 'monospace', fontSize: '0.8rem', lineHeight: 1.5, overflowX: 'auto' }}>
              {getCurlSnippet()}
            </div>
          </div>

          {/* Response Output Screen */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>RESPUESTA HTTP DEL SERVIDOR:</span>
              {apiResponse && (
                <div style={{ display: 'flex', gap: '12px', fontSize: '0.78rem', fontWeight: 700 }}>
                  <span style={{ color: 'var(--success)' }}>HTTP {apiResponse.status} {apiResponse.statusText}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{apiResponse.latencyMs} ms</span>
                </div>
              )}
            </div>

            <div style={{
              flex: 1,
              minHeight: '220px',
              backgroundColor: '#0F172A',
              color: '#F8FAFC',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              fontFamily: 'monospace',
              fontSize: '0.83rem',
              lineHeight: 1.5,
              overflowY: 'auto',
              border: '1px solid #334155'
            }}>
              {isLoading ? (
                <div style={{ color: '#94A3B8' }}>Conectando con http://localhost:3001...</div>
              ) : apiResponse ? (
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                  {JSON.stringify(apiResponse.data, null, 2)}
                </pre>
              ) : (
                <div style={{ color: '#64748B', fontStyle: 'italic' }}>
                  Presiona "Enviar Petición (Send)" para ejecutar la llamada a la API en tiempo real.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
