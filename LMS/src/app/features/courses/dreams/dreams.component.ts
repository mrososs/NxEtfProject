import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dreams',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './dreams.component.html',
  styleUrl: './dreams.component.scss',
})
export class DreamsComponent {}
