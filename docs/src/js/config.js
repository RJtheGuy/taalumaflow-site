export const BACKEND_URL = 'https://back-unto-intensity-medline.trycloudflare.com';

export const PUBLIC_API = {
  extract : `${BACKEND_URL}/api/public/extract/`,
  chat    : `${BACKEND_URL}/api/public/chat/`,
  health  : `${BACKEND_URL}/api/public/health/`,
};

export const IS_BACKEND_CONFIGURED = Boolean(BACKEND_URL);
