import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth } from '../../shared/services/auth';
import { Modal } from 'bootstrap';
import { ToastrService } from 'ngx-toastr';
import { OnlyNumberDirective } from '../../shared/only-number';
import Swal from 'sweetalert2';
import { CapitalizePipe } from '../../capitalize-pipe';



@Component({
  selector: 'app-productform',
  imports: [CommonModule,ReactiveFormsModule,OnlyNumberDirective,CapitalizePipe],
  templateUrl: './productform.html',
  styleUrl: './productform.css'
})
export class Productform {
  products: any[] = [];
  productForm: FormGroup;
  searchControl: FormControl;
  pageSizeControl: FormControl;
  sortByControl: FormControl;
  sortOrderControl: FormControl;
  
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  editingProduct: any = null;

  pageNumber = 1;
  pageSize = 5;
  totalCount = 0;

  pageSizeOptions = [5, 10, 15, 20, 50];
  sortOrderOptions = [
    { value: 'asc', label: 'A - Z' },
    { value: 'desc', label: 'Z - A' }
  ];

  constructor(
    private fb: FormBuilder,
    private auth: Auth,
    private cd: ChangeDetectorRef,
    private toastr: ToastrService
  ) {
    // Main form for add/edit product
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      stock: ['', [Validators.required, Validators.min(0)]]
    });

    // Controls for search, page size, sorting
    this.searchControl = new FormControl('');
    this.pageSizeControl = new FormControl(this.pageSize);
    this.sortByControl = new FormControl('Name');
    this.sortOrderControl = new FormControl('asc');
  }

  ngOnInit(): void {
    this.loadProducts();

    // Reactive listeners
    this.searchControl.valueChanges.subscribe(() => {
      this.pageNumber = 1;
      this.loadProducts();
    });

    this.pageSizeControl.valueChanges.subscribe(value => {
      this.pageSize = value;
      this.pageNumber = 1;
      this.loadProducts();
    });

    this.sortByControl.valueChanges.subscribe(() => this.onSortByChange());
    this.sortOrderControl.valueChanges.subscribe(() => this.onSortChange());
  }

  loadProducts() {
    this.auth.getProducts({
      search: this.searchControl.value,
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
      sortBy: this.sortByControl.value.toLowerCase(),
      sortOrder: this.sortOrderControl.value
    }).subscribe({
      next: (res) => {
        this.products = res.Items.map((p: any) => ({
          ...p,
          ImageUrl: p.ImagePath ? this.getImageUrl(p.ImagePath) : null
        }));
        this.totalCount = res.TotalCount;
        this.cd.detectChanges();
      },
      error: err => console.error(err)
    });
  }

  getImageUrl(path: string | null): string | null {
    return path ? `http://localhost:5294/${path}` : null;
  }

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize);
  }
  
  
  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.pageNumber = page;
    this.loadProducts();
  }

  onSortByChange() {
    const sortBy = this.sortByControl.value;
    if (sortBy === 'Name') {
      this.sortOrderOptions = [
        { value: 'asc', label: 'A - Z' },
        { value: 'desc', label: 'Z - A' }
      ];
    } else if (sortBy === 'Price') {
      this.sortOrderOptions = [
        { value: 'desc', label: 'High → Low' },
        { value: 'asc', label: 'Low → High' }
      ];
    }
    this.sortOrderControl.setValue(this.sortOrderOptions[0].value);
  }

  onSortChange() {
    this.pageNumber = 1;
    this.loadProducts();
  }

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
      this.previewUrl = product.ImageUrl;
    } else {
      this.editingProduct = null;
      this.productForm.reset();
      this.selectedFile = null;
    }
    const modalEl = document.getElementById('productModal');
    if (modalEl) new Modal(modalEl).show();
  }

  closeModal() {
    const modalEl = document.getElementById('productModal');
    Modal.getInstance(modalEl!)?.hide();
  }

  onFileChange(event: any) {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = (e: any) => this.previewUrl = e.target.result;
      reader.readAsDataURL(this.selectedFile);
    }
  }

  submitForm() {
    if (this.productForm.invalid) {
      this.toastr.warning('Please fill all required fields');
      return;
    }

    const formData = new FormData();
    formData.append('Name', this.productForm.get('name')?.value);
    formData.append('Description', this.productForm.get('description')?.value);
    formData.append('Price', this.productForm.get('price')?.value);
    formData.append('Stock', this.productForm.get('stock')?.value);
    if (this.selectedFile) formData.append('ImageFile', this.selectedFile);

    const request = this.editingProduct
      ? this.auth.updateProduct(this.editingProduct.ProductId, formData)
      : this.auth.createProduct(formData);

    request.subscribe({
      next: () => {
        this.toastr.success(`Product ${this.editingProduct ? 'updated' : 'added'} successfully`);
        this.loadProducts();
        this.closeModal();
      },
      error: err => {
        console.error(err);
        this.toastr.error('Something went wrong');
      }
    });
  }

  deleteProduct(product: any) {
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete "${product.Name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then(result => {
      if (result.isConfirmed) {
        this.auth.deleteProduct(product.ProductId).subscribe({
          next: () => {
            Swal.fire('Deleted!', `"${product.Name}" has been deleted.`, 'success');
            this.loadProducts();
          },
          error: err => {
            Swal.fire('Error!', 'Failed to delete product.', 'error');
            console.error(err);
          }
        });
      }
    });
  }
}
