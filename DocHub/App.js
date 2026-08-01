// App.js
// Punto de entrada de la aplicaciÃ³n.
// Controla el estado de autenticaciÃ³n (simulado) y monta el navegador principal.

import React, { useState } from 'react';
import { StatusBar } from 'react-native';
import LoginScreen from './screens/auth/LoginScreen';
import RecuperarPasswordScreen from './screens/auth/RecuperarPasswordScreen';
import AppNavigator from './navigation/AppNavigator';
import colors from './theme/colors';
import { logout } from './services/api';

export default function App() {
  const [user, setUser] = useState(null);
  const [authScreen, setAuthScreen] = useState('login'); // 'login' | 'recuperar'

  const handleLoginSuccess = (foundUser) => setUser(foundUser);
  const handleUserUpdate = (updatedUser) => setUser((current) => ({ ...current, ...updatedUser }));
  const handleLogout = async () => {
    await logout();
    setUser(null);
    setAuthScreen('login');
  };

  if (!user) {
    if (authScreen === 'recuperar') {
      return (
        <>
          <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
          <RecuperarPasswordScreen onBack={() => setAuthScreen('login')} />
        </>
      );
    }
    return (
      <>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <LoginScreen onLoginSuccess={handleLoginSuccess} onGoToRecover={() => setAuthScreen('recuperar')} />
      </>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />
      <AppNavigator user={user} onLogout={handleLogout} onUserUpdate={handleUserUpdate} />
    </>
  );
}

