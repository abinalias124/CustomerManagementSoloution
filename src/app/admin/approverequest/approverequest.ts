import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import * as bootstrap from 'bootstrap';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { CapitalizePipe } from '../../capitalize-pipe';
import { Auth } from '../../shared/services/auth';


@Component({
  selector: 'app-approverequest',
  imports: [CommonModule,ReactiveFormsModule,CapitalizePipe],
  templateUrl: './approverequest.html',
  styleUrl: './approverequest.css'
})
export class Approverequest {
  returns: any[] = [];
  pageNumber = 1;
  pageSize = 10;
  totalCount = 0;
  pageSizeOptions: number[] = [5, 10, 20,30, 50];
  pageSizeControl: FormControl = new FormControl(this.pageSize);


  sortBy = 'date'; // Matches backend
  sortOrder: 'asc' | 'desc' = 'desc';

  searchControl = new FormControl('');
  statusControl: FormControl = new FormControl('');

  completeForm: FormGroup;
  selectedReturnId: number | null = null;

  constructor(
    private auth: Auth,
    private fb: FormBuilder,
    private cdRef: ChangeDetectorRef,
    private toastr: ToastrService
  ) {
    this.completeForm = this.fb.group({
      isProductGood: [true]
    });
  }

  ngOnInit(): void {
    this.loadReturns();
  
    this.searchControl.valueChanges.subscribe(() => {
      this.pageNumber = 1;
      this.loadReturns();
    });
  
    this.pageSizeControl.valueChanges.subscribe((value: any) => {
      this.pageSize = Number(value);
      this.pageNumber = 1;
      this.loadReturns();
    });
  
    this.statusControl.valueChanges.subscribe(() => {
      this.pageNumber = 1;
      this.loadReturns();
    });
  }
  
  
  
  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize);
  }


  loadReturns() {
    const params: any = {
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
      searchTerm: this.searchControl.value || '',
      sortBy: this.sortBy,
      sortOrder: this.sortOrder
    };
  
    // Only add status if a valid status is selected
    const statusValue = this.statusControl.value;
    if (statusValue === 'Pending' || statusValue === 'Approved' || statusValue === 'Received') {
      params.status = statusValue;
    }
  
    this.auth.getAllReturns(params).subscribe({
      next: (res) => {
        this.returns = res.Items.map((r: any) => ({
          returnRequestId: r.ReturnRequestId,
          userId: r.UserId,
          userName: r.UserName,
          returnDate: new Date(r.ReturnDate + 'Z'),
          status: r.Status,
          refundAmount: r.RefundAmount,
          reason: r.Reason === 0 ? 'Defective' : 'Other',
          items: r.Items.map((i: any) => ({
            productId: i.ProductId,
            productName: i.ProductName,
            unitPrice: i.UnitPrice,
            quantity: i.Quantity
          }))
        }));
        this.totalCount = res.TotalCount ?? this.returns.length;
        this.cdRef.detectChanges();
      },
      error: () => {
        this.toastr.error('Failed to load returns.');
      }
    });
  }
  
  
  // Toggle sort order for backend 'date'
  sort() {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    this.pageNumber = 1;
    this.loadReturns();
  }

  changePage(page: number) {
    if (page < 1 || page > Math.ceil(this.totalCount / this.pageSize)) return;
    this.pageNumber = page;
    this.loadReturns();
  }

  approve(returnId: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to approve this return request?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, approve',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.isConfirmed) {
        this.auth.approveReturnRequest(returnId).subscribe({
          next: () => {
            Swal.fire('Approved!', 'Return request approved.', 'success');
            // Temporarily reset status filter so the updated row shows
            const currentStatus = this.statusControl.value;
            this.statusControl.setValue(''); // reset filter
            this.loadReturns();
            this.statusControl.setValue(currentStatus); // restore user selection
          },
          error: () => {
            Swal.fire('Error!', 'Approval failed.', 'error');
          }
        });
      }
    });
  }
  

  openCompleteModal(returnId: number) {
    this.selectedReturnId = returnId;
    this.completeForm.reset({ isProductGood: true });
    const modalEl = document.getElementById('completeModal');
    if (modalEl) new bootstrap.Modal(modalEl).show();
  }

  completeReturn() {
    if (!this.selectedReturnId) return;
  
    this.auth.completeReturn({
      returnRequestId: this.selectedReturnId,
      isProductGood: this.completeForm.value.isProductGood
    }).subscribe({
      next: () => {
        this.toastr.success('Return completed.');
        this.selectedReturnId = null;
        this.loadReturns();
        const modalEl = document.getElementById('completeModal');
        if (modalEl) bootstrap.Modal.getInstance(modalEl)?.hide();
      },
      error: (err) => {
        // Check backend error message for unapproved return
        if (err?.error?.message?.includes('Invalid or unapproved return request')) {
          this.toastr.warning('Cannot complete return. Please approve it first.');
        } else {
          this.toastr.error('Failed to complete return.');
        }
      }
    });
  }
  
}
