import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { ToastrService } from 'ngx-toastr';
import { Auth } from '../../shared/services/auth';

@Component({
  selector: 'app-productlist',
  imports: [RouterModule,CommonModule,FormsModule,InfiniteScrollModule],
  templateUrl: './productlist.html',
  styleUrl: './productlist.css'
})
export class Productlist {
  products: any[] = [];        // all products from backend
  visibleProducts: any[] = []; // products currently shown
  searchText: string = '';
  loading: boolean = true;

  pageSize: number = 5;   // how many items to load per scroll
  currentIndex: number = 0;

  constructor(
    private auth: Auth,
    private router: Router,
    private cd: ChangeDetectorRef,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.auth.getProducts().subscribe({
      next: (res) => {
        this.products = Array.isArray(res) ? res : [];
        this.loadMore(); // load first batch
        this.loading = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching products:', err);
        this.loading = false;
        this.cd.detectChanges();
      }
    });
  }

  // Load next batch of items
  loadMore(): void {
    const nextIndex = this.currentIndex + this.pageSize;
    const newItems = this.products.slice(this.currentIndex, nextIndex);
    this.visibleProducts = [...this.visibleProducts, ...newItems];
    this.currentIndex = nextIndex;
  }

  // Triggered when scrolled to bottom
  onScroll(): void {
    if (this.currentIndex < this.products.length) {
      this.loadMore();

    }
  }

  // Search filter applied on visible items
  get filteredProducts(): any[] {
    if (!this.searchText) return this.visibleProducts;
    const text = this.searchText.toLowerCase();
    return this.visibleProducts.filter(p =>
      (p.Name && p.Name.toLowerCase().includes(text)) ||
      (p.Description && p.Description.toLowerCase().includes(text))
    );
  }

  // Add product to cart
  addToCart(productId: number): void {
    this.auth.addToCart({ productId, quantity: 1 }).subscribe({
      next: () => {
        this.toastr.success('Product added to cart!');
      },
      error: (err) => {
        console.error('Error adding to cart:', err);
        this.toastr.error('Failed to add product to cart.');
      }
    });
  }
  
}
