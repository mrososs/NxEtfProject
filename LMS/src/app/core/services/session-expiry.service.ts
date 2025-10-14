import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SessionExpiryService {
  private readonly LOGIN_TIMESTAMP_KEY = 'loginTimestamp';
  private readonly SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  private readonly LOGIN_URL =
    'https://etfwebsite-gcf6ggathwd6ehgv.canadacentral-01.azurewebsites.net/landing-page/login';

  /**
   * Save login timestamp to localStorage when user logs in
   */
  saveLoginTimestamp(): void {
    const timestamp = Date.now().toString();
    localStorage.setItem(this.LOGIN_TIMESTAMP_KEY, timestamp);
    console.log('Login timestamp saved:', new Date(Date.now()).toISOString());
  }

  /**
   * Check if session has expired (more than 24 hours since login)
   * @returns true if session expired, false otherwise
   */
  isSessionExpired(): boolean {
    const loginTimestamp = localStorage.getItem(this.LOGIN_TIMESTAMP_KEY);

    // If no timestamp exists, consider session as expired
    if (!loginTimestamp) {
      console.log('No login timestamp found');
      return false; // Don't treat missing timestamp as expired
    }

    const loginTime = parseInt(loginTimestamp, 10);
    const currentTime = Date.now();
    const timeDifference = currentTime - loginTime;

    const isExpired = timeDifference >= this.SESSION_DURATION_MS;

    if (isExpired) {
      console.log(
        `Session expired. Login time: ${new Date(
          loginTime
        ).toISOString()}, Current time: ${new Date(currentTime).toISOString()}`
      );
    }

    return isExpired;
  }

  /**
   * Clear session data and redirect to login page
   */
  handleExpiredSession(): void {
    console.log('Handling expired session - clearing storage and redirecting');

    // Clear all localStorage
    localStorage.clear();

    // Clear sessionStorage
    sessionStorage.clear();

    // Clear all cookies
    this.clearAllCookies();

    // Redirect to login page
    window.location.href = this.LOGIN_URL;
  }

  /**
   * Clear login timestamp from localStorage
   */
  clearLoginTimestamp(): void {
    localStorage.removeItem(this.LOGIN_TIMESTAMP_KEY);
    console.log('Login timestamp cleared');
  }

  /**
   * Clear all cookies from the domain
   */
  private clearAllCookies(): void {
    const cookies = document.cookie.split(';');

    cookies.forEach((cookie) => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();

      // Clear cookie with different path options
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
    });
  }

  /**
   * Check session expiry and handle if expired
   * @returns true if session is valid, false if expired
   */
  checkAndHandleSessionExpiry(): boolean {
    if (this.isSessionExpired()) {
      this.handleExpiredSession();
      return false;
    }
    return true;
  }

  /**
   * Get remaining time until session expires
   * @returns remaining time in milliseconds, or null if no session
   */
  getRemainingTime(): number | null {
    const loginTimestamp = localStorage.getItem(this.LOGIN_TIMESTAMP_KEY);

    if (!loginTimestamp) {
      return null;
    }

    const loginTime = parseInt(loginTimestamp, 10);
    const currentTime = Date.now();
    const elapsedTime = currentTime - loginTime;
    const remainingTime = this.SESSION_DURATION_MS - elapsedTime;

    return remainingTime > 0 ? remainingTime : 0;
  }
}
