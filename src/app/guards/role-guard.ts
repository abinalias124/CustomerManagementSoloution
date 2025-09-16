import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const router = inject(Router);

  const role = localStorage.getItem('role')?.trim().toLowerCase(); // "admin" or "customer"
  const expectedRole = route.data?.['role']?.toLowerCase(); // ensure same key as route

  if (role && expectedRole && role === expectedRole) {
    return true;
  } else {
    alert('Access denied! You do not have permission to view this page.');
    router.navigate(['/login']);
    return false;
  }
}