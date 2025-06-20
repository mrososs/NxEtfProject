import { Component, inject } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { BannerComponent } from '../homepage/banner/banner.component';
import { HomePageService } from '../courses/services/home-page.service';
import { InstructorCardComponent } from './instructor-card/instructor-card.component';

@Component({
  selector: 'app-instructor-list',
  standalone: true,
  imports: [CommonModule, BannerComponent, InstructorCardComponent, AsyncPipe],
  templateUrl: './instructor-list.component.html',
  styleUrl: './instructor-list.component.scss',
})
export class InstructorListComponent {
  private _homePageService = inject(HomePageService);
  instructorsData$ = this._homePageService.getInstructors();
}
