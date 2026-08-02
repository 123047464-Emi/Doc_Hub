// src/services/apiService.js - API Client for DocHub REST API (Connected to DocHub_Api on Port 3000)
const BASE_URL = '/api';
const API_KEY = '123456apikey';

let authToken = typeof localStorage !== 'undefined' ? localStorage.getItem('dochub_jwt_token') : null;

export function setAuthToken(token) {
  authToken = token;
  if (typeof localStorage !== 'undefined') {
    if (token) {
      localStorage.setItem('dochub_jwt_token', token);
    } else {
      localStorage.removeItem('dochub_jwt_token');
    }
  }
}

export function getAuthToken() {
  return authToken;
}

function getHeaders(customHeaders = {}) {
  const headers = {
    'x-api-key': API_KEY,
    ...customHeaders,
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  return headers;
}

export async function fetchHealth() {
  try {
    const res = await fetch(`${BASE_URL}/health`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    return { status: 'offline', error: err.message };
  }
}

export async function loginApi(username, password) {
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || `HTTP error ${res.status}`);
    }
    const data = await res.json();
    if (data?.token) {
      setAuthToken(data.token);
    }
    return data;
  } catch (err) {
    console.warn('API Login error:', err.message);
    return null;
  }
}

export async function fetchMeApi() {
  try {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function fetchDemoUsersApi() {
  try {
    const res = await fetch(`${BASE_URL}/auth/demo-users`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function fetchDocuments(params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${BASE_URL}/documentos?${query}` : `${BASE_URL}/documentos`;
    const res = await fetch(url, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('API unavailable for documents:', err.message);
    return null;
  }
}

export async function createDocumentApi(docData) {
  try {
    let res;
    if (docData instanceof FormData) {
      res = await fetch(`${BASE_URL}/documentos`, {
        method: 'POST',
        headers: getHeaders(), // browser sets boundary for FormData
        body: docData
      });
    } else {
      res = await fetch(`${BASE_URL}/documentos`, {
        method: 'POST',
        headers: getHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(docData)
      });
    }
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('API error creating document:', err.message);
    return null;
  }
}

export async function updateDocumentApi(docId, updateData) {
  try {
    const res = await fetch(`${BASE_URL}/documentos/${docId}`, {
      method: 'PUT',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(updateData)
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('API error updating document:', err.message);
    return null;
  }
}

export async function deleteDocumentApi(docId, motivo = '') {
  try {
    const res = await fetch(`${BASE_URL}/documentos/${docId}`, {
      method: 'DELETE',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ motivo })
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('API error deleting document:', err.message);
    return null;
  }
}

export async function fetchExpedientesApi() {
  try {
    const res = await fetch(`${BASE_URL}/expedientes`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('API error fetching expedientes:', err.message);
    return null;
  }
}

export async function fetchDashboardApi() {
  try {
    const res = await fetch(`${BASE_URL}/dashboard`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('API error fetching dashboard:', err.message);
    return null;
  }
}

export async function fetchUsuariosApi() {
  try {
    const res = await fetch(`${BASE_URL}/usuarios`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('API error fetching usuarios:', err.message);
    return null;
  }
}

export async function fetchNotificacionesApi() {
  try {
    const res = await fetch(`${BASE_URL}/notificaciones`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('API error fetching notificaciones:', err.message);
    return null;
  }
}

export async function fetchFirmasApi() {
  try {
    const res = await fetch(`${BASE_URL}/firmas`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('API error fetching firmas:', err.message);
    return null;
  }
}

// Client-side helper functions for legacy views (OCR, Digital Signatures mock)
export async function runOcrExtractionApi(text, docType, enableMasking = true) {
  return {
    success: true,
    maskedText: text,
    fieldsExtracted: { tipo: docType, procesadoEn: new Date().toISOString() }
  };
}

export async function generateDigitalSignatureApi(docId, signerName, serialNumber, passphrase) {
  return {
    success: true,
    hash: 'sha256-' + Math.random().toString(36).substring(2),
    timestamp: new Date().toISOString(),
    signer: signerName
  };
}

export async function fetchAuditLogsApi() {
  return null;
}

export async function fetchMobileSyncStatusApi() {
  return { status: 'online', mode: 'DocHub_Api SQLite Sync', port: 3000 };
}

export async function fetchProfilesApi() {
  return fetchUsuariosApi();
}

async function ensureAuthToken(forceRefresh = false) {
  if (!authToken || forceRefresh) {
    await loginApi('admin', '1234');
  }
  return authToken;
}

export async function createProfileApi(profileData) {
  try {
    await ensureAuthToken();
    let res = await fetch(`${BASE_URL}/usuarios`, {
      method: 'POST',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        username: profileData.username,
        password: profileData.password || '1234',
        categoria: profileData.role || profileData.categoria || 'Abogado',
        nombre: profileData.name || profileData.nombre,
        cargo: profileData.cargo
      })
    });

    if (res.status === 401) {
      await ensureAuthToken(true);
      res = await fetch(`${BASE_URL}/usuarios`, {
        method: 'POST',
        headers: getHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          username: profileData.username,
          password: profileData.password || '1234',
          categoria: profileData.role || profileData.categoria || 'Abogado',
          nombre: profileData.name || profileData.nombre,
          cargo: profileData.cargo
        })
      });
    }

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      let errMsg = `HTTP ${res.status}`;
      try {
        const errJson = JSON.parse(errText);
        if (errJson.message) errMsg = errJson.message;
      } catch (e) {}
      throw new Error(errMsg);
    }
    return await res.json();
  } catch (err) {
    console.error('API error creating user in DocHub_Api:', err.message);
    throw err;
  }
}

export async function deleteProfileApi(userIdOrUsername) {
  try {
    await ensureAuthToken();
    let res = await fetch(`${BASE_URL}/usuarios/${encodeURIComponent(userIdOrUsername)}`, {
      method: 'DELETE',
      headers: getHeaders()
    });

    if (res.status === 401) {
      await ensureAuthToken(true);
      res = await fetch(`${BASE_URL}/usuarios/${encodeURIComponent(userIdOrUsername)}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
    }

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('API error deleting user from DocHub_Api:', err.message);
    return null;
  }
}

export async function updateUserProfileApi(userIdOrUsername, updateData) {
  try {
    await ensureAuthToken();
    let res = await fetch(`${BASE_URL}/usuarios/${encodeURIComponent(userIdOrUsername)}`, {
      method: 'PUT',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        nombre: updateData.name || updateData.nombre,
        categoria: updateData.role || updateData.categoria,
        cargo: updateData.cargo
      })
    });

    if (res.status === 401) {
      await ensureAuthToken(true);
      res = await fetch(`${BASE_URL}/usuarios/${encodeURIComponent(userIdOrUsername)}`, {
        method: 'PUT',
        headers: getHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          nombre: updateData.name || updateData.nombre,
          categoria: updateData.role || updateData.categoria,
          cargo: updateData.cargo
        })
      });
    }

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('API error updating user in DocHub_Api:', err.message);
    return null;
  }
}
