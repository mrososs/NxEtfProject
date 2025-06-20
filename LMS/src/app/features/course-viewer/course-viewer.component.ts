import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-course-viewer',
  standalone: true,
  imports: [],
  templateUrl: './course-viewer.component.html',
  styleUrl: './course-viewer.component.scss',
})
export class CourseViewerComponent {
  courseUrl: SafeResourceUrl;

  constructor(private route: ActivatedRoute, private sanitizer: DomSanitizer) {
    const folder = this.route.snapshot.queryParamMap.get('folder');
    const path = folder
      ? `/assets/courses/${folder}/scormcontent/index.html`
      : '/assets/courses/2022_communications-التواصل-scorm12-MU2W_ngE/scormcontent/index.html';

    this.courseUrl = this.sanitizer.bypassSecurityTrustResourceUrl(path);
  }
}
