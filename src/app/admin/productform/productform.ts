import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth } from '../../shared/services/auth';
import { Modal } from 'bootstrap';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-productform',
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './productform.html',
  styleUrl: './productform.css'
})
export class Productform {
  products: any[] = [];
  productForm: FormGroup;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  editingProduct: any = null;

  constructor(
    private fb: FormBuilder,
    private auth: Auth,
    private cd: ChangeDetectorRef,
    private toastr: ToastrService 
  ) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      stock: ['', [Validators.required, Validators.min(0)]],
      imageFile: ['']
    });
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  // Load products from API
  loadProducts() {
    this.auth.getProducts().subscribe({
      next: (res) => {
        this.products = Array.isArray(res) ? res : [];
        this.cd.detectChanges();
      },
      error: (err) => console.error('Error fetching products:', err)
    });
  }

  // Open modal (Add / Edit)
  openModal(product?: any) {
    this.previewUrl = null;
  
    if (product) {
      this.editingProduct = product;
      this.productForm.patchValue({
        name: product.Name,
        description: product.Description,
        price: product.Price,
        stock: product.Stock
      });
      this.previewUrl = product.ImageUrl || null;
    } else {
      this.editingProduct = null;
      this.productForm.reset();
      this.selectedFile = null;
    }
  
    const modalEl = document.getElementById('productModal');
    if (modalEl) {
      const modal = new Modal(modalEl);
      modal.show();
    }
  }
  
  closeModal() {
    const modalEl = document.getElementById('productModal');
    if (modalEl) {
      const modal = Modal.getInstance(modalEl);
      modal?.hide();
    }
  }

  // Handle file input
  onFileChange(event: any) {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = (e: any) => (this.previewUrl = e.target.result);
      reader.readAsDataURL(this.selectedFile);
    }
  }

  // Submit Add / Edit form
  submitForm() {
    if (this.productForm.invalid) {
      this.toastr.warning('Please fill all required fields');
      return;
    }

    const formData = new FormData();
    formData.append('name', this.productForm.get('name')?.value);
    formData.append('description', this.productForm.get('description')?.value);
    formData.append('price', this.productForm.get('price')?.value);
    formData.append('stock', this.productForm.get('stock')?.value);
    if (this.selectedFile) formData.append('imageFile', this.selectedFile);

    if (this.editingProduct) {
      this.auth.updateProduct(this.editingProduct.ProductId, formData).subscribe({
        next: (res) => {
          this.toastr.success('Product updated successfully');
          this.products = this.products.map(p =>
            p.ProductId === res.ProductId ? res : p
          );
          this.closeModal();
          this.cd.detectChanges();
        },
        error: (err) => console.error(err)
      });
    } else {
      this.auth.createProduct(formData).subscribe({
        next: (res) => {
          this.toastr.success('Product added successfully');
          this.products = [res, ...this.products];
          this.closeModal();
          this.cd.detectChanges();
        },
        error: (err) => console.error(err)
      });
    }
  }

  // Delete product
  deleteProduct(product: any) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    this.auth.deleteProduct(product.ProductId).subscribe({
      next: () => {
        this.toastr.success('Product deleted successfully');
        this.products = this.products.filter(p => p.ProductId !== product.ProductId);
        this.cd.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }
}
