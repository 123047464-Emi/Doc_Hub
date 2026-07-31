// navigation/roleConfig.js
// Configuración de navegación y permisos según el rol del usuario,
// basada en el documento de Roles y Requerimientos Funcionales del sistema.
// El administrador NO existe en móvil (esas funciones son exclusivas de la plataforma web).

export const ROLE_DASHBOARD = {
  juez: 'DashboardJuez',
  notario: 'DashboardNotario',
  abogado: 'DashboardAbogado',
  parte: 'DashboardParte',
  testigo: 'DashboardTestigo',
};

// Permisos reales por rol. Estas banderas SÍ se consultan en las pantallas
// para mostrar/ocultar acciones y filtrar información (RF-06, RF-07, RF-08, RF-09, RF-10, RNF-01).
export const ROLE_PERMISSIONS = {
  juez: {
    verTodosExpedientes: true,   // consulta expedientes/documentos de casos activos
    puedeCargarDocumentos: false,
    puedeAprobarRechazar: true,  // aprobar o rechazar documentación
    puedeFirmar: true,           // firma cuando el proceso lo requiere
    puedeSolicitarFirma: false,
    soloDocumentosAutorizados: false,
    soloSolicitudesFirma: false,
    tabs: ['inicio', 'documentos', 'firma', 'avisos'],
  },
  notario: {
    verTodosExpedientes: true,   // consulta expedientes
    puedeCargarDocumentos: false,
    puedeAprobarRechazar: true,  // revisar y validar documentación
    puedeFirmar: true,           // firma documentos que requieren certificación
    puedeSolicitarFirma: false,
    soloDocumentosAutorizados: false,
    soloSolicitudesFirma: false,
    tabs: ['inicio', 'documentos', 'firma', 'avisos'],
  },
  abogado: {
    verTodosExpedientes: false,  // solo los expedientes en los que participa
    puedeCargarDocumentos: false,
    puedeAprobarRechazar: false,
    puedeFirmar: true,
    puedeSolicitarFirma: true,   // solicitar firmas (RF-09 / actividad #8)
    soloDocumentosAutorizados: false,
    soloSolicitudesFirma: false,
    tabs: ['inicio', 'documentos', 'firma', 'avisos'],
  },
  parte: {
    verTodosExpedientes: false,  // solo su propio expediente
    puedeCargarDocumentos: true, // cargar documentos personales (RF-07)
    puedeAprobarRechazar: false,
    puedeFirmar: true,
    puedeSolicitarFirma: false,
    soloDocumentosAutorizados: true, // solo visualiza documentación ya autorizada
    soloSolicitudesFirma: false,
    tabs: ['inicio', 'documentos', 'firma', 'avisos'],
  },
  testigo: {
    verTodosExpedientes: false,
    puedeCargarDocumentos: false,
    puedeAprobarRechazar: false,
    puedeFirmar: true,
    puedeSolicitarFirma: false,
    soloDocumentosAutorizados: false,
    soloSolicitudesFirma: true,  // solo consulta y firma solicitudes asignadas
    tabs: ['inicio', 'firma', 'avisos'], // sin acceso a Documentos/Expedientes
  },
};
