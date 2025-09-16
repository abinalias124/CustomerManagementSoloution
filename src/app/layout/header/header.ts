import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  
 
  role = localStorage.getItem('role');

  constructor(private router: Router) {}

  goToProfile() {
    // Navigate to profile page with edit mode
    this.router.navigate(['/customer/profilecompletion'], { queryParams: { edit: true } });
  }

  logout() {
    localStorage.clear();
    window.location.href = '/login'; // redirect
  }
}
