import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
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
export class SerachBarComponent implements OnChanges {
  @Input() initialSearchTerm: string = ''; // Input to receive initial data from parent
  @Output() searchTermChange = new EventEmitter<string>();

  private lastEmittedValue: string = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['initialSearchTerm'] &&
      !changes['initialSearchTerm'].firstChange
    ) {
      this.lastEmittedValue = this.initialSearchTerm;
    }
  }

  onSearchChange(value: string): void {
    // Only emit if the value has actually changed
    if (value !== this.lastEmittedValue) {
      this.lastEmittedValue = value;
      this.searchTermChange.emit(value);
    }
  }
}
