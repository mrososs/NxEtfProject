import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router, NavigationStart } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ErrorStateService {
  private isOnErrorPageSubject = new BehaviorSubject<boolean>(false);
  public isOnErrorPage$ = this.isOnErrorPageSubject.asObservable();

  constructor(private router: Router) {
    // Check if we're on error page on service initialization
    this.checkIfOnErrorPage();

    // Listen to navigation events to monitor routing from error page
    this.router.events
      .pipe(filter((event) => event instanceof NavigationStart))
      .subscribe((event: NavigationStart) => {
        if (this.getCurrentErrorState() && event.url !== '/error-500') {
          // Log navigation attempt from error page
          console.log('Navigation attempt from error page to:', event.url);
          // The guard will handle blocking the navigation
        }
      });
  }

  /**
   * Check if current page is error-500
   */
  private checkIfOnErrorPage(): void {
    const isOnErrorPage = window.location.pathname === '/error-500';
    this.isOnErrorPageSubject.next(isOnErrorPage);
  }

  /**
   * Set error state
   */
  setErrorState(isError: boolean): void {
    this.isOnErrorPageSubject.next(isError);
  }

  /**
   * Get current error state
   */
  getCurrentErrorState(): boolean {
    return this.isOnErrorPageSubject.value;
  }

  /**
   * Check if we should skip API calls
   */
  shouldSkipApiCalls(): boolean {
    return (
      this.getCurrentErrorState() || window.location.pathname === '/error-500'
    );
  }

  /**
   * Check if navigation should be blocked
   */
  shouldBlockNavigation(): boolean {
    return this.getCurrentErrorState();
  }

  /**
   * Force navigation to error page (used when redirecting to error-500)
   */
  forceNavigateToError(): void {
    this.setErrorState(true);
    window.location.href = '/error-500';
  }
}
