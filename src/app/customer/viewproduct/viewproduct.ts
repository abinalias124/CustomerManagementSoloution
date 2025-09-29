import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Auth } from '../../shared/services/auth';

@Component({
  selector: 'app-viewproduct',
  imports: [CommonModule,RouterModule],
  templateUrl: './viewproduct.html',
  styleUrl: './viewproduct.css'
})
export class Viewproduct {
  cart: any = { items: [], total: 0 };
  loading = true;

  constructor(
    private auth: Auth,
    private cd: ChangeDetectorRef,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.loading = true;
    this.auth.getCart().subscribe({
      next: (res: any) => {
        const items = (res.Items || []).map((item: any) => ({
          cartItemId: item.CartItemId ?? item.cartItemId,
          productName: item.ProductName ?? item.productName,
          description: item.ProductDescription ?? item.Description ?? '',
          price: item.UnitPrice ?? item.price ?? 0,
          quantity: item.Quantity ?? item.quantity ?? 1,
          subtotal: item.SubTotal ?? item.subtotal ?? (item.UnitPrice ?? item.price ?? 0) * (item.Quantity ?? item.quantity ?? 1),
          imageUrl: item.ProductImageUrl ?? item.ImageUrl ?? 'assets/no-image.png',
          stock: item.Stock ?? 0
        }));

        const total = items.reduce((sum: number, i: any) => sum + (i.subtotal || 0), 0);

        this.cart = { items, total };
        this.loading = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Error loading cart:', err);
        this.loading = false;
        this.cd.detectChanges();
      }
    });
  }

  removeItem(cartItemId: number): void {
    this.auth.removeCartItem(cartItemId).subscribe({
      next: () => this.loadCart(),
      error: (err) => console.error('Error removing item:', err)
    });
  }

  increaseQuantity(item: any): void {
    if (item.quantity < item.stock) this.updateQuantityServer(item, item.quantity + 1);
  }

  decreaseQuantity(item: any): void {
    if (item.quantity > 1) this.updateQuantityServer(item, item.quantity - 1);
  }

  private updateQuantityServer(item: any, newQty: number): void {
    this.auth.updateCartItem({ cartItemId: item.cartItemId, quantity: newQty }).subscribe({
      next: () => this.loadCart(),
      error: (err) => console.error('Error updating quantity:', err)
    });
  }

  //  Checkout
  proceedToCheckout(): void {
    this.auth.completePurchase().subscribe({
      next: (res: any) => {
        // Successful purchase
        this.toastr.success('Purchase completed successfully!');
  
        // Clear frontend cart
        this.cart = { items: [], total: 0 };
        this.cd.detectChanges();
  
        // Redirect back to products page
        this.router.navigate(['/products']);
      },
      error: (err) => {
        console.error('Error completing purchase:', err);
  
        const message = err.error?.error || err.message || 'Something went wrong during purchase.';
  
        if (message.includes('Profile not completed')) {
          //  Redirect to profile completion
          this.toastr.warning('Please complete your profile before checkout.');
          this.router.navigate(['/customer/profilecompletion']);
        } 
        else if (message.includes('Not enough stock')) {
          //  Stock validation failed → back to cart/products
          this.toastr.error('Not enough stock for one or more items.');
          this.router.navigate(['/products']);
        } 
        else {
          // Generic error
          this.toastr.error(message);
        }
  
        this.cd.detectChanges();
      }
    });
  }
  
  
}
