// src/app/core/services/lang.service.ts
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class LangService {
  constructor(private translate: TranslateService) {
    this.translate.addLangs(['en', 'ar']);
    this.translate.setDefaultLang('ar');

    const savedLang = localStorage.getItem('lang') || 'ar';
    this.setLang(savedLang);
  }

  setLang(lang: string) {
    this.translate.use(lang);
    localStorage.setItem('lang', lang);

    const html = document.documentElement;
    if (lang === 'ar') {
      html.setAttribute('dir', 'rtl');
      html.setAttribute('lang', 'ar');
    } else {
      html.setAttribute('dir', 'ltr');
      html.setAttribute('lang', 'en');
    }
  }

  get currentLang() {
    return this.translate.currentLang;
  }
}
