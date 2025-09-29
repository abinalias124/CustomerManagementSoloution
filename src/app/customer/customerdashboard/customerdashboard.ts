import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { Auth } from '../../shared/services/auth';

@Component({
  selector: 'app-customerdashboard',
  imports: [CommonModule],
  templateUrl: './customerdashboard.html',
  styleUrl: './customerdashboard.css'
})
export class Customerdashboard {
  dashboard: any = null;

  constructor(private dashboardService: Auth, private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    console.log('Customer dashboard component initialized');

    this.dashboardService.getDashboardSummary().subscribe({
      next: (res) => {
        console.log('Dashboard API response:', res);
        this.dashboard = res;
        this.cd.detectChanges(); // Update template in zoneless mode
      },
      error: (err) => console.error('Dashboard API error:', err)
    });
  }

  // Calculate badge completion percentage
  badgePercent(count: number): number {
    if (!this.dashboard || !this.dashboard.TotalCustomers) return 0;
    return (count / this.dashboard.TotalCustomers) * 100;
  }
}
