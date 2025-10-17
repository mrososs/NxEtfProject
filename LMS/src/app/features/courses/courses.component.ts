import { DreamsComponent } from './dreams/dreams.component';
import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopBannerComponent } from './top-banner/top-banner.component';
import { LogoBannerComponent } from './logo-banner/logo-banner.component';
import { TypesComponent } from './types/types.component';
import { TrainingCourseComponent } from './Training-course/Training-course.component';
import { InstructorsComponent } from './instructors/instructors.component';
import { gsap } from 'gsap';
import { MissionVisionService } from './services/mission-vision.service';
import { MissionVision } from './model/mission-vision.model';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [
    CommonModule,
    TopBannerComponent,
    DreamsComponent,
    LogoBannerComponent,
    TypesComponent,
    TrainingCourseComponent,
    InstructorsComponent,
  ],
  templateUrl: './courses.component.html',
  styleUrl: './courses.component.scss',
})
export class CoursesComponent implements OnInit {
  private missionVisionService = inject(MissionVisionService);
  missionVision = signal<MissionVision | null>(null);
  ngOnInit(): void {
    this.missionVisionService.getMissionVision().subscribe((data) => {
      this.missionVision.set(data);
    });
  }
}
