
import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { Auth } from '../../shared/services/auth';



@Component({
  selector: 'app-admindashboard',
  imports: [CommonModule,BaseChartDirective],
  templateUrl: './admindashboard.html',
  styleUrl: './admindashboard.css'
})
export class Admindashboard {
  data: any = null;
  summaryCards: any[] = [];

  // Chart Data
  badgeChartData!: ChartData<'doughnut'>;
  purchaseTrendsData!: ChartData<'bar'>;
  revenueRefundChartData!: ChartData<'bar'>;
  topCustomersChartData!: ChartData<'bar'>;
  topProductsChartData!: ChartData<'bar'>;

  // Chart Options
  doughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    plugins: { legend: { position: 'bottom' } }
  };
  barOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: { legend: { display: false } }
  };
  horizontalBarOptions: ChartOptions<'bar'> = {
    indexAxis: 'y',
    responsive: true,
    plugins: { legend: { display: false } }
  };

  constructor(private dashboardService: Auth, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.dashboardService.getDashboardSummary().subscribe({
      next: (res) => {
        this.data = res;

        // Summary cards
        this.summaryCards = [
          { title: 'Total Customers', value: res.TotalCustomers },
          { title: 'Total Products', value: res.TotalProducts },
          { title: 'Purchases Today', value: res.PurchasesToday },
          { title: 'Revenue', value: res.TotalRevenue }
        ];

        // Customers by Badge (Doughnut)
        this.badgeChartData = {
          labels: Object.keys(res.CustomersByBadge),
          datasets: [{
            data: Object.values(res.CustomersByBadge),
            backgroundColor: ['#cd7f32', '#c0c0c0', '#ffd700', '#00bfff']
          }]
        };

        // Purchases Trend (Bar)
        this.purchaseTrendsData = {
          labels: ['Today', 'This Week', 'This Month'],
          datasets: [{
            data: [res.PurchasesToday, res.PurchasesThisWeek, res.PurchasesThisMonth],
            backgroundColor: ['#007bff', '#17a2b8', '#6f42c1']
          }]
        };

        // Revenue vs Refunds (Bar)
        this.revenueRefundChartData = {
          labels: ['Revenue', 'Refunded'],
          datasets: [{
            data: [res.TotalRevenue, res.TotalRefunded],
            backgroundColor: ['#28a745', '#ffc107']
          }]
        };

        // Top Customers (Horizontal Bar)
        this.topCustomersChartData = {
          labels: res.TopCustomersBySpend.map((c: any) => c.FullName),
          datasets: [{
            data: res.TopCustomersBySpend.map((c: any) => c.TotalSpent),
            backgroundColor: '#007bff'
          }]
        };

        // Top Products (Horizontal Bar)
        this.topProductsChartData = {
          labels: res.TopSellingProducts.map((p: any) => p.ProductName),
          datasets: [{
            data: res.TopSellingProducts.map((p: any) => p.QuantitySold),
            backgroundColor: '#17a2b8'
          }]
        };

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Dashboard API error', err);
      }
    });
  }
}
