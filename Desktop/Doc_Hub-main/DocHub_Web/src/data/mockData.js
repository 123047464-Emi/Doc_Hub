import { getInitialsAvatar } from '../utils/avatarUtils';

export const USERS = [
  { id: 'u1', username: 'admin', name: 'Lic. Administrador General', email: 'admin@poderjudicial.gob.mx', role: 'Administrador', cargo: 'Administrador del Sistema', avatar: getInitialsAvatar('Lic. Administrador General', '#7C5CFC'), status: 'Activo', lastAccess: 'Hace 2 min', accesoWeb: true, accesoMobile: true },
  { id: 'u2', username: 'juez1', name: 'Lic. Fernando Reyes', email: 'fernando.reyes@poderjudicial.gob.mx', role: 'Juez', cargo: 'Juez 3° Familiar', avatar: getInitialsAvatar('Lic. Fernando Reyes', '#1E4B8F'), status: 'Activo', lastAccess: 'Hace 5 min', accesoWeb: true, accesoMobile: true },
  { id: 'u3', username: 'juez2', name: 'Dra. María Elena Garza', email: 'maria.garza@poderjudicial.gob.mx', role: 'Juez', cargo: 'Juez 1° Civil', avatar: getInitialsAvatar('Dra. María Elena Garza', '#1FA971'), status: 'Activo', lastAccess: 'Hace 20 min', accesoWeb: true, accesoMobile: true },
  { id: 'u4', username: 'notario1', name: 'Not. Karla Sánchez', email: 'karla.sanchez@notaria24.com.mx', role: 'Notario', cargo: 'Notaría Pública 24', avatar: getInitialsAvatar('Not. Karla Sánchez', '#7C5CFC'), status: 'Activo', lastAccess: 'Hace 25 min', accesoWeb: false, accesoMobile: true },
  { id: 'u5', username: 'abogado1', name: 'Lic. Mario Torres', email: 'mario.torres@bufetejuridico.com', role: 'Abogado', cargo: 'Abogado Litigante', avatar: getInitialsAvatar('Lic. Mario Torres', '#2F6FED'), status: 'Activo', lastAccess: 'Ayer · 17:20', accesoWeb: false, accesoMobile: true },
  { id: 'u6', username: 'parte1', name: 'Ana Gómez', email: 'ana.gomez@corporativo.com', role: 'Parte', cargo: 'Parte solicitante', avatar: getInitialsAvatar('Ana Gómez', '#1FA971'), status: 'Activo', lastAccess: 'Hace 1 hora', accesoWeb: false, accesoMobile: true },
  { id: 'u7', username: 'testigo1', name: 'Carlos Ruiz', email: 'carlos.ruiz@peritaje.com', role: 'Testigo', cargo: 'Testigo / Perito', avatar: getInitialsAvatar('Carlos Ruiz', '#D98A11'), status: 'Inactivo', lastAccess: 'Hace 3 días', accesoWeb: false, accesoMobile: true },
];

