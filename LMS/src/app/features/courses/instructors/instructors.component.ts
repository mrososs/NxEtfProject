import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { HomePageService } from '../services/home-page.service';
import { Instructor } from '../model/instructor.model';
import { InstructorCardComponent } from '../../instructor-list/instructor-card/instructor-card.component';

@Component({
  selector: 'app-instructors',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule,InstructorCardComponent],
  templateUrl: './instructors.component.html',
  styleUrl: './instructors.component.scss',
})
export class InstructorsComponent implements OnInit {
  private _homePageService = inject(HomePageService);
  instructorsData$ = this._homePageService.getInstructors();
  ngOnInit(): void {
    console.log(this.instructorsData$);
  }
}
