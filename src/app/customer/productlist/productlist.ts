import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { ToastrService } from 'ngx-toastr';
import { CapitalizePipe } from '../../capitalize-pipe';
import { Auth } from '../../shared/services/auth';

@Component({
  selector: 'app-productlist',
  imports: [RouterModule,CommonModule,ReactiveFormsModule,FormsModule, CapitalizePipe],
  templateUrl: './productlist.html',
  styleUrl: './productlist.css'
})
export class Productlist {
  products: any[] = [];
  loading = true;

  pageNumber = 1;
  totalCount = 0;

  pageSizeOptions = [5, 10, 15, 20, 50];

  searchControl = new FormControl('');
  pageSizeControl = new FormControl(5);
  sortByControl = new FormControl('Name');
  sortOrderControl = new FormControl('asc');

  sortOrderOptions: { value: 'asc' | 'desc', label: string }[] = [];

  constructor(
    private auth: Auth,
    private cd: ChangeDetectorRef,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.updateSortOrderOptions();
    this.loadProducts();

    // React to search, sort, pageSize changes
    this.searchControl.valueChanges.subscribe(() => {
      this.pageNumber = 1;
      this.loadProducts();
    });

    this.pageSizeControl.valueChanges.subscribe(() => {
      this.pageNumber = 1;
      this.loadProducts();
    });

    this.sortByControl.valueChanges.subscribe(() => {
      this.updateSortOrderOptions();
      this.loadProducts();
    });

    this.sortOrderControl.valueChanges.subscribe(() => {
      this.loadProducts();
    });
  }

  updateSortOrderOptions() {
    const sortBy = this.sortByControl.value;
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
    }
    // Default sort order
    this.sortOrderControl.setValue(this.sortOrderOptions[0].value, { emitEvent: false });
  }

  loadProducts(): void {
    this.loading = true;
    this.auth.getProducts({
      search: this.searchControl.value || '',
      pageNumber: this.pageNumber,
      pageSize: Number(this.pageSizeControl.value),
      sortBy: this.sortByControl.value!.toLowerCase(),    // <-- non-null assertion
      sortOrder: this.sortOrderControl.value || 'asc'     // <-- fallback if null
    }).subscribe({
      next: (res: any) => {
        this.products = res.Items.map((p: any) => ({
          ...p,
          ImageUrl: p.ImagePath ? this.getImageUrl(p.ImagePath) : 'assets/no-image.png'
        }));
        this.totalCount = res.TotalCount;
        this.loading = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.cd.detectChanges();
      }
    });
  }
  

  getImageUrl(path: string): string {
    return `http://localhost:5294/${path}`;
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.pageNumber = page;
    this.loadProducts();
  }

  get totalPages(): number {
    return Math.ceil(this.totalCount / Number(this.pageSizeControl.value));
  }

  addToCart(productId: number): void {
    this.auth.addToCart({ productId, quantity: 1 }).subscribe({
      next: () => this.toastr.success('Product added to cart!'),
      error: () => this.toastr.error('Failed to add product to cart.')
    });
  }
}