export const INITIAL_DOCUMENTS = [
  {
    id: 'EXP-2026-DV0817',
    nombre: 'Convenio de Divorcio Voluntario y Liquidación de Sociedad.pdf',
    autor: 'Lic. Mario Torres',
    categoria: 'Juicio Civil / Familiar',
    fecha: '2026-05-30',
    estado: 'Pendiente firma',
    version: 'v3.2',
    tamano: '3.2 MB',
    paginas: 14,
    expediente: 'Juzgado 3° Familiar · Exp #0817/2026',
    favorito: true,
    etiquetas: ['Litigio', 'Familiar', 'Urgente'],
    workflowStage: 'Firma digital',
    responsable: 'Lic. Fernando Reyes',
    juez: 'Lic. Fernando Reyes',
    historial: [
      { version: 'v3.2', autor: 'Lic. Mario Torres', fecha: '2026-05-30 09:41', cambios: 'Ajuste en cláusula de guarda y custodia de menores', estado: 'Pendiente firma' },
      { version: 'v3.1', autor: 'Lic. Fernando Reyes', fecha: '2026-05-28 14:15', cambios: 'Revisión judicial del convenio de alimentos', estado: 'En revisión' },
      { version: 'v2.0', autor: 'Not. Karla Sánchez', fecha: '2026-05-25 11:30', cambios: 'Protocolización notarial del inventario de bienes', estado: 'Aprobado' },
      { version: 'v1.0', autor: 'Lic. Mario Torres', fecha: '2026-05-20 10:00', cambios: 'Radicación de la demanda inicial', estado: 'Creado' }
    ]
  },
  {
    id: 'EXP-2026-AMP0452',
    nombre: 'Demanda de Juicio de Amparo Indirecto e Incidente.pdf',
    autor: 'Lic. Fernando Reyes',
    categoria: 'Amparo y Constitucional',
    fecha: '2026-05-28',
    estado: 'Aprobado',
    version: 'v1.1',
    tamano: '1.8 MB',
    paginas: 8,
    expediente: 'Juzgado 3° Familiar · Exp #0452/2026',
    favorito: false,
    etiquetas: ['Amparo', 'Suspensión'],
    workflowStage: 'Aprobado',
    responsable: 'Lic. Fernando Reyes',
    juez: 'Lic. Fernando Reyes',
    historial: [
      { version: 'v1.1', autor: 'Lic. Fernando Reyes', fecha: '2026-05-28 17:20', cambios: 'Resolución de suspensión definitiva concedida', estado: 'Aprobado' },
      { version: 'v1.0', autor: 'Lic. Mario Torres', fecha: '2026-05-22 09:00', cambios: 'Presentación del escrito inicial de amparo', estado: 'Creado' }
    ]
  },
  {
    id: 'EXP-2026-NOT0299',
    nombre: 'Escritura Pública Notarial #10405 de Compraventa de Inmueble.pdf',
    autor: 'Dra. María Elena Garza',
    categoria: 'Convenio Notarial',
    fecha: '2026-05-15',
    estado: 'Finalizado',
    version: 'v1.0',
    tamano: '4.5 MB',
    paginas: 22,
    expediente: 'Juzgado 1° Civil · Protocolo #10405',
    favorito: true,
    etiquetas: ['Notarial', 'Escrituración'],
    workflowStage: 'Finalizado',
    responsable: 'Dra. María Elena Garza',
    juez: 'Dra. María Elena Garza',
    historial: [
      { version: 'v1.0', autor: 'Dra. María Elena Garza', fecha: '2026-05-15 12:00', cambios: 'Escritura firmada y ratificada ante juzgador', estado: 'Finalizado' }
    ]
  },
  {
    id: 'EXP-2026-MER0912',
    nombre: 'Contrato Mercantil de Fideicomiso y Garantía Corporativa.docx',
    autor: 'Lic. Fernando Reyes',
    categoria: 'Contrato Mercantil',
    fecha: '2026-05-10',
    estado: 'En revisión',
    version: 'v2.0',
    tamano: '850 KB',
    paginas: 6,
    expediente: 'Juzgado 3° Familiar · Exp #0912/2026',
    favorito: false,
    etiquetas: ['Corporativo', 'Fideicomiso'],
    workflowStage: 'En revisión',
    responsable: 'Lic. Fernando Reyes',
    juez: 'Lic. Fernando Reyes',
    historial: [
      { version: 'v2.0', autor: 'Lic. Fernando Reyes', fecha: '2026-05-10 16:45', cambios: 'Modificación de penas convencionales e intereses', estado: 'En revisión' }
    ]
  },
  {
    id: 'EXP-2026-PER0105',
    nombre: 'Dictamen Pericial de Fotogrametría y Valuación Inmobiliaria.pdf',
    autor: 'Dra. María Elena Garza',
    categoria: 'Dictamen Pericial',
    fecha: '2026-05-29',
    estado: 'Aprobado',
    version: 'v1.0',
    tamano: '2.1 MB',
    paginas: 1,
    expediente: 'Juzgado 1° Civil · Exp #0105/2026',
    favorito: false,
    etiquetas: ['Peritaje', 'Avalúo'],
    workflowStage: 'Aprobado',
    responsable: 'Dra. María Elena Garza',
    juez: 'Dra. María Elena Garza',
    historial: [
      { version: 'v1.0', autor: 'Dra. María Elena Garza', fecha: '2026-05-29 10:10', cambios: 'Rendición de dictamen pericial con protesta de decir verdad', estado: 'Aprobado' }
    ]
  }
];

