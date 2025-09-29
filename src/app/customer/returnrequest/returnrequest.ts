import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CapitalizePipe } from '../../capitalize-pipe';
import { Auth } from '../../shared/services/auth';

@Component({
  selector: 'app-returnrequest',
  imports: [CurrencyPipe,DatePipe,ReactiveFormsModule,CommonModule,CapitalizePipe],
  templateUrl: './returnrequest.html',
  styleUrl: './returnrequest.css'
})
export class Returnrequest {
  returns: any[] = [];
  totalCount = 0;
  loading = false;
  
  tableParams = {
    pageNumber: 1,
    pageSize: 10,
    sortBy: 'date',
    sortOrder: 'desc'
  };
  pageSizeOptions: number[] = [5, 10, 20, 50];
  pageSizeControl = new FormControl(this.tableParams.pageSize);
  statusControl = new FormControl('');

  constructor(private auth: Auth, private cdRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadReturns();
    this.pageSizeControl.valueChanges.subscribe((size: number | null) => {
      if (size !== null) {
        this.changePageSize(size);
      }
    });
    this.statusControl.valueChanges.subscribe(() => {
  this.tableParams.pageNumber = 1; // reset to first page
  this.loadReturns();
});
  
  }
  

  loadReturns() {
    this.loading = true;
  
    const params: any = {
      pageNumber: this.tableParams.pageNumber,
      pageSize: this.tableParams.pageSize,
      sortBy: this.tableParams.sortBy,
      sortOrder: this.tableParams.sortOrder
    };
  
    // Only add status if selected
    if (this.statusControl.value !== '') {
      params.status = Number(this.statusControl.value);
    }
  
    this.auth.getMyReturns(params).subscribe({
      next: res => {
        this.returns = res.Items.map((r: any) => ({
          returnRequestId: r.ReturnRequestId,
          userId: r.UserId,
          userName: r.UserName,
          returnDate: new Date(r.ReturnDate + 'Z'),
          status: r.Status, // numeric: 0,1,2
  statusLabel: r.Status === 0 ? 'Pending' : r.Status === 1 ? 'Approved' : 'Received',
          refundAmount: r.RefundAmount,
          reason: r.Reason,
          items: r.Items
        }));
        this.totalCount = res.TotalCount ?? this.returns.length;
        this.loading = false;
        this.cdRef.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdRef.detectChanges();
      }
    });
  }
  
  
  changePage(page: number) {
    this.tableParams.pageNumber = page;
    this.loadReturns();
  }

  changePageSize(size: number) {
    this.tableParams.pageSize = size;
    this.tableParams.pageNumber = 1;
    this.loadReturns();
  }
 get totalPages(): number {
  return Math.ceil(this.totalCount / this.tableParams.pageSize);
}

  
  

  sort(field: string) {
    if (this.tableParams.sortBy === field) {
      this.tableParams.sortOrder = this.tableParams.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.tableParams.sortBy = field;
      this.tableParams.sortOrder = 'asc';
    }
    this.loadReturns();
  }
}
