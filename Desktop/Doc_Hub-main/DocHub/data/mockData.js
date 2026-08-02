// mockData.js
// Datos simulados (mock) usados en toda la app. No hay backend ni API real.

export const ROLE_LABELS = {
  juez: 'Juez',
  notario: 'Notario',
  abogado: 'Abogado',
  parte: 'Parte',
  testigo: 'Testigo',
};

export const USERS = [
  { id: 'u1', username: 'juez1',     password: '1234', role: 'juez',     name: 'Lic. Fernando Reyes', cargo: 'Juez 3° Familiar' },
  { id: 'u2', username: 'notario1',  password: '1234', role: 'notario',  name: 'Not. Karla Sánchez',  cargo: 'Notaría Pública 24' },
  { id: 'u3', username: 'abogado1',  password: '1234', role: 'abogado',  name: 'Lic. Mario Torres',   cargo: 'Abogado Litigante' },
  { id: 'u4', username: 'parte1',    password: '1234', role: 'parte',    name: 'Ana Gómez',           cargo: 'Parte solicitante' },
  { id: 'u5', username: 'testigo1',  password: '1234', role: 'testigo',  name: 'Carlos Ruiz',         cargo: 'Testigo' },
];

export const EXPEDIENTES = [
  {
    id: 'DV-2024-0817',
    tipo: 'Divorcio voluntario',
    estado: 'Activo',
    juzgado: 'Juzgado 3° Familiar',
    fechaInicio: '12/01/2024',
    progreso: 0.65,
    docsTotal: 4,
    docsFirmados: 2,
    participantes: [
      { nombre: 'Ana Gómez', rol: 'Parte solicitante' },
      { nombre: 'Luis Pérez', rol: 'Parte contraria' },
      { nombre: 'Lic. Mario Torres', rol: 'Abogado' },
      { nombre: 'Carlos Ruiz', rol: 'Testigo' },
    ],
  },
  {
    id: 'NM-2023-0452',
    tipo: 'Nulidad matrimonial',
    estado: 'Pendiente',
    juzgado: 'Juzgado 1° Familiar',
    fechaInicio: '03/09/2023',
    progreso: 0.35,
    docsTotal: 3,
    docsFirmados: 1,
    participantes: [
      { nombre: 'María López', rol: 'Parte solicitante' },
      { nombre: 'Not. Karla Sánchez', rol: 'Notario' },
    ],
  },
  {
    id: 'DV-2023-0299',
    tipo: 'Divorcio voluntario',
    estado: 'Cerrado',
    juzgado: 'Juzgado 3° Familiar',
    fechaInicio: '20/04/2023',
    progreso: 1,
    docsTotal: 6,
    docsFirmados: 6,
    participantes: [
      { nombre: 'Jorge Salinas', rol: 'Parte solicitante' },
      { nombre: 'Lic. Fernando Reyes', rol: 'Juez' },
    ],
  },
];

export const DOCUMENTOS = {
  'DV-2024-0817': [
    { id: 'd1', nombre: 'Convenio de divorcio voluntario.pdf', version: 'v3.2', estado: 'Pendiente firma', tipo: 'pdf', tamano: '3.2 MB', paginas: 14 },
    { id: 'd2', nombre: 'Acuerdo de bienes.pdf', version: 'v1.1', estado: 'Autorizado', tipo: 'pdf', tamano: '1.1 MB', paginas: 6 },
    { id: 'd3', nombre: 'declaracion_bienes.pdf', version: 'v1.0', estado: 'Subido', tipo: 'pdf', tamano: '3.2 MB', paginas: 3 },
    { id: 'd4', nombre: 'acta_nacimiento_escaneada.jpg', version: 'v1.0', estado: 'Procesando OCR', tipo: 'img', tamano: '1.8 MB', paginas: 1 },
  ],
  'NM-2023-0452': [
    { id: 'd5', nombre: 'Acta de audiencia.pdf', version: 'v1.0', estado: 'Pendiente firma', tipo: 'pdf', tamano: '2.4 MB', paginas: 9 },
    { id: 'd6', nombre: 'Identificación oficial.jpg', version: 'v1.0', estado: 'Autorizado', tipo: 'img', tamano: '900 KB', paginas: 1 },
    { id: 'd7', nombre: 'Solicitud inicial.docx', version: 'v2.0', estado: 'Subido', tipo: 'doc', tamano: '540 KB', paginas: 5 },
  ],
  'DV-2023-0299': [
    { id: 'd8', nombre: 'Sentencia final.pdf', version: 'v1.0', estado: 'Autorizado', tipo: 'pdf', tamano: '1.5 MB', paginas: 4 },
    { id: 'd9', nombre: 'Convenio de divorcio.pdf', version: 'v2.0', estado: 'Autorizado', tipo: 'pdf', tamano: '2.0 MB', paginas: 10 },
  ],
};

