import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BannerComponent } from '../../homepage/banner/banner.component';
import { blog } from '../model/blog.model';
import { ActivatedRoute } from '@angular/router';
import { BlogsService } from '../services/blogs.service';
import { BlogSearchComponent } from '../blog-search/blog-search.component';

@Component({
  selector: 'app-blog-details',
  standalone: true,
  imports: [CommonModule, BannerComponent, BlogSearchComponent],
  templateUrl: './blog-details.component.html',
  styleUrl: './blog-details.component.scss',
})
export class BlogDetailsComponent {
  blog!: blog | undefined;
  private route = inject(ActivatedRoute);
  private blogService = inject(BlogsService);
  blog$ = this.blogService.getBlogs();
  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      if (id) {
        this.loadBlog(id);
      }
    });
  }
  loadBlog(id: number) {
    this.blogService.getBlogDetails(id).subscribe((inst) => {
      this.blog = inst;
    });
  }
}
