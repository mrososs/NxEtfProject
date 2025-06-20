import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BannerComponent } from '../homepage/banner/banner.component';
import { BlogsService } from './services/blogs.service';
import { BlogCardComponent } from './blog-card/blog-card.component';

@Component({
  selector: 'app-blogs',
  standalone: true,
  imports: [CommonModule, BannerComponent,BlogCardComponent],
  templateUrl: './blogs.component.html',
  styleUrl: './blogs.component.scss',
})
export class BlogsComponent implements OnInit {
  private blogService = inject(BlogsService);
  blog$=this.blogService.getBlogs();
  ngOnInit(): void {
    console.log(this.blog$)
  }
}
