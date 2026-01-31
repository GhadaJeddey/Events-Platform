import { Component, signal, output, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search.html',
  styleUrl: './search.css',
})
export class SearchComponent {
  searchTerm = signal('');
  searchSubmitted = output<string>();

  constructor() {
    effect(() => {
      this.searchSubmitted.emit(this.searchTerm());
    });
  }

  onSearch(): void {
    this.searchSubmitted.emit(this.searchTerm());
  }

  onKeyUp(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onSearch();
    }
  }
}
