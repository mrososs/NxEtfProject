import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { types } from '../model/types.model';
import { Course } from '../model/course.model';
import { Instructor } from '../model/instructor.model';

@Injectable({
  providedIn: 'root',
})
export class HomePageService {
  private _http = inject(HttpClient);
  getTypes(): Observable<types[]> {
    return this._http.get<types[]>('../../../../assets/data/types.data.json');
  }
  getCourses(): Observable<Course[]> {
    return this._http
      .get<{ courses: Course[] }>('../../../../assets/data/courses.data.json')
      .pipe(
        map((response) => response.courses) // Extract the courses array
      );
  }
  getInstructors(): Observable<Instructor[]> {
    return this._http
      .get<{ instructors: Instructor[] }>(
        '../../../../assets/data/instructor.data.json'
      )
      .pipe(
        map((response) => response.instructors) // Extract the courses array
      );
  }
}
