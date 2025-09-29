import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Auth } from '../../shared/services/auth';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  
 
  role = localStorage.getItem('role');

  constructor(private router: Router,private auth: Auth, private toastr: ToastrService) {}
  // Getter to get the logged-in user's email from localStorage
  get email(): string {
    return localStorage.getItem('email') || '';
  }
  logout() {
    this.auth.logout().subscribe({
      next: (res) => {
        this.toastr.success(res.message || 'Logged out successfully');
        localStorage.clear();
        this.router.navigate(['/login']); // redirect to login
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Logout failed');
        // still clear and redirect if token is invalid
        localStorage.clear();
        this.router.navigate(['/login']);
      }
    });
  }
}
