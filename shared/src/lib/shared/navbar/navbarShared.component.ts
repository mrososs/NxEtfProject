import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import {
  Component,
  ElementRef,
  HostListener,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import Collapse from 'bootstrap/js/dist/collapse';
import { LangService } from '../../services/lang.service';
import { NavigationService } from '../navigation/navigation.service';

@Component({
  selector: 'etf-navbar',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarSharedComponent implements OnInit {
  resourcePath = 'navbar.';
  isScrolled = false;

  themes = [
    { class: 'theme-orange-yellow', color: '#f7931d' },
    { class: 'theme-green-cyan', color: '#71bf44' },
    { class: 'theme-cyan', color: '#1cbfdf' },
    { class: 'theme-purple', color: '#c5499b' },
  ];

  private langService = inject(LangService);
  public navigationService = inject(NavigationService);

  @ViewChild('navbarCollapse') navbarCollapse!: ElementRef;

  ngOnInit(): void {
    window.addEventListener('scroll', this.onScroll, true);
  }

  @HostListener('window:scroll', [])
  onScroll = () => {
    this.isScrolled = window.scrollY > 50;
  };

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
