import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ProfileService } from '../../features/profile/profile.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProfileRequiredService {
  private showDialogSubject = new BehaviorSubject<boolean>(false);
  public showDialog$ = this.showDialogSubject.asObservable();

  constructor(private profileService: ProfileService) {}

  /**
   * Check if user can access a protected feature
   */
  canAccessFeature(): Observable<boolean> {
    return this.profileService.hasProfile();
  }

  /**
   * Show profile required dialog
   */
  showProfileRequiredDialog(): void {
    this.showDialogSubject.next(true);
  }

  /**
   * Hide profile required dialog
   */
  hideProfileRequiredDialog(): void {
    this.showDialogSubject.next(false);
  }

  /**
   * Check if user has profile and show dialog if not
   */
  checkProfileAndShowDialog(): Observable<boolean> {
    return this.profileService.hasProfile().pipe(
      map(hasProfile => {
        if (!hasProfile) {
          this.showProfileRequiredDialog();
        }
        return hasProfile;
      })
    );
  }
} 