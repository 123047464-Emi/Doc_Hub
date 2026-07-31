// App.js
// Punto de entrada de la aplicación.
// Controla el estado de autenticación (simulado) y monta el navegador principal.

import React, { useState } from 'react';
import { StatusBar } from 'react-native';
import LoginScreen from './screens/auth/LoginScreen';
import RecuperarPasswordScreen from './screens/auth/RecuperarPasswordScreen';
import AppNavigator from './navigation/AppNavigator';
import colors from './theme/colors';

export default function App() {
  const [user, setUser] = useState(null);
  const [authScreen, setAuthScreen] = useState('login'); // 'login' | 'recuperar'

  const handleLoginSuccess = (foundUser) => setUser(foundUser);
  const handleLogout = () => {
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
      <AppNavigator user={user} onLogout={handleLogout} />
    </>
  );
}
