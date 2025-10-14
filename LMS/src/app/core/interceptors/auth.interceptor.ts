import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SessionExpiryService } from '../services/session-expiry.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const sessionExpiryService = inject(SessionExpiryService);

  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    // Handle token from URL parameters on app startup
    handleTokenFromUrl(sessionExpiryService);
  }

  // Get token from localStorage
  const token = getTokenFromStorage();

  // Clone the request and add credentials and authorization header
  const authReq = req.clone({
    headers: token
      ? req.headers.set('Authorization', `Bearer ${token}`)
      : req.headers,
  });

  return next(authReq);
};

/**
 * Handle token from URL parameters when application starts
 * This function checks for token in URL params and saves it to localStorage
 */
function handleTokenFromUrl(sessionExpiryService: SessionExpiryService): void {
  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const tokenFromUrl =
    urlParams.get('token') ||
    urlParams.get('access_token') ||
    urlParams.get('auth_token');

  if (tokenFromUrl) {
    console.log('Token found in URL parameters, saving to localStorage');

    // Save token to localStorage with multiple keys for compatibility
    localStorage.setItem('authToken', tokenFromUrl);
    localStorage.setItem('token', tokenFromUrl);
    localStorage.setItem('accessToken', tokenFromUrl);
    localStorage.setItem('auth_token', tokenFromUrl); // Match external app key

    // Save login timestamp for session expiry tracking
    sessionExpiryService.saveLoginTimestamp();

    // Clean up URL by removing token parameter
    // This prevents the token from being visible in browser history
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.delete('token');
    newUrl.searchParams.delete('access_token');
    newUrl.searchParams.delete('auth_token');

    // Replace current URL without token parameters
    window.history.replaceState({}, document.title, newUrl.toString());

    console.log('Token saved and URL cleaned up');
  }
}

/**
 * Get authentication token from localStorage
 * @returns Token string or null if not found
 */
function getTokenFromStorage(): string | null {
  // Check localStorage for token (including auth_token from external app)
  return (
    localStorage.getItem('authToken') ||
    localStorage.getItem('token') ||
    localStorage.getItem('accessToken') ||
    localStorage.getItem('auth_token') // Match the key used by external app
  );
}
