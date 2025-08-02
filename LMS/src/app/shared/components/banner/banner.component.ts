import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="banner">
      <div class="container">
        <div class="banner-content">
          <div class="breadcrumb">
            <span class="breadcrumb-item">{{ back }}</span>
            <i class="pi pi-chevron-left"></i>
            <span class="breadcrumb-item active">{{ here }}</span>
          </div>
          <h1 class="banner-title">{{ title }}</h1>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .banner {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem 0;
      margin-bottom: 2rem;
    }
    
    .banner-content {
      text-align: center;
    }
    
    .breadcrumb {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
      font-size: 0.9rem;
      opacity: 0.9;
    }
    
    .breadcrumb-item {
      cursor: pointer;
      transition: opacity 0.3s ease;
      
      &:hover {
        opacity: 1;
      }
      
      &.active {
        font-weight: 600;
      }
    }
    
    .banner-title {
      font-size: 2.5rem;
      font-weight: bold;
      margin: 0;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    @media (max-width: 768px) {
      .banner {
        padding: 1.5rem 0;
      }
      
      .banner-title {
        font-size: 2rem;
      }
      
      .breadcrumb {
        font-size: 0.8rem;
      }
    }
  `]
})
export class BannerComponent {
  @Input() title: string = '';
  @Input() back: string = '';
  @Input() here: string = '';

  constructor(private router: Router) {}

  onBackClick(): void {
    this.router.navigate(['/']);
  }
} 