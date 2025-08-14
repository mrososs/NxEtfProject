import { HttpClientModule } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { types } from '../model/types.model';
import { HomePageService } from '../services/home-page.service';

@Component({
  selector: 'app-types',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  providers: [HomePageService],
  templateUrl: './types.component.html',
  styleUrl: './types.component.scss',
})
export class TypesComponent implements OnInit {
  types = signal<types[]>([]);
  private _homePageService = inject(HomePageService);

  ngOnInit(): void {
    this._homePageService.getTypes().subscribe((data: types[]) => {
      this.types.set(data);
    });
  }

  // TrackBy function for better performance
  trackByType(index: number, type: types): number {
    return type.id || index;
  }

  // Handle type card click
  onTypeClick(type: types): void {
    console.log('Type clicked:', type);
    // Add navigation logic here if needed
    // this.router.navigate(['/courses'], { queryParams: { type: type.id } });
  }
}
