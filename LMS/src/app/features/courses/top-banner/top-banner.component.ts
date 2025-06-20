import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-top-banner',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './top-banner.component.html',
})
export class TopBannerComponent {
  scrollToDreams() {
    const element = document.getElementById('dreamsSection');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
