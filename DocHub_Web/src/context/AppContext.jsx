// src/context/AppContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { USERS, INITIAL_DOCUMENTS, NOTIFICATIONS, AUDIT_LOGS } from '../data/mockData';
import { updateDocumentApi } from '../services/apiService';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Theme (Light / Dark)
  const [theme, setTheme] = useState('light');
  
  // Users state persisted in localStorage
  const [usersList, setUsersList] = useState(() => {
    try {
      const saved = localStorage.getItem('dochub_users_v5');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load users from localStorage', e);
    }
    return USERS;
  });

  // Save users to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('dochub_users_v5', JSON.stringify(usersList));
    } catch (e) {
      console.warn('Failed to save users to localStorage', e);
    }
  }, [usersList]);

  // Auth state - default to first Web user (Admin or Juez)
  const [user, setUser] = useState(() => {
    return usersList.find(u => u.role === 'Administrador' || u.role === 'Juez') || USERS[0];
  });
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // Navigation active screen
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Documents state persisted in localStorage
  const [documents, setDocuments] = useState(() => {
    try {
      const saved = localStorage.getItem('dochub_documents_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load documents from localStorage', e);
    }
    return INITIAL_DOCUMENTS;
  });

  // Filter documents visible to the current user (Administrador sees all, Juez sees only assigned cases)
  const visibleDocuments = React.useMemo(() => {
    if (!user) return documents;
    if (user.role === 'Administrador') {
      return documents;
    }
    if (user.role === 'Juez') {
      const uName = (user.name || '').toLowerCase();
      return documents.filter(d => {
        const isResp = d.responsable && d.responsable.toLowerCase() === uName;
        const isAutor = d.autor && d.autor.toLowerCase() === uName;
        const isJuez = d.juez && d.juez.toLowerCase() === uName;
        const isFirmante = Array.isArray(d.firmantes) && d.firmantes.some(f => f.toLowerCase() === uName);
        return isResp || isAutor || isJuez || isFirmante;
      });
    }
    return [];
  }, [documents, user]);

  // Save documents to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('dochub_documents_v2', JSON.stringify(documents));
    } catch (e) {
      console.warn('Failed to save documents to localStorage', e);
    }
  }, [documents]);

  const [selectedDoc, setSelectedDoc] = useState(null); // For PDF Viewer modal
  const [compareDocs, setCompareDocs] = useState(null); // For version comparison modal
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  
  // Search query global
  const [searchQuery, setSearchQuery] = useState('');
  
  // Notifications
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState(AUDIT_LOGS);

  // Toast alert system
  const [toast, setToast] = useState(null);

  // Apply theme attribute to document HTML
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const updateUserAvatar = (newAvatarUrl) => {
    setUser(prev => ({ ...prev, avatar: newAvatarUrl }));
    showToast('Fotografía de perfil actualizada correctamente', 'success');
  };

  const login = (usernameOrEmail, password) => {
    const foundUser = usersList.find(u => 
      u.username.toLowerCase() === usernameOrEmail.toLowerCase() || 
      u.email.toLowerCase() === usernameOrEmail.toLowerCase()
    );

    if (foundUser) {
      if (foundUser.role !== 'Administrador' && foundUser.role !== 'Juez') {
        showToast(`Acceso restringido: El rol "${foundUser.role}" tiene acceso exclusivo a la App Móvil, no a la plataforma web.`, 'warning');
        return false;
      }
      setUser(foundUser);
      setIsAuthenticated(true);
      setActiveTab('dashboard');
      showToast(`Bienvenido, ${foundUser.name}`, 'success');
      
      const loginLog = {
        id: `log-${Date.now()}`,
        usuario: foundUser.name,
        accion: 'Inicio de sesión en plataforma legal web',
        documento: 'N/A',
        fecha: new Date().toISOString().replace('T', ' ').slice(0, 16),
        ip: '192.168.1.104',
        resultado: 'Exitoso'
      };
      setAuditLogs(prev => [loginLog, ...prev]);
      return true;
    } else {
      showToast('Credenciales incorrectas. Verifica usuario o contraseña.', 'warning');
      return false;
    }
  };

  const addUser = (newUser) => {
    setUsersList(prev => [newUser, ...prev]);
  };

  const toggleUserStatus = (id) => {
    setUsersList(prev => prev.map(u => {
      if (u.id === id) {
        const nextStatus = u.status === 'Activo' ? 'Bloqueado' : 'Activo';
        showToast(`Estado de ${u.name} cambiado a: ${nextStatus}`, 'info');
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  const deleteUser = (id) => {
    const userToDelete = usersList.find(u => u.id === id);
    setUsersList(prev => prev.filter(u => u.id !== id));
    showToast(`Usuario "${userToDelete?.name || id}" eliminado correctamente`, 'warning');
  };

  const logout = () => {
    setIsAuthenticated(false);
    showToast('Sesión de abogado cerrada correctamente', 'info');
    
    const logoutLog = {
      id: `log-${Date.now()}`,
      usuario: user.name,
      accion: 'Cierre de sesión del usuario',
      documento: 'N/A',
      fecha: new Date().toISOString().replace('T', ' ').slice(0, 16),
      ip: '192.168.1.104',
      resultado: 'Exitoso'
    };
    setAuditLogs(prev => [logoutLog, ...prev]);
  };

  const addDocument = (newDoc) => {
    setDocuments(prev => [newDoc, ...prev]);
    showToast(`Expediente "${newDoc.nombre}" radicado exitosamente`, 'success');
    
    const newLog = {
      id: `log-${Date.now()}`,
      usuario: user.name,
      accion: `Radicó el documento "${newDoc.nombre}"`,
      documento: newDoc.id,
      fecha: new Date().toISOString().replace('T', ' ').slice(0, 16),
      ip: '192.168.1.104',
      resultado: 'Exitoso'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const updateDocumentStatus = (docId, newStatus, newStage = null, notes = null) => {
    setDocuments(prev => prev.map(d => {
      if (d.id === docId) {
        const updatedStage = newStage || d.workflowStage || newStatus;
        const newHistorialEntry = {
          version: d.version || 'v1.0',
          autor: user.name,
          fecha: new Date().toISOString().replace('T', ' ').slice(0, 16),
          cambios: notes || `Etapa de flujo actualizada a: ${updatedStage}`,
          estado: newStatus
        };
        const updatedDoc = {
          ...d,
          estado: newStatus,
          workflowStage: updatedStage,
          historial: [newHistorialEntry, ...(d.historial || [])]
        };

        // Async API sync
        updateDocumentApi(docId, updatedDoc);

        return updatedDoc;
      }
      return d;
    }));

    const updateLog = {
      id: `log-${Date.now()}`,
      usuario: user.name,
      accion: `Actualizó proceso de expediente ${docId} a "${newStage || newStatus}"`,
      documento: docId,
      fecha: new Date().toISOString().replace('T', ' ').slice(0, 16),
      ip: '192.168.1.104',
      resultado: 'Exitoso'
    };
    setAuditLogs(prev => [updateLog, ...prev]);

    showToast(`Proceso guardado exitosamente: ${newStage || newStatus}`, 'success');
  };

  const toggleFavorite = (docId) => {
    setDocuments(prev => prev.map(d => d.id === docId ? { ...d, favorito: !d.favorito } : d));
  };

  const deleteDocument = (docId) => {
    const doc = documents.find(d => d.id === docId);
    setDocuments(prev => prev.filter(d => d.id !== docId));

    const deleteLog = {
      id: `log-${Date.now()}`,
      usuario: user.name,
      accion: `Eliminó el expediente "${doc?.nombre || docId}"`,
      documento: docId,
      fecha: new Date().toISOString().replace('T', ' ').slice(0, 16),
      ip: '192.168.1.104',
      resultado: 'Exitoso'
    };
    setAuditLogs(prev => [deleteLog, ...prev]);

    showToast(`Expediente "${doc?.nombre || docId}" eliminado`, 'warning');
  };

  const markAllNotifsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, leido: true })));
    showToast('Notificaciones marcadas como leídas', 'info');
  };

  const updateUser = (updatedUser) => {
    setUsersList(prev => prev.map(u => u.id === updatedUser.id ? { ...u, ...updatedUser } : u));
    showToast(`Usuario "${updatedUser.name}" actualizado correctamente (Rol: ${updatedUser.role})`, 'success');
  };

  return (
    <AppContext.Provider value={{
      theme,
      toggleTheme,
      user,
      setUser,
      usersList,
      setUsersList,
      addUser,
      updateUser,
      toggleUserStatus,
      deleteUser,
      updateUserAvatar,
      isAuthenticated,
      login,
      logout,
      activeTab,
      setActiveTab,
      documents,
      visibleDocuments,
      selectedDoc,
      setSelectedDoc,
      compareDocs,
      setCompareDocs,
      isUploadOpen,
      setIsUploadOpen,
      searchQuery,
      setSearchQuery,
      notifications,
      isNotifOpen,
      setIsNotifOpen,
      markAllNotifsRead,
      auditLogs,
      toast,
      showToast,
      addDocument,
      updateDocumentStatus,
      toggleFavorite,
      deleteDocument
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
