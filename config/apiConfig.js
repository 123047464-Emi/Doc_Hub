const DEFAULT_API_HOST = '10.120.166.147';
const DEFAULT_API_PORT = '3000';
const DEFAULT_API_PROTOCOL = 'http';

export const API_HOST = process.env.EXPO_PUBLIC_API_HOST || DEFAULT_API_HOST;
export const API_PORT = process.env.EXPO_PUBLIC_API_PORT || DEFAULT_API_PORT;
export const API_PROTOCOL = process.env.EXPO_PUBLIC_API_PROTOCOL || DEFAULT_API_PROTOCOL;

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || `${API_PROTOCOL}://${API_HOST}:${API_PORT}`;

export const API_KEY = process.env.EXPO_PUBLIC_API_KEY || '123456apikey';
