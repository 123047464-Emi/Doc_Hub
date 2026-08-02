// src/services/apiService.js - API Client for DocHub REST API
const BASE_URL = '/api';

export async function fetchHealth() {
  try {
    const res = await fetch(`${BASE_URL}/health`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    return { status: 'offline', error: err.message };
  }
}

export async function fetchDocuments(params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/documents?${query}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('API unavailable, falling back to local state:', err);
    return null;
  }
}

export async function createDocumentApi(docData) {
  try {
    const res = await fetch(`${BASE_URL}/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(docData)
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('API error, saving locally:', err);
    return null;
  }
}

export async function updateDocumentApi(docId, updateData) {
  try {
    const res = await fetch(`${BASE_URL}/documents/${docId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('API error updating document:', err);
    return null;
  }
}

export async function deleteDocumentApi(docId) {
  try {
    const res = await fetch(`${BASE_URL}/documents/${docId}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('API error deleting document:', err);
    return null;
  }
}

export async function runOcrExtractionApi(text, docType, enableMasking = true) {
  try {
    const res = await fetch(`${BASE_URL}/ocr/extract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentText: text, documentType: docType, enableMasking })
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('API error running OCR:', err);
    return null;
  }
}

export async function generateDigitalSignatureApi(docId, signerName, serialNumber, passphrase) {
  try {
    const res = await fetch(`${BASE_URL}/signatures/sign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId: docId, signerName, serialNumber, passphrase })
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('API error signing document:', err);
    return null;
  }
}

export async function fetchAuditLogsApi() {
  try {
    const res = await fetch(`${BASE_URL}/audit-logs`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function fetchMobileSyncStatusApi() {
  try {
    const res = await fetch(`${BASE_URL}/mobile/sync`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function fetchProfilesApi() {
  try {
    const res = await fetch(`${BASE_URL}/profiles`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function loginApi(username, password) {
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function createProfileApi(profileData) {
  try {
    const res = await fetch(`${BASE_URL}/profiles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData)
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    return null;
  }
}
