import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { Instructor } from '../../courses/model/instructor.model';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-instructor-card',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, RouterModule],
  templateUrl: './instructor-card.component.html',
  styleUrl: './instructor-card.component.scss',
})
export class InstructorCardComponent {
  @Input() instructor!: Instructor;
}
