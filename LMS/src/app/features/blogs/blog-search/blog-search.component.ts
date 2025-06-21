import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-blog-search',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule],
  templateUrl: './blog-search.component.html',
  styleUrl: './blog-search.component.scss',
})
export class BlogSearchComponent {
  @Input() initialSearchTerm: string = ''; // Input to receive initial data from parent
  @Output() searchTermChange = new EventEmitter<string>();
}
