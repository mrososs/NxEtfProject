import { Component, inject, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { filter, map, mergeMap } from 'rxjs/operators';
import { NavigationService } from 'shared/src/lib/shared/navigation/navigation.service';
import { SSONewsService } from 'shared/src/lib/auth/sso/sso-news.service';
import { SSOService } from 'shared/src/lib/auth/sso/sso.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  providers: [NavigationService],
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'etf-app';
    storgeServiceSSOState = localStorage.getItem('sso_state')


  private _titleService = inject(Title);
  private _router = inject(Router);
  private _ssoNewsService = inject(SSONewsService);
  private _activatedRoute = inject(ActivatedRoute);
  private _ssoService = inject(SSOService);

  constructor() {
    this._router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => {
          let route = this._activatedRoute;
          while (route.firstChild) route = route.firstChild;
          return route;
        }),
        mergeMap((route) => route.data)
      )
      .subscribe((data) => {
        if (data['title']) {
          this._titleService.setTitle(data['title']);
        }
      });
  }
  ngOnInit(): void {
    if(this.storgeServiceSSOState){
      const token = '';
      this._ssoService.redirectTo('LMS',token)
    }
  }
}
