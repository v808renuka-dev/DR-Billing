import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { Bill, Category, Product, Shop } from './models';

const BASE = 'http://localhost:3001/api';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private router = inject(Router);

  token = signal<string | null>(localStorage.getItem('dr_token'));
  userName = signal<string>(localStorage.getItem('dr_user') || '');
  shop = signal<Shop>({
    shop_name: 'Deshpande Ropes', app_name: 'DR Billing', address: '', phone: '', email: '',
    gst_number: '', logo: null, invoice_footer: '',
  });

  login(username: string, password: string) {
    return this.http.post<{ token: string; user: { fullName: string } }>(`${BASE}/auth/login`, { username, password })
      .pipe(tap(r => {
        localStorage.setItem('dr_token', r.token);
        localStorage.setItem('dr_user', r.user.fullName);
        this.token.set(r.token);
        this.userName.set(r.user.fullName);
      }));
  }
  resetPassword(username: string, recoveryKey: string, newPassword: string) {
    return this.http.post(`${BASE}/auth/reset-password`, { username, recoveryKey, newPassword });
  }
  logout() {
    localStorage.removeItem('dr_token');
    localStorage.removeItem('dr_user');
    this.token.set(null);
    this.router.navigate(['/login']);
  }

  loadShop() {
    return this.http.get<Shop>(`${BASE}/shop`).pipe(tap(s => {
      if (s?.shop_name) { this.shop.set(s); document.title = `${s.app_name} | ${s.shop_name}`; }
    }));
  }
  saveShop(s: Shop) {
    return this.http.put<Shop>(`${BASE}/shop`, s).pipe(tap(r => {
      this.shop.set(r); document.title = `${r.app_name} | ${r.shop_name}`;
    }));
  }

  dashboard() { return this.http.get<any>(`${BASE}/dashboard`); }

  categories() { return this.http.get<Category[]>(`${BASE}/categories`); }
  saveCategory(c: Partial<Category>) {
    return c.id ? this.http.put(`${BASE}/categories/${c.id}`, c) : this.http.post(`${BASE}/categories`, c);
  }
  deleteCategory(id: number) { return this.http.delete(`${BASE}/categories/${id}`); }

  products(params: Record<string, any> = {}) { return this.http.get<Product[]>(`${BASE}/products`, { params }); }
  saveProduct(p: Partial<Product>) {
    return p.id ? this.http.put(`${BASE}/products/${p.id}`, p) : this.http.post(`${BASE}/products`, p);
  }
  deleteProduct(id: number) { return this.http.delete(`${BASE}/products/${id}`); }

  createBill(body: any) { return this.http.post<{ id: number; bill_number: string }>(`${BASE}/bills`, body); }
  bills(params: Record<string, any> = {}) {
    return this.http.get<{ bills: Bill[]; summary: any }>(`${BASE}/bills`, { params });
  }
  bill(id: number | string) { return this.http.get<Bill>(`${BASE}/bills/${id}`); }
}
