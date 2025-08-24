import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BannerComponent } from '../homepage/banner/banner.component';
import { BlogsService } from './services/blogs.service';
import { BlogCardComponent } from './blog-card/blog-card.component';
import { BlogPost } from './model/blog.model';
import { catchError, finalize, of, BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-blogs',
  standalone: true,
  imports: [CommonModule, BannerComponent, BlogCardComponent],
  templateUrl: './blogs.component.html',
  styleUrl: './blogs.component.scss',
})
export class BlogsComponent implements OnInit {
  private blogService = inject(BlogsService);
  private blogsSubject = new BehaviorSubject<BlogPost[]>([]);
  blog$ = this.blogsSubject.asObservable();
  loading = true;
  error = false;

  ngOnInit(): void {
    console.log('Loading blogs from API...');
    this.loadBlogs();
  }

  loadBlogs(): void {
    this.loading = true;
    this.error = false;

    this.blogService
      .getBlogs()
      .pipe(
        finalize(() => (this.loading = false)),
        catchError((err) => {
          console.error('Error loading blogs:', err);
          this.error = true;
          return of([]);
        })
      )
      .subscribe((blogs) => {
        this.blogsSubject.next(blogs);
      });
  }
}
