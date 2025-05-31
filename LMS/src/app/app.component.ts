import { NavbarSharedComponent } from 'shared/src/lib/shared/navbar/navbarShared.component';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NavigationService } from 'shared/src/lib/shared/navigation/navigation.service';
import { SSOLmsService } from 'shared/src/lib/auth/sso/sso-lms.service';

@Component({
  standalone: true,
  imports: [RouterModule, NavbarSharedComponent, TranslateModule],
  providers: [NavigationService],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'LMS';
  storgeServiceSSOState = localStorage.getItem('sso_state')
  constructor(
    private translate: TranslateService,
    private ssoLmsService: SSOLmsService
  ) {
    translate.setDefaultLang('en');
    translate.use('en'); // أو 'ar' حسب الحاجة
  }
  ngOnInit(): void {
    if (this.storgeServiceSSOState) {
      this.ssoLmsService.handleAuthCallback();
    }
  }
}
