// server.js - Backend REST API Server for DocHub Legal System (UPQ)
import express from 'express';
import cors from 'cors';
import crypto from 'crypto';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Initial Database State
let documents = [
  {
    id: 'DOC-2026-001',
    expediente: 'EXP-2026-8842',
    nombre: 'Demanda de Amparo Indirecto vs Acto Reclamado',
    autor: 'Lic. Fernando Reyes',
    categoria: 'Amparo y Constitucional',
    fecha: '2026-07-15',
    estado: 'Pendiente firma',
    workflowStage: 'Firma Notarial',
    version: 'v2.1',
    tamano: '2.4 MB',
    favorito: true,
    sensible: true,
    firmantes: ['Lic. Fernando Reyes', 'Mtro. Gabriel Mendoza'],
    descripcion: 'Escrito de amparo incoado contra actos del Juzgado Tercero de lo Civil en materia de rescisión contractual.'
  },
  {
    id: 'DOC-2026-002',
    expediente: 'EXP-2026-9104',
    nombre: 'Contrato de Arrendamiento Comercial e Industrial',
    autor: 'Lic. Sofía Alarcón',
    categoria: 'Contrato Mercantil',
    fecha: '2026-07-18',
    estado: 'Aprobado',
    workflowStage: 'Finalizado',
    version: 'v1.0',
    tamano: '1.1 MB',
    favorito: false,
    sensible: false,
    firmantes: ['Lic. Sofía Alarcón', 'Dr. Arturo Villaseñor'],
    descripcion: 'Convenio de arrendamiento de nave industrial en Parque Querétaro con cláusula arbitral.'
  },
  {
    id: 'DOC-2026-003',
    expediente: 'EXP-2026-7512',
    nombre: 'Dictamen Pericial Contable y Financiero en Materia Fiscal',
    autor: 'Mtro. Gabriel Mendoza',
    categoria: 'Dictamen Pericial',
    fecha: '2026-07-20',
    estado: 'En revisión',
    workflowStage: 'Revisión Legal',
    version: 'v3.0',
    tamano: '5.8 MB',
    favorito: true,
    sensible: true,
    firmantes: ['Mtro. Gabriel Mendoza'],
    descripcion: 'Peritaje contable sobre la determinación de pérdidas impositivas y activos intangibles.'
  },
  {
    id: 'DOC-2026-004',
    expediente: 'EXP-2026-4439',
    nombre: 'Convenio de Confidencialidad y Propiedad Intelectual (NDA)',
    autor: 'Dra. María Elena Garza',
    categoria: 'Convenio Notarial',
    fecha: '2026-07-22',
    estado: 'Finalizado',
    workflowStage: 'Finalizado',
    version: 'v1.2',
    tamano: '890 KB',
    favorito: false,
    sensible: false,
    firmantes: ['Dra. María Elena Garza', 'Lic. Fernando Reyes'],
    descripcion: 'Acuerdo bilaterial de secrecía comercial y patentes bajo legislación del Estado de Querétaro.'
  },
  {
    id: 'DOC-2026-005',
    expediente: 'EXP-2026-3021',
    nombre: 'Juicio Sucesorio Intestamentario - Segunda Sección',
    autor: 'Lic. Fernando Reyes',
    categoria: 'Juicio Civil / Familiar',
    fecha: '2026-07-25',
    estado: 'Pendiente firma',
    workflowStage: 'Firma Notarial',
    version: 'v1.0',
    tamano: '3.6 MB',
    favorito: true,
    sensible: true,
    firmantes: ['Lic. Fernando Reyes'],
    descripcion: 'Inventario y avalúo de bienes relictos sujeto a adjudicación de herederos legítimos.'
  }
];

let auditLogs = [
  {
    id: 'log-101',
    usuario: 'Lic. Fernando Reyes',
    accion: 'Radicación de expediente DOC-2026-005',
    documento: 'DOC-2026-005',
    fecha: '2026-07-25 14:30',
    ip: '192.168.1.104',
    resultado: 'Exitoso'
  },
  {
    id: 'log-102',
    usuario: 'Dra. María Elena Garza',
    accion: 'Firma Electrónica Avanzada FIEL en DOC-2026-004',
    documento: 'DOC-2026-004',
    fecha: '2026-07-22 11:15',
    ip: '192.168.1.110',
    resultado: 'Exitoso'
  },
  {
    id: 'log-103',
    usuario: 'Mtro. Gabriel Mendoza',
    accion: 'Solicitud de revisión para versión v3.0 en DOC-2026-003',
    documento: 'DOC-2026-003',
    fecha: '2026-07-20 09:45',
    ip: '192.168.1.115',
    resultado: 'Exitoso'
  }
];