export const TRAZABILIDAD = {
  'DV-2024-0817': [
    { id: 't1', fecha: '30/05/2026 · 09:41', actor: 'Ana Gómez', accion: 'Subió el documento "acta_nacimiento_escaneada.jpg"', tipo: 'subida' },
    { id: 't2', fecha: '29/05/2026 · 17:20', actor: 'Lic. Mario Torres', accion: 'Firmó el documento "Acuerdo de bienes" v1.1', tipo: 'firma' },
    { id: 't3', fecha: '27/05/2026 · 12:05', actor: 'Lic. Fernando Reyes', accion: 'Autorizó el expediente para continuar el proceso', tipo: 'aprobacion' },
    { id: 't4', fecha: '20/05/2026 · 10:00', actor: 'Ana Gómez', accion: 'Creó el expediente DV-2024-0817', tipo: 'creacion' },
  ],
  'NM-2023-0452': [
    { id: 't5', fecha: '28/05/2026 · 18:03', actor: 'Not. Karla Sánchez', accion: 'Autorizó el documento "Identificación oficial"', tipo: 'aprobacion' },
    { id: 't6', fecha: '15/05/2026 · 09:12', actor: 'María López', accion: 'Subió el documento "Solicitud inicial"', tipo: 'subida' },
  ],
  'DV-2023-0299': [
    { id: 't7', fecha: '18/12/2023 · 11:40', actor: 'Lic. Fernando Reyes', accion: 'Cerró el expediente con sentencia final', tipo: 'aprobacion' },
  ],
};

export const NOTIFICACIONES = [
  { id: 'n1', grupo: 'Hoy', titulo: 'Firma requerida', mensaje: 'El documento "Convenio de divorcio voluntario" requiere tu firma.', hora: '09:41', tipo: 'firma', leido: false },
  { id: 'n2', grupo: 'Hoy', titulo: 'Nuevo documento', mensaje: 'Se agregó "acta_nacimiento_escaneada.jpg" al expediente DV-2024-0817.', hora: '09:38', tipo: 'documento', leido: false },
  { id: 'n3', grupo: 'Hoy', titulo: 'Recordatorio de audiencia', mensaje: 'Audiencia programada para el expediente NM-2023-0452.', hora: '08:00', tipo: 'recordatorio', leido: true },
  { id: 'n4', grupo: 'Ayer', titulo: 'Documento autorizado', mensaje: 'El documento "Acuerdo de bienes" fue autorizado.', hora: '18:03', tipo: 'documento', leido: true },
  { id: 'n5', grupo: 'Ayer', titulo: 'Comentario nuevo', mensaje: 'Lic. Mario Torres comentó en el expediente DV-2024-0817.', hora: '15:47', tipo: 'comentario', leido: true },
];

export const SOLICITUDES_FIRMA = [
  { id: 'f1', documento: 'Convenio de divorcio voluntario.pdf', expedienteId: 'DV-2024-0817', version: 'v3.2', solicitante: 'Juzgado 3° Familiar', fecha: '30/05/2026', estado: 'Pendiente', paginas: 14, tamano: '3.2 MB' },
  { id: 'f2', documento: 'Acta de audiencia.pdf', expedienteId: 'NM-2023-0452', version: 'v1.0', solicitante: 'Not. Karla Sánchez', fecha: '28/05/2026', estado: 'Pendiente', paginas: 9, tamano: '2.4 MB' },
  { id: 'f3', documento: 'Sentencia final.pdf', expedienteId: 'DV-2023-0299', version: 'v1.0', solicitante: 'Juzgado 3° Familiar', fecha: '18/12/2023', estado: 'Firmado', paginas: 4, tamano: '1.5 MB' },
];

export const RESUMEN_DASHBOARD = {
  expedientesActivos: 2,
  docsFirmados: 9,
  pendientes: 3,
};

export const ACTIVIDAD_RECIENTE = [
  { id: 'a1', texto: 'Ana Gómez subió un nuevo documento', hora: 'Hace 10 min' },
  { id: 'a2', texto: 'Lic. Mario Torres firmó "Acuerdo de bienes"', hora: 'Ayer · 17:20' },
  { id: 'a3', texto: 'Expediente DV-2023-0299 fue cerrado', hora: 'Hace 3 días' },
];
