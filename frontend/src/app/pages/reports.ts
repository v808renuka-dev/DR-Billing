import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { Bill } from '../core/models';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [FormsModule, CurrencyPipe, DatePipe, RouterLink],
  template: `
    <div class="page-head no-print">
      <div><h1>Billing Reports</h1><p>Browse, filter and print bills</p></div>
      <button class="btn" (click)="print()">🖨 Print report</button>
    </div>

    <div class="print-head">
      <h2>{{ api.shop().shop_name }} – Billing Report</h2>
      <p>{{ api.shop().address }} · {{ api.shop().phone }}</p>
      <p>Period: {{ from || 'start' }} to {{ to || 'today' }}</p>
    </div>

    <div class="card no-print" style="margin-bottom:16px">
      <div class="form-row">
        <div><label>From</label><input type="date" [(ngModel)]="from" (ngModelChange)="load()" /></div>
        <div><label>To</label><input type="date" [(ngModel)]="to" (ngModelChange)="load()" /></div>
        <div><label>Search</label><input placeholder="Bill no. or customer" [(ngModel)]="search" (ngModelChange)="load()" /></div>
        <div style="align-self:end"><button class="btn ghost" (click)="today()">Today</button>
          <button class="btn ghost" style="margin-left:6px" (click)="clear()">Clear</button></div>
      </div>
    </div>

    <div class="grid cols-4" style="margin-bottom:16px">
      <div class="card"><label>Bills</label><b class="big">{{ summary().count }}</b></div>
      <div class="card"><label>Subtotal</label><b class="big">{{ summary().subtotal | currency:'INR':'symbol':'1.2-2' }}</b></div>
      <div class="card"><label>Discounts</label><b class="big">{{ summary().discount | currency:'INR':'symbol':'1.2-2' }}</b></div>
      <div class="card"><label>Net sales</label><b class="big">{{ summary().total | currency:'INR':'symbol':'1.2-2' }}</b></div>
    </div>

    <div class="card table-wrap"><table>
      <thead><tr><th>Bill no.</th><th>Date</th><th>Customer</th><th class="num">Subtotal</th><th class="num">Disc.</th><th class="num">Total</th><th class="no-print"></th></tr></thead>
      <tbody>
        @for (b of bills(); track b.id) {
          <tr><td><b>{{ b.bill_number }}</b></td><td>{{ b.created_at | date:'dd MMM yyyy, h:mm a' }}</td>
            <td>{{ b.customer_name || 'Walk-in' }}</td>
            <td class="num">{{ b.subtotal | currency:'INR':'symbol':'1.2-2' }}</td>
            <td class="num">{{ b.discount_percent }}%</td>
            <td class="num"><b>{{ b.total | currency:'INR':'symbol':'1.2-2' }}</b></td>
            <td class="no-print"><div class="actions"><a class="btn ghost sm" [routerLink]="['/invoice', b.id]">View / Print</a></div></td></tr>
        } @empty { <tr><td colspan="7" class="empty">No bills found</td></tr> }
      </tbody></table></div>
  `,
  styles: [`
    .big { font-size: 22px; color: var(--brand-dark); }
    .print-head { display: none; text-align: center; margin-bottom: 12px; }
    @media print { .print-head { display: block; } }
  `],
})
export class ReportsComponent {
  api = inject(ApiService);
  bills = signal<Bill[]>([]);
  summary = signal({ count: 0, subtotal: 0, discount: 0, total: 0 });
  from = '';
  to = '';
  search = '';

  constructor() { this.load(); }
  load() {
    const params: Record<string, string> = {};
    if (this.from) params['from'] = this.from;
    if (this.to) params['to'] = this.to;
    if (this.search) params['search'] = this.search;
    this.api.bills(params).subscribe(r => { this.bills.set(r.bills); this.summary.set(r.summary); });
  }
  today() {
    const d = new Date();
    this.from = this.to = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    this.load();
  }
  clear() { this.from = this.to = this.search = ''; this.load(); }
  print() { window.print(); }
}
