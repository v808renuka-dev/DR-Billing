import { Routes } from '@angular/router';
import { authGuard } from './core/auth';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./pages/login').then(m => m.LoginComponent) },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./shared/layout').then(m => m.LayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard').then(m => m.DashboardComponent) },
      { path: 'categories', loadComponent: () => import('./pages/categories').then(m => m.CategoriesComponent) },
      { path: 'products', loadComponent: () => import('./pages/products').then(m => m.ProductsComponent) },
      { path: 'billing', loadComponent: () => import('./pages/billing').then(m => m.BillingComponent) },
      { path: 'reports', loadComponent: () => import('./pages/reports').then(m => m.ReportsComponent) },
      { path: 'invoice/:id', loadComponent: () => import('./pages/invoice').then(m => m.InvoiceComponent) },
      { path: 'settings', loadComponent: () => import('./pages/settings').then(m => m.SettingsComponent) },
    ],
  },
  { path: '**', redirectTo: '' },
];
