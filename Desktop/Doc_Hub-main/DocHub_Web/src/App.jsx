// src/App.jsx
import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import Toast from './components/common/Toast';
import UploadModal from './components/document/UploadModal';
import DocumentViewerModal from './components/document/DocumentViewerModal';
import VersionComparatorModal from './components/document/VersionComparatorModal';
import { ShieldAlert, Lock, ArrowRight } from 'lucide-react';

// Views
import LoginView from './views/LoginView';
import DashboardView from './views/DashboardView';
import DocumentosView from './views/DocumentosView';
import VersionControlView from './views/VersionControlView';
import ApprovalWorkflowView from './views/ApprovalWorkflowView';
import DigitalSignatureView from './views/DigitalSignatureView';
import UsersView from './views/UsersView';
import RolesPermissionsView from './views/RolesPermissionsView';
import AuditView from './views/AuditView';
import ReportsView from './views/ReportsView';
import SettingsView from './views/SettingsView';

function AccessRestrictedBanner({ tabName }) {
  const { setActiveTab } = useApp();
  return (
    <div className="card-glass animate-fade-in" style={{ padding: '48px 32px', textAlign: 'center', maxWidth: '600px', margin: '40px auto' }}>
      <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--warning-bg)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
        <Lock size={32} />
      </div>
      <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
        Acceso Reservado al Administrador
      </h3>
      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
        El módulo <strong>{tabName}</strong> requiere privilegios de <strong>Administrador / Titular del Despacho</strong>. Tu rol actual es para consulta y firma notarial.
      </p>
      <button className="btn btn-primary" onClick={() => setActiveTab('documentos')}>
        Ir a Gestión de Documentos <ArrowRight size={16} />
      </button>
    </div>
  );
}

function MainContent() {
  const { activeTab, isAuthenticated, user } = useApp();

  if (!isAuthenticated) {
    return (
      <>
        <LoginView />
        <Toast />
      </>
    );
  }

  const isAdmin = user?.role === 'Administrador';

  const renderView = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardView />;
      case 'documentos': return <DocumentosView />;
      case 'version_control': return <VersionControlView />;
      case 'flujo_aprobacion': return <ApprovalWorkflowView />;
      case 'firmas': return <DigitalSignatureView />;
      case 'usuarios':
        return isAdmin ? <UsersView /> : <AccessRestrictedBanner tabName="Gestión de Usuarios" />;
      case 'roles':
        return isAdmin ? <RolesPermissionsView /> : <AccessRestrictedBanner tabName="Roles y Permisos" />;
      case 'auditoria':
        return isAdmin ? <AuditView /> : <AccessRestrictedBanner tabName="Auditoría Judicial" />;
      case 'reportes': return <ReportsView />;
      case 'configuracion': return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-app)' }}>
      {/* Fixed Left Sidebar */}
      <Sidebar />

      {/* Main Wrapper */}
      <div style={{ flex: 1, marginLeft: '280px', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Fixed Top Bar */}
        <TopBar />

        {/* View Scrollable Workspace Container */}
        <main style={{ marginTop: '70px', padding: '32px 36px', minHeight: 'calc(100vh - 70px)', overflowY: 'auto' }}>
          {renderView()}
        </main>
      </div>

      {/* Modals & Popups */}
      <UploadModal />
      <DocumentViewerModal />
      <VersionComparatorModal />
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
