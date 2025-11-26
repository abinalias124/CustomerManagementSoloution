import { Routes } from '@angular/router';
import { Landing } from './auth/landing/landing';
import { Login } from './auth/login/login';
import { Register } from './auth/register/register';
import { authGuard } from './guards/auth-guard';
import { roleGuard } from './guards/role-guard';
import { Layout } from './layout/layout/layout';

export const routes: Routes = [
  { path: '', component: Landing },   //  default landing
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  {
    path: '',
    component: Layout,
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./admin/admindashboard/admindashboard').then(
            m => m.Admindashboard), canActivate: [authGuard, roleGuard],
        data: { role: 'admin' }
      },
      {
        path: 'productform',
        loadComponent: () =>
          import('./admin/productform/productform').then(
            m => m.Productform
          ),
        canActivate: [authGuard, roleGuard],
        data: { role: 'admin' }
      },
      {
        path: 'customermanagement',
        loadComponent: () =>
          import('./admin/customermanagement/customermanagement').then(
            m => m.Customermanagement
          ),
        canActivate: [authGuard, roleGuard],
        data: { role: 'admin' }
      },
      {
        path: 'approverequest',
        loadComponent: () =>
          import('./admin/approverequest/approverequest').then(
            m => m.Approverequest
          ),
        canActivate: [authGuard, roleGuard],
        data: { role: 'admin' }
      },

      {
        path: 'customerdashboard',
        loadComponent: () => import('./customer/customerdashboard/customerdashboard').then(
          m => m.Customerdashboard), canActivate: [authGuard, roleGuard],
        data: { role: 'customer' }
      },
      //  Customer product routes
      {
        path: 'customer/products',
        loadComponent: () =>
          import('./customer/productlist/productlist').then(
            m => m.Productlist
          ),
        canActivate: [authGuard, roleGuard],
        data: { role: 'customer' }
      },
      {
        path: 'customer/viewproduct',
        loadComponent: () =>
          import('./customer/viewproduct/viewproduct').then(
            m => m.Viewproduct
          ),
        canActivate: [authGuard, roleGuard],
        data: { role: 'customer' }
      },
      {
        path: 'customer/profilecompletion',
        loadComponent: () =>
          import('./customer/profilecompletion/profilecompletion').then(
            m => m.Profilecompletion
          ),
        canActivate: [authGuard, roleGuard],
        data: { role: 'customer' }
      },
      {
        path: 'customer/purchasehistory',
        loadComponent: () =>
          import('./customer/purchasehistory/purchasehistory').then(
            m => m.Purchasehistory
          ),
        canActivate: [authGuard, roleGuard],
        data: { role: 'customer' }
      },
      {
        path: 'customer/returnrequest',
        loadComponent: () =>
          import('./customer/returnrequest/returnrequest').then(
            m => m.Returnrequest
          ),
        canActivate: [authGuard, roleGuard],
        data: { role: 'customer' }
      }
    ]
  }
];
