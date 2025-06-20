import { NavbarSharedComponent } from 'shared/src/lib/shared/navbar/navbarShared.component';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {NavigationService} from 'shared/src/lib/shared/navigation/navigation.service';
import { NavbarComponent } from './shared/components/navbar/navbar.component';

@Component({
  standalone: true,
  imports: [RouterModule, NavbarComponent, TranslateModule],
  providers: [NavigationService],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'LMS';
  constructor(private translate: TranslateService) {
  translate.setDefaultLang('en');
  translate.use('en'); // أو 'ar' حسب الحاجة
}
}