export const WORKFLOW_STAGES = [
  { id: 'creado', label: 'Creado', icon: 'FilePlus', color: '#5B6B82' },
  { id: 'en_revision', label: 'En revisión legal', icon: 'Eye', color: '#D98A11' },
  { id: 'aprobado', label: 'Autorizado por Juez', icon: 'CheckCircle', color: '#1FA971' },
  { id: 'firma_digital', label: 'Firma digital e-firma', icon: 'PenTool', color: '#7C5CFC' },
  { id: 'finalizado', label: 'Sentencia / Ejecutoriado', icon: 'ShieldCheck', color: '#1E4B8F' }
];

export const AUDIT_LOGS = [
  { id: 'log-1', usuario: 'Lic. Fernando Reyes', accion: 'Presentó escrito con desahogo de vista en Exp #0817/2026', documento: 'EXP-2026-DV0817', fecha: '2026-05-30 09:41', ip: '192.168.1.104', resultado: 'Exitoso' },
  { id: 'log-2', usuario: 'Lic. Fernando Reyes', accion: 'Dictó acuerdo que admite prueba pericial en Exp #0452/2026', documento: 'EXP-2026-AMP0452', fecha: '2026-05-28 17:20', ip: '192.168.1.112', resultado: 'Exitoso' },
  { id: 'log-3', usuario: 'Dra. María Elena Garza', accion: 'Firmó e-Firma judicial en protocolo #10405', documento: 'EXP-2026-NOT0299', fecha: '2026-05-27 12:05', ip: '192.168.1.100', resultado: 'Exitoso' },
  { id: 'log-4', usuario: 'Lic. Administrador General', accion: 'Descargó copia certificada con sello de agua legal', documento: 'EXP-2026-MER0912', fecha: '2026-05-26 15:30', ip: '192.168.1.188', resultado: 'Exitoso' },
  { id: 'log-5', usuario: 'Lic. Fernando Reyes', accion: 'Exportó reporte de expedientes concluidos', documento: 'Reporte Judicial', fecha: '2026-05-25 18:03', ip: '192.168.1.105', resultado: 'Exitoso' }
];

export const NOTIFICATIONS = [
  { id: 'n1', titulo: 'Firma e-firma requerida', mensaje: 'El convenio de divorcio en el Exp #0817/2026 requiere tu firma judicial.', hora: '09:41', tipo: 'firma', leido: false },
  { id: 'n2', titulo: 'Acuerdo dictado en juzgado', mensaje: 'El Juzgado 3° prescribió acuerdo en la demanda de amparo.', hora: '09:38', tipo: 'documento', leido: false },
  { id: 'n3', titulo: 'Sentencia ejecutoriada', mensaje: 'Se declaró firme el juicio de rescisión contractual.', hora: 'Ayer · 17:20', tipo: 'aprobacion', leido: true },
  { id: 'n4', titulo: 'Alerta de Seguridad', mensaje: 'Acceso administrativo con firma electrónica verificada.', hora: 'Hace 2 días', tipo: 'seguridad', leido: true }
];

