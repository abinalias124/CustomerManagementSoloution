import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import * as bootstrap from 'bootstrap';
import { ToastrService } from 'ngx-toastr';
import { CapitalizePipe } from '../../capitalize-pipe';

import { Purchasetable } from '../../shared/component/purchasetable/purchasetable';
import { OnlyNumberDirective } from '../../shared/only-number';
import { Auth } from '../../shared/services/auth';

@Component({
  selector: 'app-purchasehistory',
  imports: [CommonModule,ReactiveFormsModule,Purchasetable, OnlyNumberDirective,CapitalizePipe],
  templateUrl: './purchasehistory.html',
  styleUrl: './purchasehistory.css'
})
export class Purchasehistory {
  purchases: any[] = [];
  pageNumber = 1;
  pageSize = 10;
  totalCount = 0;
  loading = true;
  selectedPurchase: any = null;

  sortBy: string = 'date';
  sortOrder: 'asc' | 'desc' = 'desc';
  returnReasons = [
    { id: 0, name: 'Defective' },
    { id: 1, name: 'Other' }
  ];


  returnForm!: FormGroup;

  constructor(
    private auth: Auth,
    private cd: ChangeDetectorRef,
    private fb: FormBuilder, private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.loadPurchases();
  }

  get items(): FormArray {
    return this.returnForm.get('items') as FormArray;
  }

  buildReturnForm(purchase: any) {
    this.returnForm = this.fb.group({
      reason: [purchase.Reason ?? '', Validators.required],
      comments: [purchase.Comments || ''],
      items: this.fb.array(
        purchase.Items.map((x: any) =>
          this.fb.group({
            purchaseItemId: [x.PurchaseItemId],
            returnQty: [x.ReturnQty ?? 1, [Validators.min(1), Validators.max(x.Quantity)]]
          })
        )
      )
    });
  }
  

  loadPurchases(filters?: any) {
    if (filters) {
      this.pageSize = filters.pageSize || this.pageSize;
      this.sortBy = filters.sortBy || this.sortBy;
      this.sortOrder = filters.sortOrder || this.sortOrder;
    }
  
    const params = {
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder
    };
  
    this.auth.getMyPurchases(params).subscribe(res => {
      // Convert each purchase's CreatedAt from UTC to local Date
      this.purchases = (res.Items || []).map((p: any) => ({
        ...p,
        CreatedAt: new Date(p.CreatedAt + 'Z') // treat as UTC
      }));
      this.totalCount = res.TotalCount || 0;
      
      this.loading = false;
      this.cd.detectChanges();
    });
  }
  

  onFilterChange(filters: any) {
    this.pageNumber = 1;
    this.pageSize = filters.pageSize;
    this.sortBy = filters.sortBy;       //  take from filterForm
    this.sortOrder = filters.sortOrder; //  take from filterForm
    this.loadPurchases(filters);
  }

  onPageChange(page: number) {
    this.pageNumber = page;
    this.loadPurchases();
  }

  

  showPurchaseDetails(purchase: any) {
   
    this.selectedPurchase = purchase;
    this.buildReturnForm(purchase);

    const modalEl = document.getElementById('purchaseDetailsModal');
    if (modalEl) new bootstrap.Modal(modalEl).show();

    this.cd.detectChanges();
  }

  submitReturnRequest() {
    if (this.returnForm.invalid) {
      this.returnForm.markAllAsTouched();
      return;
    }
  
    const formValue = this.returnForm.value;
  
    // Build return items
    interface ReturnItem {
      purchaseItemId: number;
      quantity: number;
      productName: string;
      remainingQty: number;
    }
  
    const returnItems: ReturnItem[] = this.selectedPurchase.Items
  .map((item: any, idx: number) => {
    const qty = formValue.items[idx].returnQty;
    return qty > 0
      ? {
          purchaseItemId: item.PurchaseItemId,
          quantity: qty,
          productName: item.ProductName,
          remainingQty: item.RemainingQuantity
        }
      : null;
  })
  .filter((x: ReturnItem | null): x is ReturnItem => x !== null);

  
    if (returnItems.length === 0) {
      this.toastr.warning("Please select at least one item to return.");
      return;
    }
  
    //  Client-side Check 1: Return period ≤ 7 days
    const purchaseDate = new Date(this.selectedPurchase.CreatedAt);
    const today = new Date();
    const diffDays = Math.floor((today.getTime() - purchaseDate.getTime()) / (1000 * 3600 * 24));
    if (diffDays > 7) {
      this.toastr.error("Return period expired. Only returns within 7 days are allowed.");
      return;
    }
  
    //  Client-side Check 2: Quantity does not exceed remaining
    for (let i = 0; i < returnItems.length; i++) {
      if (returnItems[i].quantity > returnItems[i].remainingQty) {
        this.toastr.error(
          "Return quantity exceeds remaining quantity "
        );
        return;
      }
    }
  
    //  Passed client checks → build payload
    const payload = {
      purchaseId: this.selectedPurchase.PurchaseId,
      reason: +formValue.reason,
      comments: formValue.comments,
      items: returnItems.map(x => ({ purchaseItemId: x.purchaseItemId, quantity: x.quantity }))
    };
  
    this.auth.createReturnRequest(payload).subscribe({
      next: () => {
        this.toastr.success("Return request submitted successfully!");
    
        //  Update local remaining quantities
        returnItems.forEach(ri => {
          const item = this.selectedPurchase.Items.find((x: any) => x.PurchaseItemId === ri.purchaseItemId);
          if (item) {
            item.RemainingQuantity -= ri.quantity; // decrease locally
          }
        });
    
        //  Update purchases array so the main list reflects changes
        const purchaseIndex = this.purchases.findIndex(p => p.PurchaseId === this.selectedPurchase.PurchaseId);
        if (purchaseIndex !== -1) {
          this.purchases[purchaseIndex] = { ...this.selectedPurchase };
        }
    
        this.returnForm.reset();
        this.selectedPurchase = null;
    
        const modalEl = document.getElementById("purchaseDetailsModal");
        if (modalEl) bootstrap.Modal.getInstance(modalEl)?.hide();
      },
      error: err => {
        console.error("Backend error:", err);
        const msg: string = err.error?.message || err.error || "Failed to submit return request.";
        this.toastr.error(msg);
      }
    });
    
  }
  
  
 
}

