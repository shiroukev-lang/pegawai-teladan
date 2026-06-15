const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const PREFIX = '/make-server-ea54a030';

export const getApiUrl = (endpoint: string): string =>
  `${BASE_URL}${PREFIX}${endpoint}`;

export const getHeaders = (): HeadersInit => ({
  'Content-Type': 'application/json',
});
