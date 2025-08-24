import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { blog, BlogPost } from '../model/blog.model';

@Component({
  selector: 'app-blog-card',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    RouterModule,
    TagModule,
    AvatarModule,
    AvatarGroupModule,
  ],
  templateUrl: './blog-card.component.html',
  styleUrl: './blog-card.component.scss',
})
export class BlogCardComponent {
  @Input() blog!: BlogPost;

  // Helper method to format date
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  // Helper method to get excerpt or truncated content
  getExcerpt(): string {
    if (this.blog.excerpt) {
      return this.blog.excerpt;
    }

    // Remove HTML tags and get first 150 characters
    const plainText = this.blog.content.replace(/<[^>]*>/g, '');
    return plainText.length > 150
      ? plainText.substring(0, 150) + '...'
      : plainText;
  }

  // Helper method to get reading time estimate
  getReadingTime(): string {
    const plainText = this.blog.content.replace(/<[^>]*>/g, '');
    const wordsPerMinute = 200;
    const words = plainText.split(' ').length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} دقيقة للقراءة`;
  }

  // Helper method to get category/tag (placeholder for future enhancement)
  getCategory(): string {
    return 'مقالات عامة';
  }
}
