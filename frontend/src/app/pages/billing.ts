import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../core/api.service';
import { errMsg } from '../core/auth';
import { Product } from '../core/models';

interface Line { product: Product; quantity: number; }

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [FormsModule, CurrencyPipe],
  template: `
    <div class="page-head"><div><h1>New Bill</h1><p>Select products, set quantity and generate the invoice</p></div></div>
    @if (error()) { <div class="alert">{{ error() }}</div> }
    <div class="layout">
      <div class="card">
        <h3>Add products</h3>
        <div class="form-row" style="margin:12px 0">
          <input placeholder="Search product…" [(ngModel)]="search" />
          <select [(ngModel)]="catFilter">
            <option value="">All categories</option>
            @for (c of categories(); track c) { <option>{{ c }}</option> }
          </select>
        </div>
        <div class="plist">
          @for (p of filtered(); track p.id) {
            <button class="prod" (click)="add(p)">
              <b>{{ p.name }}</b><small>{{ p.category_name }}</small>
              <span>{{ p.price | currency:'INR':'symbol':'1.2-2' }} / {{ p.unit }}</span>
            </button>
          } @empty { <p class="empty">No products found</p> }
        </div>
      </div>

      <div class="card">
        <h3>Bill</h3>
        <div class="form-row" style="margin:12px 0">
          <div><label>Customer name</label><input [(ngModel)]="customerName" placeholder="Walk-in customer" /></div>
          <div><label>Phone</label><input [(ngModel)]="customerPhone" /></div>
        </div>
        <div class="table-wrap"><table>
          <thead><tr><th>Item</th><th style="width:100px">Qty</th><th class="num">Amount</th><th></th></tr></thead>
          <tbody>
            @for (l of lines(); track l.product.id; let i = $index) {
              <tr><td>{{ l.product.name }}<br><small>{{ l.product.price | currency:'INR':'symbol':'1.2-2' }} / {{ l.product.unit }}</small></td>
                <td><input type="number" min="0.01" step="any" [ngModel]="l.quantity" (ngModelChange)="setQty(i, $event)" /></td>
                <td class="num">{{ l.product.price * l.quantity | currency:'INR':'symbol':'1.2-2' }}</td>
                <td><button class="btn danger sm" (click)="remove(i)">✕</button></td></tr>
            } @empty { <tr><td colspan="4" class="empty">Click a product to add it</td></tr> }
          </tbody></table></div>

        <div class="totals">
          <div><span>Subtotal</span><b>{{ subtotal() | currency:'INR':'symbol':'1.2-2' }}</b></div>
          <div><span>Discount (%)
            <input class="disc" type="number" min="0" max="100" step="any" [ngModel]="discount()" (ngModelChange)="setDiscount($event)" /></span>
            <b>− {{ discountAmount() | currency:'INR':'symbol':'1.2-2' }}</b></div>
          <div class="grand"><span>Total</span><b>{{ total() | currency:'INR':'symbol':'1.2-2' }}</b></div>
        </div>
        <button class="btn full" [disabled]="!lines().length || busy()" (click)="generate()">
          {{ busy() ? 'Saving…' : 'Generate Bill' }}</button>
      </div>
    </div>
  `,
  styles: [`
    .layout { display: grid; grid-template-columns: 1fr 1.2fr; gap: 16px; align-items: start; }
    @media (max-width: 980px) { .layout { grid-template-columns: 1fr; } }
    .plist { display: grid; gap: 8px; max-height: 520px; overflow: auto; }
    .prod { text-align: left; border: 1px solid var(--line); background: #fff; border-radius: 10px; padding: 10px 12px; cursor: pointer; display: grid; font: inherit; }
    .prod:hover { border-color: var(--brand); background: var(--brand-light); }
    .prod small { color: var(--muted); } .prod span { color: var(--brand-dark); font-weight: 600; }
    .totals { margin: 14px 0; display: grid; gap: 8px; }
    .totals div { display: flex; justify-content: space-between; align-items: center; }
    .disc { width: 80px; margin-left: 8px; padding: 5px 8px; }
    .grand { font-size: 20px; border-top: 2px dashed var(--line); padding-top: 10px; color: var(--brand-dark); }
    .full { width: 100%; justify-content: center; padding: 12px; }
  `],
})
export class BillingComponent {
  private api = inject(ApiService);
  private router = inject(Router);
  products = signal<Product[]>([]);
  lines = signal<Line[]>([]);
  discount = signal(0);
  error = signal('');
  busy = signal(false);
  search = '';
  catFilter = '';
  customerName = '';
  customerPhone = '';

  categories = computed(() => [...new Set(this.products().map(p => p.category_name!))]);
  subtotal = computed(() => this.round(this.lines().reduce((s, l) => s + this.round(l.product.price * l.quantity), 0)));
  discountAmount = computed(() => this.round((this.subtotal() * this.discount()) / 100));
  total = computed(() => this.round(this.subtotal() - this.discountAmount()));

  constructor() { this.api.products().subscribe(p => this.products.set(p)); }

  filtered() {
    const s = this.search.toLowerCase();
    return this.products().filter(p => (!s || p.name.toLowerCase().includes(s)) && (!this.catFilter || p.category_name === this.catFilter));
  }
  round(n: number) { return Math.round((n + Number.EPSILON) * 100) / 100; }

  add(p: Product) {
    const ls = this.lines();
    const i = ls.findIndex(l => l.product.id === p.id);
    this.lines.set(i >= 0 ? ls.map((l, k) => (k === i ? { ...l, quantity: l.quantity + 1 } : l)) : [...ls, { product: p, quantity: 1 }]);
  }
  setQty(i: number, v: number) { this.lines.update(ls => ls.map((l, k) => (k === i ? { ...l, quantity: Number(v) || 0 } : l))); }
  remove(i: number) { this.lines.update(ls => ls.filter((_, k) => k !== i)); }
  setDiscount(v: number) { this.discount.set(Math.min(100, Math.max(0, Number(v) || 0))); }

  generate() {
    this.error.set('');
    if (this.lines().some(l => !(l.quantity > 0))) { this.error.set('Every item needs a quantity greater than 0'); return; }
    this.busy.set(true);
    this.api.createBill({
      customer_name: this.customerName, customer_phone: this.customerPhone, discount_percent: this.discount(),
      items: this.lines().map(l => ({ product_id: l.product.id, quantity: l.quantity })),
    }).subscribe({
      next: r => this.router.navigate(['/invoice', r.id]),
      error: e => { this.error.set(errMsg(e)); this.busy.set(false); },
    });
  }
}
