import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-purchasetable',
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './purchasetable.html',
  styleUrl: './purchasetable.css'
})
export class Purchasetable {
  @Input() totalCount = 0;
  @Input() pageNumber = 1;
  @Input() pageSize = 10;
  @Input() pageSizeOptions: number[] = [5, 10, 15, 20, 50];
  @Input() showSortControls: boolean = true;

  // NEW: optional features
  @Input() enableSearch: boolean = false;       // enable search box
  @Input() useDateSort: boolean = true;         // keep existing date toggle
  @Input() sortByOptions: string[] = [];        // dropdown sort like Name, Price

  @Output() filterChange = new EventEmitter<any>();
  @Output() pageChange = new EventEmitter<number>();

  filterForm!: FormGroup;

  sortOrderOptions: { value: 'asc' | 'desc', label: string }[] = [];

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    // Initialize form
    this.filterForm = this.fb.group({
      searchText: [''],
      pageSize: [this.pageSize],
      sortBy: [this.sortByOptions.length ? this.sortByOptions[0] : 'date'],
      sortOrder: ['asc']
    });

    // Listen for search changes
    if (this.enableSearch) {
      this.filterForm.get('searchText')?.valueChanges.subscribe(() => this.onFilterChange());
    }

    // Dropdown sort logic
    if (this.sortByOptions?.length) {
      this.updateSortOrderOptions(this.filterForm.get('sortBy')?.value);
      this.filterForm.get('sortBy')?.valueChanges.subscribe(val => {
        this.updateSortOrderOptions(val);
        this.onFilterChange();
      });
    }
  }

  toggleSortOrder() {
    const current = this.filterForm.get('sortOrder')?.value;
    this.filterForm.get('sortOrder')?.setValue(current === 'asc' ? 'desc' : 'asc');
    this.onFilterChange();
  }

  onFilterChange() {
    this.pageChange.emit(1); // reset to page 1
    this.filterChange.emit(this.filterForm.value);
  }

  changePage(newPage: number) {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.pageNumber = newPage;
      this.pageChange.emit(this.pageNumber);
    }
  }

  get totalPages() {
    return Math.ceil(this.totalCount / (this.filterForm.get('pageSize')?.value || 1)) || 1;
  }

  updateSortOrderOptions(sortBy: string) {
    if (sortBy === 'Name') {
      this.sortOrderOptions = [
        { value: 'asc', label: 'A → Z' },
        { value: 'desc', label: 'Z → A' }
      ];
    } else if (sortBy === 'Price') {
      this.sortOrderOptions = [
        { value: 'asc', label: 'Low → High' },
        { value: 'desc', label: 'High → Low' }
      ];
    } else if (sortBy === 'date') {
      this.sortOrderOptions = [
        { value: 'asc', label: 'Oldest' },
        { value: 'desc', label: 'Recent' }
      ];
    }
    // reset sortOrder to first option
    this.filterForm.get('sortOrder')?.setValue(this.sortOrderOptions[0].value);
  }
  }
