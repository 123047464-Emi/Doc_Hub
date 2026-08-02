import { Platform } from 'react-native';

const getHost = () => {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.hostname) {
    return window.location.hostname;
  }
  return process.env.EXPO_PUBLIC_API_HOST || 'localhost';
};

export const API_HOST = getHost();
export const API_PORT = process.env.EXPO_PUBLIC_API_PORT || '3000';
export const API_PROTOCOL = process.env.EXPO_PUBLIC_API_PROTOCOL || 'http';

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || `${API_PROTOCOL}://${API_HOST}:${API_PORT}`;

export const API_KEY = process.env.EXPO_PUBLIC_API_KEY || '123456apikey';
