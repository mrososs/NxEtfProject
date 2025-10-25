import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  SimpleChanges,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel
import { InputTextModule } from 'primeng/inputtext';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
  selector: 'app-serach-bar',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule],
  templateUrl: './serach-bar.component.html',
  styleUrl: './serach-bar.component.scss',
})
export class SerachBarComponent implements OnChanges, OnDestroy {
  @Input() initialSearchTerm: string = ''; // Input to receive initial data from parent
  @Output() searchTermChange = new EventEmitter<string>();

  private lastEmittedValue: string = '';
  private searchSubject$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor() {
    // Setup debounced search with 500ms delay
    this.searchSubject$
      .pipe(
        debounceTime(500), // Wait 500ms after user stops typing
        distinctUntilChanged(), // Only emit if value actually changed
        takeUntil(this.destroy$)
      )
      .subscribe((searchTerm) => {
        this.searchTermChange.emit(searchTerm);
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['initialSearchTerm'] &&
      !changes['initialSearchTerm'].firstChange
    ) {
      this.lastEmittedValue = this.initialSearchTerm;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchChange(value: string): void {
    // Only emit if the value has actually changed
    if (value !== this.lastEmittedValue) {
      this.lastEmittedValue = value;
      // Use the debounced subject instead of direct emit
      this.searchSubject$.next(value);
    }
  }
}
