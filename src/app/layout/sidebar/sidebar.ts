
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

interface NavItem {
  label: string;
  link: string;
  queryParams?: any;
}
      // optional query params

@Component({
  selector: 'app-sidebar',
  imports: [RouterModule,CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {
  navItems: NavItem[] = [];

  constructor() {
    this.loadMenus();
  }

  loadMenus() {
    const menusJson = localStorage.getItem('menus');
    if (!menusJson) return;
  
    const menus = JSON.parse(menusJson);
  
    this.navItems = menus.map((m: any) => ({
      label: m.Name,
      link: m.Path,
      queryParams: m.Path.includes('profilecompletion') ? { edit: true } : null
    }));
  }
}
