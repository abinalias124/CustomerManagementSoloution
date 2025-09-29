import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Purchasetable } from '../../shared/component/purchasetable/purchasetable';
import { Auth } from '../../shared/services/auth';

@Component({
  selector: 'app-customermanagement',
  imports: [CommonModule,ReactiveFormsModule,Purchasetable],
  templateUrl: './customermanagement.html',
  styleUrl: './customermanagement.css'
})
export class Customermanagement {
  purchases: any[] = [];
  pageNumber = 1;
  pageSize = 10;
  totalCount = 0;
  loading = true;

  constructor(private auth: Auth, private cd: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadPurchases();
  }

  loadPurchases(filters?: any) {
    const params = {
      pageNumber: this.pageNumber,
      pageSize: filters?.pageSize || this.pageSize,
      sortBy: filters?.sortBy || 'date',
      sortOrder: filters?.sortOrder || 'asc'
    };

    this.pageSize = params.pageSize;

    this.auth.getAllPurchases(params).subscribe(res => {
      
      this.purchases = (res.Items ?? []).map((p: any) => ({
        ...p,
        CreatedAt: new Date(p.CreatedAt + 'Z') // treat as UTC, convert to local
      }));

      this.totalCount = res.TotalCount ?? 0;
      this.loading = false;
      this.cd.detectChanges();
    });
  }

  onFilterChange(filters: any) {
    this.pageNumber = 1;
    this.loadPurchases(filters);
  }

  onPageChange(page: number) {
    this.pageNumber = page;
    this.loadPurchases();
  }
}
