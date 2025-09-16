import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Auth } from '../../shared/services/auth';

@Component({
  selector: 'app-customermanagement',
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './customermanagement.html',
  styleUrl: './customermanagement.css'
})
export class Customermanagement {
  purchases: any[] = [];
  pageNumber: number = 1;
  pageSize: number = 5;
  totalCount: number = 0;

  filterForm!: FormGroup;

  constructor(
    private authService: Auth,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      sortBy: ['date'],
      sortOrder: ['asc']
    });

    this.loadPurchases();

    // reload when sort changes
    this.filterForm.valueChanges.subscribe(() => {
      this.pageNumber = 1;
      this.loadPurchases();
    });
  }

  loadPurchases() {
    const { sortBy, sortOrder } = this.filterForm.value;

    const params = {
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
      sortBy,
      sortOrder
    };

    this.authService.getAllPurchases(params).subscribe({
      next: (res) => {
        this.purchases = res.items ?? res.Items ?? [];
        this.totalCount = res.totalCount ?? res.TotalCount ?? 0;
        this.cd.detectChanges();
      },
      error: (err) => console.error('Error loading purchases:', err)
    });
  }

  prevPage() {
    if (this.pageNumber > 1) {
      this.pageNumber--;
      this.loadPurchases();
    }
  }

  nextPage() {
    if (this.pageNumber < this.totalPages) {
      this.pageNumber++;
      this.loadPurchases();
    }
  }

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize) || 1;
  }
}
