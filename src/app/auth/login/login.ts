import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Auth } from '../../shared/services/auth';


@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule,RouterModule,CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
 loginForm: FormGroup;
 showPassword = false;

  constructor(
    private fb: FormBuilder,
    private auth: Auth,
    private router: Router,
    private toastr:ToastrService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      ]], 
      password: ['', [Validators.required]],
    });
   
    
  }
  ngOnInit(): void {
     
    localStorage.clear();     // if you are using localStorage too
  }
  
togglePassword() {
  this.showPassword = !this.showPassword;
}

onLogin() {
  if (this.loginForm.invalid) {
    this.toastr.warning('Email and password are required!');
    return;
  }

  console.log(this.loginForm.value);

  this.auth.login(this.loginForm.value).subscribe({
    next: (res: any) => {
      // Successful login
      localStorage.setItem('token', res.Token);
      localStorage.setItem('role', res.Role); 
      localStorage.setItem('userId', res.UserId);
      localStorage.setItem('email', res.Email);
      localStorage.setItem('menus', JSON.stringify(res.Menus)); 

      const role = res.Role.trim().toLowerCase();
      if (role === 'admin') {
        this.router.navigate(['/dashboard']); 
      } else {
        this.router.navigate(['/customerdashboard']);
      }
    },
    error: (err: any) => {
      // Handle errors here
      if (err?.error?.message) {
        this.toastr.error(err.error.message); // show backend message
      } else {
        this.toastr.error('Login failed. Please try again.');
      }
    }
  });
}

}