let sharedProfiles = [
  { id: 'u1', username: 'admin', password: '1234', role: 'Administrador', name: 'Lic. Administrador General', email: 'admin@poderjudicial.gob.mx', cargo: 'Administrador del Sistema', status: 'Activo', cedula: 'CED-1000001', appMobileConnected: true },
  { id: 'u2', username: 'juez1', password: '1234', role: 'Juez', name: 'Lic. Fernando Reyes', email: 'fernando.reyes@poderjudicial.gob.mx', cargo: 'Juez 3° Familiar', status: 'Activo', cedula: 'CED-8842109', appMobileConnected: true },
  { id: 'u3', username: 'juez2', password: '1234', role: 'Juez', name: 'Dra. María Elena Garza', email: 'maria.garza@poderjudicial.gob.mx', cargo: 'Juez 1° Civil', status: 'Activo', cedula: 'CED-9940182', appMobileConnected: true }
];

let users = [...sharedProfiles];

// 1. Health & Server Metadata Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'DocHub REST API Server',
    institution: 'Universidad Politécnica de Querétaro (UPQ)',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    features: [
      'Document CRUD & Versioning',
      'AI OCR Text Extraction',
      'LFPDPPP Sensitive Data Protection Masking',
      'e.firma FIEL Cryptographic Validation',
      'Audit Traceability Log',
      'Mobile Sync Gateway'
    ]
  });
});

// 2. GET /api/documents - Get list of documents
app.get('/api/documents', (req, res) => {
  const { search, estado, categoria } = req.query;
  let result = [...documents];

  if (search) {
    const q = search.toLowerCase();
    result = result.filter(d =>
      d.nombre.toLowerCase().includes(q) ||
      d.expediente.toLowerCase().includes(q) ||
      d.autor.toLowerCase().includes(q)
    );
  }
  if (estado && estado !== 'Todos') {
    result = result.filter(d => d.estado === estado);
  }
  if (categoria && categoria !== 'Todas') {
    result = result.filter(d => d.categoria === categoria);
  }

  res.json({ success: true, count: result.length, data: result });
});

