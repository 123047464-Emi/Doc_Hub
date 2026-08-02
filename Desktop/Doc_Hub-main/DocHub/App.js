// App.js
// Punto de entrada de la aplicación móvil DocHub.
// Controla la sesión del usuario con la API principal en tiempo real.

import React, { useState, useEffect } from 'react';
import { StatusBar } from 'react-native';
import LoginScreen from './screens/auth/LoginScreen';
import RecuperarPasswordScreen from './screens/auth/RecuperarPasswordScreen';
import AppNavigator from './navigation/AppNavigator';
import colors from './theme/colors';
import { logout, getMe, setOnUnauthorized } from './services/api';

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

  useEffect(() => {
    setOnUnauthorized(() => {
      setUser(null);
      setAuthScreen('login');
    });
  }, []);

  // Real-time session status polling to detect if user was deleted or disabled
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(async () => {
      try {
        await getMe();
      } catch (err) {
        // If API returns 401 Unauthorized or user deleted, log out instantly
        if (err?.message?.includes('401') || err?.message?.includes('Usuario no encontrado')) {
          handleLogout();
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [user]);

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
