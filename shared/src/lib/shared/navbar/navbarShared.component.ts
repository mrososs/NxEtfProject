import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import {
  Component,
  ElementRef,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import Collapse from 'bootstrap/js/dist/collapse';
import { LangService } from '../../services/lang.service';
import { NavigationService } from '../navigation/navigation.service';
import { AuthService } from '@auth0/auth0-angular';
import { SSOService } from '../../auth/sso/sso.service';

@Component({
  selector: 'etf-navbar',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarSharedComponent implements OnInit, OnDestroy {
  resourcePath = 'navbar.';
  isScrolled = false;
  isAuthenticated$: any;
  themes = [
    { class: 'theme-orange-yellow', color: '#f7931d' },
    { class: 'theme-green-cyan', color: '#71bf44' },
    { class: 'theme-cyan', color: '#1cbfdf' },
    { class: 'theme-purple', color: '#c5499b' },
  ];

  private langService = inject(LangService);
  public navigationService = inject(NavigationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  constructor(private auth: AuthService, private ssoService: SSOService) {}

  @ViewChild('navbarCollapse') navbarCollapse!: ElementRef;

  ngOnInit(): void {
    window.addEventListener('scroll', this.onScroll, true);
    this.isAuthenticated$ = this.auth.isAuthenticated$;

    // Force a silent authentication check to update isAuthenticated$
    this.auth.getAccessTokenSilently().subscribe({
      next: (token) => {
        console.log('Silent authentication successful, token:', token);
      },
      error: (err) => {
        console.log('Silent authentication failed:', err);
        // If silent auth fails, the user is not logged in, so isAuthenticated$ will be false
      },
    });

    // Handle redirect to LMS after login
    this.auth.appState$.subscribe((appState) => {
      if (appState?.['target'] === '/redirect-to-lms') {
        this.auth.getAccessTokenSilently().subscribe((token) => {
          this.ssoService.redirectTo('LMS', token);
        });
      }
    });
  }
  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.onScroll, true);
  }
  @HostListener('window:scroll', [])
  onScroll = () => {
    this.isScrolled = window.scrollY > 50;
  };
  stateIsValid(state: string | null): boolean {
    const storedState = localStorage.getItem('sso_state');
    return state !== null && storedState !== null && state === storedState;
  }
  extractTokenFromUrl(): string | null {
    const params = new URLSearchParams(window.location.search);
    return params.get('token');
  }
  login() {
    const state = this.generateRandomState();
    this.auth.loginWithRedirect({
      authorizationParams: {
        redirect_uri: window.location.origin,
        state: state,
        appState: {
          target: '/redirect-to-lms', // إشارة لإعادة التوجيه بعد تسجيل الدخول
        },
        scope: 'openid profile email',
      },
    });
  }
  generateRandomState(): string {
    const state = crypto.randomUUID(); // أو أي random string
    localStorage.setItem('sso_state', state);
    return state;
  }

  logout() {
    this.auth.logout({
      logoutParams: {
        returnTo: 'https://localhost:4200', // Redirect to News after logout
      },
    });
  }
  closeNavbar() {
    const collapseEl = this.navbarCollapse?.nativeElement;
    if (collapseEl && window.innerWidth < 992) {
      let bsCollapse = Collapse.getInstance(collapseEl);
      if (!bsCollapse) {
        bsCollapse = new Collapse(collapseEl);
      }
      bsCollapse.hide();
    }
  }
  checkIfRouteActive(projectKey: string, routeKey: string): boolean {
    return this.navigationService.isRouteActive(
      projectKey as 'news' | 'lms',
      routeKey
    );
  }

  // ✅ يستخدم service للتنقل عبر المشاريع
  navigateToProject(projectKey: string, routeKey: string) {
    this.navigationService.navigateTo(projectKey as 'news' | 'lms', routeKey);
    this.closeNavbar();
  }

  changeTheme(themeClass: string) {
    document.body.className = '';
    document.body.classList.add(themeClass);
    localStorage.setItem('theme', themeClass);
  }

  changeLang(lang: string) {
    this.langService.setLang(lang);
    this.closeNavbar();
  }

  get currentLang(): string {
    return this.langService.currentLang;
  }
}
