import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BannerComponent } from '../homepage/banner/banner.component';
import { CourseCardComponent } from '../homepage/course-card/course-card.component';
import { BlogCardComponent } from '../blogs/blog-card/blog-card.component';
import { SerachBarComponent } from '../homepage/search-bar/serach-bar.component';
import { HomePageService } from '../courses/services/home-page.service';
import { BlogsService } from '../blogs/services/blogs.service';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [
    CommonModule,
    BannerComponent,
    CourseCardComponent,
    BlogCardComponent,
    SerachBarComponent,
  ],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.scss',
})
export class FavoritesComponent implements OnInit {
  activeTab = signal<'courses' | 'blogs'>('courses');
  private homeService = inject(HomePageService);
  private blogService = inject(BlogsService);
  course$=this.homeService.getCourses();
  blogs$=this.blogService.getBlogs();
  ngOnInit(): void {
    
  }
  setActiveTab(tab: 'courses' | 'blogs') {
    this.activeTab.set(tab);
  }
}
