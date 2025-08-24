import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BannerComponent } from '../../homepage/banner/banner.component';
import { BlogPost } from '../model/blog.model';
import { ActivatedRoute } from '@angular/router';
import { BlogsService } from '../services/blogs.service';
import { BlogSearchComponent } from '../blog-search/blog-search.component';
import { CardModule } from 'primeng/card';
import { AvatarModule } from 'primeng/avatar';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-blog-details',
  standalone: true,
  imports: [
    CommonModule,
    BannerComponent,
    BlogSearchComponent,
    CardModule,
    AvatarModule,
    TagModule,
    DividerModule,
    ButtonModule,
  ],
  templateUrl: './blog-details.component.html',
  styleUrl: './blog-details.component.scss',
})
export class BlogDetailsComponent implements OnInit {
  blog!: BlogPost;
  loading = true;
  error = false;

  private route = inject(ActivatedRoute);
  private blogService = inject(BlogsService);

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');
      if (slug) {
        this.loadBlog(slug);
      }
    });
  }

  loadBlog(slug: string) {
    this.loading = true;
    this.error = false;

    this.blogService.getBlogDetails('blog', slug).subscribe({
      next: (blog) => {
        this.blog = blog;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading blog:', err);
        this.error = true;
        this.loading = false;
      },
    });
  }

  // Helper method to format date
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  // Helper method to get reading time estimate
  getReadingTime(): string {
    const plainText = this.blog.content.replace(/<[^>]*>/g, '');
    const wordsPerMinute = 200;
    const words = plainText.split(' ').length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} دقيقة للقراءة`;
  }

  // Helper method to get category/tag
  getCategory(): string {
    return 'مقالات عامة';
  }
}
