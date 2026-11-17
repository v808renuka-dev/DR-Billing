import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, RouterLink],
  template: `
    <div class="page-head">
      <div><h1>Dashboard</h1><p>Welcome to {{ api.shop().app_name }} – {{ api.shop().shop_name }}</p></div>
      <a routerLink="/billing" class="btn">+ New Bill</a>
    </div>
    @if (d(); as d) {
      <div class="grid cols-4">
        <div class="card stat"><span>Today's Sales</span><b>{{ d.todaySales | currency:'INR':'symbol':'1.2-2' }}</b><small>{{ d.todayBills }} bills</small></div>
        <div class="card stat"><span>This Month</span><b>{{ d.monthSales | currency:'INR':'symbol':'1.2-2' }}</b></div>
        <div class="card stat"><span>Total Revenue</span><b>{{ d.totalRevenue | currency:'INR':'symbol':'1.2-2' }}</b><small>{{ d.totalBills }} bills</small></div>
        <div class="card stat"><span>Products / Categories</span><b>{{ d.products }} / {{ d.categories }}</b></div>
      </div>
      <div class="grid cols-2" style="margin-top:16px">
        <div class="card">
          <h3>Last 7 days</h3>
          <div class="bars">
            @for (x of days(); track x.day) {
              <div class="bar"><div class="fill" [style.height.%]="x.pct"></div>
                <small>{{ x.label }}</small><em>{{ x.total | currency:'INR':'symbol':'1.0-0' }}</em></div>
            }
          </div>
        </div>
        <div class="card">
          <h3>Recent bills</h3>
          <div class="table-wrap"><table>
            <tbody>
              @for (b of d.recent; track b.id) {
                <tr><td><a [routerLink]="['/invoice', b.id]">{{ b.bill_number }}</a><br><small>{{ b.created_at | date:'dd MMM, h:mm a' }}</small></td>
                  <td>{{ b.customer_name || 'Walk-in' }}</td>
                  <td class="num"><b>{{ b.total | currency:'INR':'symbol':'1.2-2' }}</b></td></tr>
              } @empty { <tr><td class="empty">No bills yet</td></tr> }
            </tbody></table></div>
        </div>
      </div>
    } @else if (error()) { <div class="alert">{{ error() }}</div> }
  `,
  styles: [`
    .stat span { color: var(--muted); font-weight: 600; font-size: 12px; text-transform: uppercase; }
    .stat b { display: block; font-size: 26px; margin: 6px 0 2px; color: var(--brand-dark); }
    .stat small { color: var(--muted); }
    .bars { display: flex; gap: 10px; align-items: flex-end; height: 190px; margin-top: 14px; }
    .bar { flex: 1; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; height: 100%; text-align: center; }
    .fill { width: 100%; max-width: 38px; background: linear-gradient(180deg, var(--accent), var(--brand)); border-radius: 6px 6px 0 0; min-height: 3px; }
    .bar em { font-style: normal; font-size: 11px; color: var(--muted); }
  `],
})
export class DashboardComponent {
  api = inject(ApiService);
  d = signal<any>(null);
  error = signal('');
  days = signal<{ day: string; label: string; total: number; pct: number }[]>([]);

  constructor() {
    this.api.dashboard().subscribe({
      next: d => {
        this.d.set(d);
        const map = new Map<string, number>(d.daily.map((x: any) => [x.day, Number(x.total)]));
        const list = [];
        for (let i = 6; i >= 0; i--) {
          const dt = new Date(); dt.setDate(dt.getDate() - i);
          const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
          list.push({ day: key, label: dt.toLocaleDateString('en-IN', { weekday: 'short' }), total: map.get(key) || 0, pct: 0 });
        }
        const max = Math.max(...list.map(x => x.total), 1);
        list.forEach(x => (x.pct = (x.total / max) * 70));
        this.days.set(list);
      },
      error: () => this.error.set('Could not load dashboard. Check that the server is running.'),
    });
  }
}
