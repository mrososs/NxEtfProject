import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-serach-bar',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule],
  templateUrl: './serach-bar.component.html',
  styleUrl: './serach-bar.component.scss',
})
export class SerachBarComponent {
  @Input() initialSearchTerm: string = ''; // Input to receive initial data from parent
  @Output() searchTermChange = new EventEmitter<string>();
}
