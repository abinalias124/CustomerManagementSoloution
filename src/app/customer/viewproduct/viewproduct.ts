import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Auth } from '../../shared/services/auth';

@Component({
  selector: 'app-viewproduct',
  imports: [CommonModule],
  templateUrl: './viewproduct.html',
  styleUrl: './viewproduct.css'
})
export class Viewproduct {
  cart: any = { items: [], total: 0 };
  loading = true;

  constructor(private auth: Auth, private cd: ChangeDetectorRef,private router:Router,private toastr: ToastrService) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.loading = true;
    this.auth.getCart().subscribe({
      next: (res: any) => {
        console.log('Cart API response:', res);

        const items = (res.items || res.Items || []).map((item: any) => {
          const price = item.UnitPrice ?? item.unitPrice ?? 0;
          const quantity = item.Quantity ?? item.quantity ?? 1;
          const stock = item.Stock ?? item.stock ?? 10; // Default 10 if backend doesn't send

          return {
            cartItemId: item.CartItemId ?? item.cartItemId,
            productName: item.ProductName ?? item.productName,
            description: item.ProductDescription ?? item.Description ?? '',
            price,
            quantity,
            subtotal: item.SubTotal ?? item.subtotal ?? price * quantity,
            imageUrl: item.ProductImageUrl ?? item.ImageUrl ?? 'assets/no-image.png',
            stock
          };
        });

        const total =
          res.Total ?? res.total ?? items.reduce((sum: number, i: any) => sum + (i.subtotal || 0), 0);

        this.cart = { items, total };
        this.loading = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Error loading cart:', err);
        this.loading = false;
      }
    });
  }

  // Remove item
  removeItem(cartItemId: number): void {
    this.auth.removeCartItem(cartItemId).subscribe({
      next: () => this.loadCart(),
      error: (err) => console.error('Error removing item:', err)
    });
  }

  // Increase quantity with stock check
  increaseQuantity(item: any): void {
    if (item.quantity < item.stock) {
      this.updateQuantityServer(item, item.quantity + 1);
    }
 
  }
  // Decrease quantity (min 1)
  decreaseQuantity(item: any): void {
    if (item.quantity > 1) {
      this.updateQuantityServer(item, item.quantity - 1);
    }
  }

  // Update quantity on server
  private updateQuantityServer(item: any, newQty: number): void {
    this.auth.updateCartItem({ cartItemId: item.cartItemId, quantity: newQty }).subscribe({
      next: () => this.loadCart(),
      error: (err) => console.error('Error updating item:', err)
    });
  }
   //  Navigate to Profile Completion Component
  // 🔹 Navigate to Profile Completion Component
proceedToCheckout(): void {
  this.auth.completePurchase().subscribe({
    next: (res) => {
      if (res.isProfileCompleted || res.IsProfileCompleted) {
        // Profile is complete → show success
        this.toastr.success(`Purchase completed!`);
        
        // 🔹 Clear frontend cart by reloading
        this.loadCart();

        this.cd.detectChanges(); 
        // this.router.navigate(['/customer/viewproduct']); // optional
      } else {
        // Profile not completed → redirect to profile completion
        this.toastr.warning('Please complete your profile before checkout.');
        this.router.navigate(['/customer/profilecompletion']);
      }
    },
    error: (err) => {
      console.error('Error completing purchase:', err);
      this.toastr.error('Something went wrong during purchase.');
      this.cd.detectChanges();
    }
  });
}

  
  
  
}