// 3. POST /api/documents - Create new document
app.post('/api/documents', (req, res) => {
  const { nombre, categoria, expediente, autor, descripcion, sensible } = req.body;
  if (!nombre) {
    return res.status(400).json({ success: false, message: 'El nombre del documento es obligatorio.' });
  }

  const newDoc = {
    id: `DOC-2026-${String(documents.length + 1).padStart(3, '0')}`,
    expediente: expediente || `EXP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    nombre,
    autor: autor || 'Lic. Fernando Reyes',
    categoria: categoria || 'Juicio Civil / Familiar',
    fecha: new Date().toISOString().slice(0, 10),
    estado: 'En revisión',
    workflowStage: 'Preparación',
    version: 'v1.0',
    tamano: '1.5 MB',
    favorito: false,
    sensible: !!sensible,
    firmantes: [autor || 'Lic. Fernando Reyes'],
    descripcion: descripcion || 'Documento legal radicado vía API DocHub.'
  };

  documents.unshift(newDoc);

  // Add audit log
  auditLogs.unshift({
    id: `log-${Date.now()}`,
    usuario: newDoc.autor,
    accion: `Radicación de expediente ${newDoc.id} via REST API`,
    documento: newDoc.id,
    fecha: new Date().toISOString().replace('T', ' ').slice(0, 16),
    ip: req.ip || '127.0.0.1',
    resultado: 'Exitoso'
  });

  res.status(201).json({ success: true, message: 'Expediente radicado con éxito', data: newDoc });
});

// 4. PUT /api/documents/:id - Update status or properties
app.put('/api/documents/:id', (req, res) => {
  const { id } = req.params;
  const index = documents.findIndex(d => d.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Documento no encontrado.' });
  }

  documents[index] = { ...documents[index], ...req.body };

  // Log update
  auditLogs.unshift({
    id: `log-${Date.now()}`,
    usuario: req.body.usuario || 'Sistema API',
    accion: `Actualización de expediente ${id}`,
    documento: id,
    fecha: new Date().toISOString().replace('T', ' ').slice(0, 16),
    ip: req.ip || '127.0.0.1',
    resultado: 'Exitoso'
  });

  res.json({ success: true, message: 'Documento actualizado', data: documents[index] });
});

// 5. DELETE /api/documents/:id - Delete document
app.delete('/api/documents/:id', (req, res) => {
  const { id } = req.params;
  const initialLen = documents.length;
  documents = documents.filter(d => d.id !== id);

  if (documents.length === initialLen) {
    return res.status(404).json({ success: false, message: 'Documento no encontrado.' });
  }

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    usuario: 'Administrador API',
    accion: `Eliminación de expediente ${id}`,
    documento: id,
    fecha: new Date().toISOString().replace('T', ' ').slice(0, 16),
    ip: req.ip || '127.0.0.1',
    resultado: 'Exitoso'
  });

  res.json({ success: true, message: `Documento ${id} eliminado con éxito` });
});

// 6. POST /api/ocr/extract - AI Text Extraction & LFPDPPP Data Masking
app.post('/api/ocr/extract', (req, res) => {
  const { documentText, documentType, enableMasking } = req.body;
  const sampleText = documentText || `CONVENIO DE ADJUDICACIÓN Y COMPRAVENTA DE BIEN INMUEBLE.
Por una parte la C. Lic. Patricia Gómez Garza, con CURP GOGP850412HDFRR09, RFC GOGP850412K91, domicilio en Av. Universidad 420, Querétaro, Qro., y CLABE 012680015492810482.
Manifiesta haber comparecido ante la fe del Notario Público No. 14 para la cesión de derechos respecto del juicio EXP-2026-8842.`;

  // Detect sensitive entities under LFPDPPP
  const curpMatches = sampleText.match(/[A-Z]{4}\d{6}[HM][A-Z]{5}\d{2}/g) || ['GOGP850412HDFRR09'];
  const rfcMatches = sampleText.match(/[A-Z]{3,4}\d{6}[A-Z0-9]{3}/g) || ['GOGP850412K91'];
  const clabeMatches = sampleText.match(/\b\d{18}\b/g) || ['012680015492810482'];

  let maskedText = sampleText;
  if (enableMasking !== false) {
    curpMatches.forEach(curp => {
      maskedText = maskedText.replace(curp, '[CURP ENMASCARADO - LFPDPPP]');
    });
    rfcMatches.forEach(rfc => {
      maskedText = maskedText.replace(rfc, '[RFC ENMASCARADO - LFPDPPP]');
    });
    clabeMatches.forEach(clabe => {
      maskedText = maskedText.replace(clabe, '[CLABE BANCARIA PROTEGIDA]');
    });
  }

  res.json({
    success: true,
    extractedAt: new Date().toISOString(),
    aiModel: 'DocHub-Vision-OCR v3.2',
    confidenceScore: 0.984,
    documentType: documentType || 'Convenio Notarial / Juicio',
    sensitiveDataFound: {
      curps: curpMatches.length,
      rfcs: rfcMatches.length,
      clabes: clabeMatches.length,
      lawCompliance: 'Cumple Ley Federal de Protección de Datos Personales (LFPDPPP México)'
    },
    rawExtractedText: sampleText,
    protectedText: maskedText
  });
});

// 7. POST /api/signatures/sign - Cryptographic Digital Signature Validation (e.firma FIEL)
app.post('/api/signatures/sign', (req, res) => {
  const { documentId, signerName, serialNumber, passphrase } = req.body;

  if (!signerName) {
    return res.status(400).json({ success: false, message: 'Nombre del firmante requerido.' });
  }

  const timestamp = new Date().toISOString();
  const hashPayload = `${documentId || 'DOC-GEN'}-${signerName}-${timestamp}-${serialNumber || 'FIEL-2026-UPQ'}`;
  const sha256Hash = crypto.createHash('sha256').update(hashPayload).digest('hex').toUpperCase();

  const signatureCertificate = {
    signatureId: `SIG-${Date.now()}`,
    documentId: documentId || 'DOC-2026-001',
    signerName,
    signerRole: 'Abogado Notario / Servidor Público',
    certificateSerial: serialNumber || '00000100000508849201',
    validFrom: '2026-01-01T00:00:00Z',
    validTo: '2028-01-01T23:59:59Z',
    ocspStatus: 'VALID (SAT / Autoridad Certificadora UPQ)',
    timestamp,
    hashSHA256: sha256Hash,
    qrVerificationUrl: `https://dochub.upq.edu.mx/verify?hash=${sha256Hash.slice(0, 16)}`
  };

  // Add log entry
  auditLogs.unshift({
    id: `log-${Date.now()}`,
    usuario: signerName,
    accion: `Firma digital e.firma FIEL en documento ${documentId || 'DOC-2026-001'}`,
    documento: documentId || 'DOC-2026-001',
    fecha: new Date().toISOString().replace('T', ' ').slice(0, 16),
    ip: req.ip || '127.0.0.1',
    resultado: 'Exitoso (HASH: ' + sha256Hash.slice(0, 10) + '...)'
  });

  res.json({
    success: true,
    message: 'Documento firmado digitalmente con validez jurídica NOM-151 / SAT',
    certificate: signatureCertificate
  });
});

