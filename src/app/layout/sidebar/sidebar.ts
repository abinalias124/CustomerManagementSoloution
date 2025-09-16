
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
interface NavItem {
  label: string;
  link: string;
}
@Component({
  selector: 'app-sidebar',
  imports: [RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {
  role: string | null = localStorage.getItem('role'); // Admin or Customer

  navItems: NavItem[] = [];

  constructor() {
    this.setNavItems();
  }

  setNavItems() {
    if (!this.role) return;

    const roleLower = this.role.trim().toLowerCase();

    if (roleLower === 'admin') {
      this.navItems = [
        { label: 'Admin Dashboard', link: '/dashboard' },
        { label: 'Request Approvals', link: '/request-approvals' },
        { label: 'Customers', link: '/customermanagement' },
        { label: 'Product Management', link: '/productform' },
        { label: 'Reports', link: '/reports' }
      ];
    } else if (roleLower === 'customer') {
      this.navItems = [
        { label: 'Customer Dashboard', link: '/customerdashboard' },
        { label: ' Product List', link: '/customer/products' },
        { label: 'Cart', link: '/customer/viewproduct' },
        { label: 'Purchase History', link: '/customer/purchasehistory' }
      ];
    }
  }
}
