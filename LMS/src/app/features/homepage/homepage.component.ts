import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseCardComponent } from './course-card/course-card.component';
import { SerachBarComponent } from './search-bar/serach-bar.component';
import { BannerComponent } from './banner/banner.component';
import { CourseCategoryComponent } from './course-category/course-category.component';
import { CourseLevelComponent } from './course-level/course-level.component';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { CourseInstructorComponent } from './course-instructor/course-instructor.component';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [
    CommonModule,
    CourseCardComponent,
    SerachBarComponent,
    BannerComponent,
    CourseCategoryComponent,
    CourseLevelComponent,
    CourseInstructorComponent,
  ],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.scss',
})
export class HomepageComponent implements AfterViewInit {
  searchTerm: string = '';
  selectedCategories: string[] = [];
  private searchSubject = new Subject<string>();
  firstCategorySelected = false;

  @ViewChild('categorySection') categorySectionRef!: ElementRef;
  @ViewChild('searchSection') searchSectionRef!: ElementRef;
  ngAfterViewInit() {
    this.searchSubject.pipe(debounceTime(3000)).subscribe((term) => {
      this.searchTerm = term;
      if (this.searchSectionRef) {
        this.searchSectionRef.nativeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    });
  }
  onSearchSectionChange(term: string) {
    this.searchSubject.next(term); // send value to subject
  }

onCategoryChange(selected: string[]) {
  const hadNoSelectionBefore = this.selectedCategories.length === 0;
  this.selectedCategories = selected;

  // Only scroll if the user added the *first* selection
  if (hadNoSelectionBefore && selected.length > 0 && !this.firstCategorySelected) {
    this.firstCategorySelected = true;
    setTimeout(() => {
      if (this.categorySectionRef) {
        this.categorySectionRef.nativeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    }, 100);
  }

  // Reset scroll flag if all unchecked
  if (selected.length === 0) {
    this.firstCategorySelected = false;
  }
}
}
