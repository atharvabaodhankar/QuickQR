export const getBackendUrl = () => {
  return import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
};