import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { errMsg } from '../core/auth';
import { Category, Product } from '../core/models';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [FormsModule, CurrencyPipe],
  template: `
    <div class="page-head">
      <div><h1>Products</h1><p>Manage your rope products and prices</p></div>
      <button class="btn" (click)="open()" [disabled]="!cats().length">+ Add Product</button>
    </div>
    @if (!cats().length) { <div class="alert">Create a product category first.</div> }
    @if (error() && !form()) { <div class="alert">{{ error() }}</div> }
    <div class="card">
      <div class="form-row" style="margin-bottom:12px">
        <input placeholder="Search products…" [(ngModel)]="search" (ngModelChange)="load()" />
        <select [(ngModel)]="catFilter" (ngModelChange)="load()">
          <option value="">All categories</option>
          @for (c of cats(); track c.id) { <option [value]="c.id">{{ c.name }}</option> }
        </select>
      </div>
      <div class="table-wrap"><table>
        <thead><tr><th>Name</th><th>Category</th><th>Unit</th><th class="num">Price</th><th></th></tr></thead>
        <tbody>
          @for (p of items(); track p.id) {
            <tr><td><b>{{ p.name }}</b><br><small>{{ p.description }}</small></td>
              <td><span class="badge">{{ p.category_name }}</span></td><td>{{ p.unit }}</td>
              <td class="num">{{ p.price | currency:'INR':'symbol':'1.2-2' }}</td>
              <td><div class="actions">
                <button class="btn ghost sm" (click)="open(p)">Edit</button>
                <button class="btn danger sm" (click)="remove(p)">Delete</button></div></td></tr>
          } @empty { <tr><td colspan="5" class="empty">No products found</td></tr> }
        </tbody></table></div>
    </div>

    @if (form(); as f) {
      <div class="modal-back" (click)="form.set(null)">
        <form class="modal" (click)="$event.stopPropagation()" (ngSubmit)="save()">
          <h2>{{ f.id ? 'Edit' : 'Add' }} Product</h2>
          @if (error()) { <div class="alert">{{ error() }}</div> }
          <div class="field"><label>Product name *</label><input name="n" [(ngModel)]="f.name" required /></div>
          <div class="form-row">
            <div class="field"><label>Category *</label>
              <select name="c" [(ngModel)]="f.category_id" required>
                @for (c of cats(); track c.id) { <option [ngValue]="c.id">{{ c.name }}</option> }
              </select></div>
            <div class="field"><label>Unit</label>
              <select name="u" [(ngModel)]="f.unit">
                @for (u of units; track u) { <option>{{ u }}</option> }
              </select></div>
          </div>
          <div class="field"><label>Price (₹) *</label><input name="p" type="number" min="0" step="0.01" [(ngModel)]="f.price" required /></div>
          <div class="field"><label>Description</label><textarea name="d" rows="2" [(ngModel)]="f.description"></textarea></div>
          <div class="modal-actions">
            <button type="button" class="btn ghost" (click)="form.set(null)">Cancel</button>
            <button class="btn">Save</button>
          </div>
        </form>
      </div>
    }
  `,
})
export class ProductsComponent {
  private api = inject(ApiService);
  items = signal<Product[]>([]);
  cats = signal<Category[]>([]);
  form = signal<Partial<Product> | null>(null);
  error = signal('');
  search = '';
  catFilter = '';
  units = ['Piece', 'Meter', 'Kg', 'Bundle', 'Coil', 'Foot'];

  constructor() { this.api.categories().subscribe(c => this.cats.set(c)); this.load(); }

  load() {
    const params: Record<string, string> = {};
    if (this.search) params['search'] = this.search;
    if (this.catFilter) params['categoryId'] = this.catFilter;
    this.api.products(params).subscribe(r => this.items.set(r));
  }
  open(p?: Product) {
    this.error.set('');
    this.form.set(p ? { ...p } : { name: '', category_id: this.cats()[0]?.id, unit: 'Piece', price: undefined, description: '' });
  }
  save() {
    this.api.saveProduct(this.form()!).subscribe({
      next: () => { this.form.set(null); this.load(); },
      error: e => this.error.set(errMsg(e)),
    });
  }
  remove(p: Product) {
    if (!confirm(`Delete product "${p.name}"? Past bills are not affected.`)) return;
    this.api.deleteProduct(p.id).subscribe({ next: () => this.load(), error: e => this.error.set(errMsg(e)) });
  }
}
