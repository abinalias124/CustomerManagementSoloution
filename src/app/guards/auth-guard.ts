import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('token'); // check if user is logged in

  if (token) {
    return true; 
  } else {
    alert('You must log in first!');
    router.navigate(['/login']); 
    return false;
  }
};