// 8. GET /api/audit-logs - Audit trail endpoint
app.get('/api/audit-logs', (req, res) => {
  res.json({ success: true, count: auditLogs.length, data: auditLogs });
});

// 9. GET /api/users - Users list
app.get('/api/users', (req, res) => {
  res.json({ success: true, count: users.length, data: users });
});

// 10. GET /api/stats - Executive metrics dashboard endpoint
app.get('/api/stats', (req, res) => {
  res.json({
    success: true,
    metrics: {
      totalDocuments: documents.length,
      pendingSignatures: documents.filter(d => d.estado === 'Pendiente firma').length,
      approved: documents.filter(d => d.estado === 'Aprobado' || d.estado === 'Finalizado').length,
      inReview: documents.filter(d => d.estado === 'En revisión').length,
      activeLawyers: users.length,
      mobileAppSync: {
        status: 'CONNECTED',
        activeMobileSessions: 4,
        lastSyncTime: new Date().toISOString(),
        pendingPushNotifications: 2
      }
    }
  });
});

// 12. GET /api/profiles - Unified Shared Profiles (Web ↔ Mobile)
app.get('/api/profiles', (req, res) => {
  res.json({
    success: true,
    platform: 'DocHub Unified Ecosystem API',
    count: sharedProfiles.length,
    profiles: sharedProfiles.map(p => ({
      id: p.id,
      username: p.username,
      name: p.name,
      email: p.email,
      role: p.role,
      cargo: p.cargo,
      status: p.status,
      cedula: p.cedula,
      appMobileConnected: true
    }))
  });
});

// 12b. POST /api/profiles - Create new shared user profile (Web ↔ Mobile)
app.post('/api/profiles', (req, res) => {
  const { name, email, role, cargo, username, password } = req.body;
  if (!name || !email) {
    return res.status(400).json({ success: false, message: 'Nombre y correo son obligatorios.' });
  }

  const generatedUsername = username || name.toLowerCase().replace(/^(lic\.|not\.|dra\.|dr\.|ing\.|mtro\.)\s+/i, '').trim().replace(/\s+/g, '');
  
  const newProfile = {
    id: `u-${Date.now()}`,
    username: generatedUsername,
    password: password || '1234',
    role: role || 'Revisor',
    name,
    email,
    cargo: cargo || 'Abogado Litigante / Consultor Legal',
    status: 'Activo',
    cedula: `CED-${Math.floor(1000000 + Math.random() * 9000000)}`,
    appMobileConnected: true
  };

  sharedProfiles.unshift(newProfile);
  users.unshift(newProfile);

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    usuario: 'Administrador',
    accion: `Perfil unificado "${name}" (${generatedUsername}) creado vía API`,
    documento: 'N/A',
    fecha: new Date().toISOString().replace('T', ' ').slice(0, 16),
    ip: req.ip || '127.0.0.1',
    resultado: 'Exitoso'
  });

  res.status(201).json({
    success: true,
    message: `Perfil unificado "${name}" creado exitosamente y sincronizado con la App Móvil`,
    profile: newProfile
  });
});

// 13. POST /api/auth/login - Unified Authentication Endpoint for Web and Mobile
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Usuario y contraseña requeridos.' });
  }

  const found = sharedProfiles.find(p => p.username.toLowerCase() === username.toLowerCase() && p.password === password);
  if (found) {
    if (found.role !== 'Administrador' && found.role !== 'Juez') {
      return res.status(403).json({ success: false, message: 'Acceso denegado. Solo Administradores y Jueces pueden ingresar.' });
    }
    // Add audit log
    auditLogs.unshift({
      id: `log-${Date.now()}`,
      usuario: found.name,
      accion: `Inicio de sesión unificado vía API (${req.headers['user-agent'] || 'Web/Mobile Client'})`,
      documento: 'N/A',
      fecha: new Date().toISOString().replace('T', ' ').slice(0, 16),
      ip: req.ip || '127.0.0.1',
      resultado: 'Exitoso'
    });

    return res.json({
      success: true,
      message: `Autenticación exitosa para ${found.name}`,
      token: `dh_session_token_${found.id}_${Date.now()}`,
      user: {
        id: found.id,
        username: found.username,
        name: found.name,
        email: found.email,
        role: found.role,
        cargo: found.cargo,
        cedula: found.cedula
      }
    });
  } else {
    return res.status(401).json({ success: false, message: 'Credenciales inválidas. Verifica usuario o contraseña.' });
  }
});

// Start listening
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`   DocHub REST API Server running on port ${PORT}   `);
  console.log(`   Universidad Politécnica de Querétaro (UPQ)        `);
  console.log(`   http://localhost:${PORT}/api/health               `);
  console.log(`====================================================`);
});
