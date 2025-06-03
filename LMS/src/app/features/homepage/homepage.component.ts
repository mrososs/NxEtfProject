import { AfterViewInit, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseCardComponent } from './course-card/course-card.component';
import { gsap } from 'gsap';
import { SerachBarComponent } from './search-bar/serach-bar.component';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, CourseCardComponent,SerachBarComponent],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.scss',
})
export class HomepageComponent implements AfterViewInit {
  ngAfterViewInit() {}
}
