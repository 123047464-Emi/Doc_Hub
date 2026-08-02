import { API_BASE_URL, API_KEY } from '../config/apiConfig';

let sessionToken = null;

export function setSessionToken(token) {
  sessionToken = token;
}

export function clearSessionToken() {
  sessionToken = null;
}

export async function logout() {
  try {
    if (sessionToken) {
      await request('/auth/logout', { method: 'POST' });
    }
  } catch {
    // El cierre local debe funcionar aunque el token haya expirado o no haya red.
  } finally {
    clearSessionToken();
  }
}

export function getApiFileUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_BASE_URL}${path}`;
}

export function getDocumentoOpenUrl(documento) {
  if (!documento?.abrirUrl || !sessionToken) return null;
  const url = getApiFileUrl(documento.abrirUrl);
  const separator = url.includes('?') ? '&' : '?';
  const cacheKey = documento.version || documento.actualizadoEn || Date.now();
  return `${url}${separator}token=${encodeURIComponent(sessionToken)}&apiKey=${encodeURIComponent(API_KEY)}&v=${encodeURIComponent(cacheKey)}`;
}

let onUnauthorizedHandler = null;

export function setOnUnauthorized(handler) {
  onUnauthorizedHandler = handler;
}

async function request(path, options = {}) {
  const headers = {
    'x-api-key': API_KEY,
    ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : await response.text();

  if (response.status === 401 && sessionToken && path !== '/auth/login') {
    clearSessionToken();
    if (onUnauthorizedHandler) {
      onUnauthorizedHandler();
    }
  }

  if (!response.ok) {
    throw new Error(payload?.message || `Error HTTP ${response.status}`);
  }

  return payload;
}

export async function login(username, password) {
  const payload = await request('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  setSessionToken(payload.token);

  return {
    token: payload.token,
    id: String(payload.usuario.id),
    username: payload.usuario.username,
    role: (payload.usuario.categoria || 'Juez').toLowerCase(),
    name: payload.usuario.nombre || payload.usuario.username,
    cargo: payload.usuario.cargo || payload.usuario.categoria,
    permissions: payload.usuario.permisos?.ui || {},
    actions: payload.usuario.permisos?.actions || [],
  };
}

export function getMe() {
  return request('/auth/me');
}

export function listDemoUsers() {
  return request('/auth/demo-users');
}

export function updateProfile(data) {
  return request('/usuarios/me', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export function changePassword(passwordActual, passwordNueva) {
  return request('/usuarios/me/password', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ passwordActual, passwordNueva }),
  });
}
export function listUsuarios() {
  return request('/usuarios');
}

export function getDashboard() {
  return request('/dashboard');
}

export function listExpedientes() {
  return request('/expedientes');
}

export function getExpediente(id) {
  return request(`/expedientes/${id}`);
}

export function createExpediente(data) {
  return request('/expedientes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export function updateExpediente(id, data) {
  return request(`/expedientes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export function updateExpedienteEstado(id, estado, motivo) {
  return request(`/expedientes/${id}/estado`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ estado, motivo }),
  });
}

export function deleteExpediente(id, motivo) {
  return request(`/expedientes/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ motivo }),
  });
}

export function listParticipantes(expedienteId) {
  return request(`/expedientes/${expedienteId}/participantes`);
}

export function createParticipante(expedienteId, data) {
  return request(`/expedientes/${expedienteId}/participantes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export function updateParticipante(expedienteId, participanteId, data) {
  return request(`/expedientes/${expedienteId}/participantes/${participanteId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export function deleteParticipante(expedienteId, participanteId) {
  return request(`/expedientes/${expedienteId}/participantes/${participanteId}`, {
    method: 'DELETE',
  });
}

export function listExpedienteTrazabilidad(id) {
  return request(`/expedientes/${id}/trazabilidad`);
}
export function listDocumentos(expedienteId) {
  const query = expedienteId ? `?expedienteId=${encodeURIComponent(expedienteId)}` : '';
  return request(`/documentos${query}`);
}

export function updateDocumentoEstado(id, estado, motivo) {
  return request(`/documentos/${id}/estado`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ estado, motivo }),
  });
}

export function getDocumento(id) {
  return request(`/documentos/${id}`);
}

export function updateDocumento(id, data) {
  return request(`/documentos/${id}`, {
    method: 'PUT',
    body: buildDocumentoFormData(data),
  });
}

export function uploadDocumento({ expedienteId, nombre, archivo }) {
  return request('/documentos', {
    method: 'POST',
    body: buildDocumentoFormData({ expedienteId, nombre, archivo }),
  });
}

export function listDocumentoVersiones(id) {
  return request(`/documentos/${id}/versiones`);
}

export function listDocumentoTrazabilidad(id) {
  return request(`/documentos/${id}/trazabilidad`);
}

export function restaurarDocumentoVersion(id, versionId, motivo) {
  return request(`/documentos/${id}/restaurar/${versionId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ motivo }),
  });
}

export function listSolicitudesFirma() {
  return request('/firmas/solicitudes');
}

export function createSolicitudFirma({ documento, documentoId, expedienteId, version, firmanteCategoria, firmanteUsuarioId }) {
  return request('/firmas/solicitudes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ documento, documentoId, expedienteId, version, firmanteCategoria, firmanteUsuarioId }),
  });
}

export function firmarSolicitud(id, { firmaTipo, firmaValor, firmaArchivo }) {
  const formData = new FormData();
  formData.append('firmaTipo', firmaTipo);
  if (firmaValor) formData.append('firmaValor', firmaValor);

  if (firmaArchivo) {
    if (firmaArchivo.file) {
      formData.append('firmaArchivo', firmaArchivo.file, firmaArchivo.name);
    } else {
      formData.append('firmaArchivo', {
        uri: firmaArchivo.uri,
        name: firmaArchivo.name,
        type: firmaArchivo.mimeType || inferMimeType(firmaArchivo.name),
      });
    }
  }

  return request(`/firmas/solicitudes/${id}/firmar`, {
    method: 'POST',
    body: formData,
  });
}

export function rechazarSolicitudFirma(id, motivo) {
  return request(`/firmas/solicitudes/${id}/rechazar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ motivo }),
  });
}

export function listNotificaciones() {
  return request('/notificaciones');
}

export function getNotificacionesContador() {
  return request('/notificaciones/contador');
}

export function markNotificacionLeida(id) {
  return request(`/notificaciones/${id}/leida`, {
    method: 'PATCH',
  });
}
function buildDocumentoFormData({ expedienteId, nombre, archivo }) {
  const formData = new FormData();

  if (expedienteId) formData.append('expedienteId', expedienteId);
  if (nombre) formData.append('nombre', nombre);

  if (archivo) {
    if (archivo.file) {
      formData.append('archivo', archivo.file, archivo.name);
    } else {
      formData.append('archivo', {
        uri: archivo.uri,
        name: archivo.name,
        type: archivo.mimeType || inferMimeType(archivo.name),
      });
    }
  }

  return formData;
}

function inferMimeType(name = '') {
  const lower = name.toLowerCase();
  if (lower.endsWith('.pdf')) return 'application/pdf';
  if (lower.endsWith('.doc')) return 'application/msword';
  if (lower.endsWith('.docx')) {
    return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  }
  return 'application/octet-stream';
}















