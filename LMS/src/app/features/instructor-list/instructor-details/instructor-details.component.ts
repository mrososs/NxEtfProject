import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HomePageService } from '../../courses/services/home-page.service';
import { BannerComponent } from '../../homepage/banner/banner.component';
import { Instructor } from '../../courses/model/instructor.model';

@Component({
  selector: 'app-instructor-details',
  standalone: true,
  imports: [CommonModule, BannerComponent],
  templateUrl: './instructor-details.component.html',
  styleUrl: './instructor-details.component.scss',
})
export class InstructorDetailsComponent implements OnInit {
  instructor!: Instructor | undefined;

  private route = inject(ActivatedRoute);
  private homepageService = inject(HomePageService);

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      if (id) {
        this.loadInstructorById(id);
      }
    });
  }

  loadInstructorById(id: number) {
    this.homepageService.getInstructorDetails(id).subscribe((inst) => {
      this.instructor = inst;
      console.log(this.instructor);
    });
  }
}