export const ROLES_DATA = [
  {
    id: 'r1',
    nombre: 'Administrador',
    descripcion: 'Acceso total a la plataforma web y móvil, gestión de usuarios, auditoría global y supervisión del sistema.',
    usuariosCount: 1,
    accesoPlataforma: 'Web + App Móvil',
    permisos: ['Gestionar Usuarios', 'Configurar Roles y Permisos', 'Ver Auditoría Judicial', 'Supervisar Métricas Globales', 'Consultar Todos los Expedientes']
  },
  {
    id: 'r2',
    nombre: 'Juez',
    descripcion: 'Acceso de juzgador en web y móvil con visualización, radicación y gestión exclusiva de sus casos asignados.',
    usuariosCount: 2,
    accesoPlataforma: 'Web + App Móvil',
    permisos: ['Radicar Expedientes / Escritos', 'Ver Sus Expedientes Asignados', 'Autorizar Sentencias', 'Firmar e-Firma', 'Seguimiento de Flujo', 'Descargar Copias Certificadas']
  },
  {
    id: 'r3',
    nombre: 'Notario',
    descripcion: 'Fe pública notarial y revisión documental desde la aplicación móvil.',
    usuariosCount: 1,
    accesoPlataforma: 'Solo App Móvil',
    permisos: ['Revisar Escrituras', 'Certificar Notarialmente', 'Firmar e-Firma Móvil', 'Consultar Notificaciones']
  },
  {
    id: 'r4',
    nombre: 'Abogado',
    descripcion: 'Litigio y carga de promociones desde la aplicación móvil.',
    usuariosCount: 1,
    accesoPlataforma: 'Solo App Móvil',
    permisos: ['Cargar Promociones Móviles', 'Consultar Estado de Expedientes', 'Recibir Notificaciones']
  },
  {
    id: 'r5',
    nombre: 'Parte',
    descripcion: 'Ratificación y aplicación de firma autógrafa digital avanzada en móvil.',
    usuariosCount: 1,
    accesoPlataforma: 'Solo App Móvil',
    permisos: ['Ver Expedientes Personales', 'Firmar Digitalmente en Móvil', 'Descargar Copias']
  },
  {
    id: 'r6',
    nombre: 'Testigo',
    descripcion: 'Rendición de avalúos y dictámenes periciales desde la aplicación móvil.',
    usuariosCount: 1,
    accesoPlataforma: 'Solo App Móvil',
    permisos: ['Cargar Dictámenes Móviles', 'Ver Peritajes Asignados']
  }
];

export const CHART_DOCS_BY_MONTH = [
  { mes: 'Ene', creados: 28, aprobados: 24, firmados: 20 },
  { mes: 'Feb', creados: 45, aprobados: 40, firmados: 35 },
  { mes: 'Mar', creados: 60, aprobados: 52, firmados: 48 },
  { mes: 'Abr', creados: 55, aprobados: 49, firmados: 45 },
  { mes: 'May', creados: 78, aprobados: 68, firmados: 62 },
  { mes: 'Jun', creados: 90, aprobados: 82, firmados: 75 },
];

export const ACTIVIDAD_RECIENTE = [
  { id: 'a1', texto: 'Lic. Mario Torres ingresó convenio en el Exp #0817/2026', hora: 'Hace 10 min' },
  { id: 'a2', texto: 'Lic. Fernando Reyes firmó auto judicial en amparo #0452/2026', hora: 'Ayer · 17:20' },
  { id: 'a3', texto: 'Escritura notarial #10405 fue formalizada e inscrita', hora: 'Hace 3 días' },
  { id: 'a4', texto: 'Ing. Carlos Ruiz adjuntó avalúo pericial', hora: 'Hace 4 días' },
];

export const SOLICITUDES_FIRMA = [
  { id: 'f1', documento: 'Convenio de Divorcio Voluntario y Liquidación de Sociedad.pdf', expedienteId: 'EXP-2026-DV0817', version: 'v3.2', solicitante: 'Juzgado 3° Familiar', fecha: '2026-05-30', estado: 'Pendiente', paginas: 14, tamano: '3.2 MB' },
  { id: 'f2', documento: 'Demanda de Juicio de Amparo Indirecto e Incidente.pdf', expedienteId: 'EXP-2026-AMP0452', version: 'v1.1', solicitante: 'Not. Karla Sánchez', fecha: '2026-05-28', estado: 'Pendiente', paginas: 8, tamano: '1.8 MB' },
  { id: 'f3', documento: 'Escritura Pública Notarial #10405 de Compraventa de Inmueble.pdf', expedienteId: 'EXP-2026-NOT0299', version: 'v1.0', solicitante: 'Abogado General', fecha: '2026-05-15', estado: 'Firmado', paginas: 22, tamano: '4.5 MB' },
];
