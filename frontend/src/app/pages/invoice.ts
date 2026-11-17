import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { Bill } from '../core/models';
import { RopeLogoComponent } from '../shared/logo';

@Component({
  selector: 'app-invoice',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, RouterLink, RopeLogoComponent],
  template: `
    <div class="page-head no-print">
      <h1>Invoice</h1>
      <div style="display:flex;gap:8px">
        <a routerLink="/reports" class="btn ghost">Back to reports</a>
        <a routerLink="/billing" class="btn ghost">New bill</a>
        <button class="btn" (click)="print()">🖨 Print</button>
      </div>
    </div>
    @if (bill(); as b) {
      <div class="card inv">
        <div class="head">
          <div class="shop">
            @if (shop().logo) { <img [src]="shop().logo" alt="logo" /> } @else { <app-rope-logo [size]="56" /> }
            <div>
              <h2>{{ shop().shop_name }}</h2>
              <div class="small">{{ shop().address }}</div>
              <div class="small">{{ shop().phone }} @if (shop().email) { · {{ shop().email }} }</div>
              @if (shop().gst_number) { <div class="small">GSTIN: {{ shop().gst_number }}</div> }
            </div>
          </div>
          <div class="meta">
            <h3>INVOICE</h3>
            <div><b>{{ b.bill_number }}</b></div>
            <div class="small">{{ b.created_at | date:'dd MMM yyyy, h:mm a' }}</div>
          </div>
        </div>
        <div class="cust"><span>Billed to</span><b>{{ b.customer_name || 'Walk-in customer' }}</b>
          @if (b.customer_phone) { <div class="small">{{ b.customer_phone }}</div> }</div>
        <table>
          <thead><tr><th>#</th><th>Item</th><th class="num">Rate</th><th class="num">Qty</th><th class="num">Amount</th></tr></thead>
          <tbody>
            @for (i of b.items; track i.id; let n = $index) {
              <tr><td>{{ n + 1 }}</td><td>{{ i.product_name }}</td>
                <td class="num">{{ i.price | currency:'INR':'symbol':'1.2-2' }} / {{ i.unit }}</td>
                <td class="num">{{ i.quantity }}</td>
                <td class="num">{{ i.amount | currency:'INR':'symbol':'1.2-2' }}</td></tr>
            }
          </tbody>
        </table>
        <div class="sum">
          <div><span>Subtotal</span><span>{{ b.subtotal | currency:'INR':'symbol':'1.2-2' }}</span></div>
          @if (b.discount_percent > 0) {
            <div><span>Discount ({{ b.discount_percent }}%)</span><span>− {{ b.discount_amount | currency:'INR':'symbol':'1.2-2' }}</span></div>
          }
          <div class="grand"><span>Total</span><span>{{ b.total | currency:'INR':'symbol':'1.2-2' }}</span></div>
        </div>
        <p class="foot">{{ shop().invoice_footer }}</p>
      </div>
    }
  `,
  styles: [`
    .inv { max-width: 820px; margin: 0 auto; padding: 32px; }
    .head { display: flex; justify-content: space-between; gap: 20px; flex-wrap: wrap; border-bottom: 3px solid var(--brand); padding-bottom: 16px; }
    .shop { display: flex; gap: 14px; align-items: center; }
    .shop img { height: 56px; max-width: 120px; object-fit: contain; }
    .small { color: var(--muted); font-size: 12px; }
    .meta { text-align: right; } .meta h3 { color: var(--brand); letter-spacing: .12em; }
    .cust { margin: 18px 0; } .cust span { display: block; color: var(--muted); font-size: 12px; text-transform: uppercase; }
    .sum { margin-left: auto; width: 280px; margin-top: 16px; display: grid; gap: 6px; }
    .sum div { display: flex; justify-content: space-between; }
    .grand { font-size: 18px; font-weight: 700; border-top: 2px solid var(--ink); padding-top: 8px; color: var(--brand-dark); }
    .foot { text-align: center; color: var(--muted); margin-top: 30px; }
    @media print { .inv { box-shadow: none; padding: 0; } }
  `],
})
export class InvoiceComponent {
  private api = inject(ApiService);
  bill = signal<Bill | null>(null);
  shop = this.api.shop;

  constructor() {
    const id = inject(ActivatedRoute).snapshot.paramMap.get('id')!;
    this.api.bill(id).subscribe(b => this.bill.set(b));
  }
  print() { window.print(); }
}
