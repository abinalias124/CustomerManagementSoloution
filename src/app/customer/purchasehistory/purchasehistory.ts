import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { Auth } from '../../shared/services/auth';

@Component({
  selector: 'app-purchasehistory',
  imports: [CommonModule,DatePipe,ReactiveFormsModule],
  templateUrl: './purchasehistory.html',
  styleUrl: './purchasehistory.css'
})
export class Purchasehistory {
  purchases: any[] = [];
  loading = true;

  pageNumber = 1;
  pageSize = 10;
  totalCount = 0;
  // Sorting variables
  sortBy: string = 'CreatedAt'; // Default sort by date
  sortOrder: string = 'desc';   // Default sort order (newest first)
  
  // Available page size options
  pageSizeOptions = [5, 10, 15, 20, 50];
  
  // Reactive form for page size and sorting selection
  filterForm: FormGroup;

  constructor(
    private auth: Auth, 
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    // Initialize the form
    this.filterForm = this.fb.group({
      pageSize: [this.pageSize],
      sortBy: ['date'],    // must match backend
      sortOrder: [this.sortOrder]
    });

    // Subscribe to form changes
    this.filterForm.valueChanges.subscribe(value => {
      // Only trigger API call if pageSize, sortBy, or sortOrder actually changed
      if (this.pageSize !== value.pageSize || 
          this.sortBy !== value.sortBy || 
          this.sortOrder !== value.sortOrder) {
        
        this.pageSize = value.pageSize;
        this.sortBy = value.sortBy;
        this.sortOrder = value.sortOrder;
        
        // Reset to first page when changing filters
        this.pageNumber = 1;
        this.loadPurchases();
      }
    });
  }

  ngOnInit(): void {
    this.loadPurchases();
  }

  loadPurchases() {
    this.loading = true;
    
    const params = {
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
      sortBy: this.filterForm.get('sortBy')?.value,
      sortOrder: this.filterForm.get('sortOrder')?.value
    };
    
    this.auth.getMyPurchases(params).subscribe({
      next: (res: any) => {
        this.purchases = res.Items?.map((p: any) => ({
          ...p,
          expanded: false,
          PurchaseItems: p.PurchaseItems || []
        })) || [];
        this.totalCount = res.TotalCount || 0;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.purchases = [];
        this.cdr.detectChanges();
      }
    });
  }

  toggleExpand(purchase: any) {
    purchase.expanded = !purchase.expanded;
    this.cdr.detectChanges();
  }

  pageChanged(page: number) {
    this.pageNumber = page;
    this.loadPurchases();
  }

  get totalPages() {
    return Math.ceil(this.totalCount / this.pageSize);
  }

  // Helper method to toggle sort order
  toggleSortOrder() {
    const currentOrder = this.filterForm.get('sortOrder')?.value;
    this.filterForm.get('sortOrder')?.setValue(currentOrder === 'asc' ? 'desc' : 'asc');
  }
  

  // Get sort icon based on current sort field and order
  getSortIcon(field: string): string {
    if (this.sortBy !== field) return 'bi-sort-down';
    
    return this.sortOrder === 'asc' ? 'bi-sort-up' : 'bi-sort-down';
  }
}
