import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ApiService } from '../core/api.service';
import { RopeLogoComponent } from './logo';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, RopeLogoComponent],
  template: `
    <div class="shell">
      <aside class="side no-print" [class.open]="open()">
        <div class="brand">
          @if (api.shop().logo) { <img [src]="api.shop().logo" alt="logo" /> } @else { <app-rope-logo [size]="42" /> }
          <div>
            <strong>{{ api.shop().app_name }}</strong>
            <small>{{ api.shop().shop_name }}</small>
          </div>
        </div>
        <nav (click)="open.set(false)">
          @for (n of nav; track n.path) {
            <a [routerLink]="n.path" routerLinkActive="active"><span>{{ n.icon }}</span>{{ n.label }}</a>
          }
        </nav>
        <div class="user">
          <span>👤 {{ api.userName() }}</span>
          <button class="btn ghost sm" (click)="api.logout()">Logout</button>
        </div>
      </aside>
      <div class="main">
        <header class="top no-print">
          <button class="burger" (click)="open.set(!open())" aria-label="Menu">☰</button>
          <strong>{{ api.shop().app_name }}</strong>
        </header>
        <main><router-outlet /></main>
      </div>
    </div>
  `,
  styles: [`
    .shell { display: flex; min-height: 100vh; }
    .side { width: 250px; background: linear-gradient(180deg, #0b1b4d, #1e3a8a); color: #eaf0ff; display: flex; flex-direction: column; padding: 18px 14px; position: sticky; top: 0; height: 100vh; flex-shrink: 0; }
    .brand { display: flex; gap: 10px; align-items: center; padding: 4px 8px 20px; }
    .brand img { width: 42px; height: 42px; object-fit: contain; border-radius: 10px; background: #fff; }
    .brand strong { display: block; font-size: 17px; }
    .brand small { color: #b4c6f5; }
    nav { flex: 1; display: flex; flex-direction: column; gap: 4px; }
    nav a { color: #eaf0ff; padding: 10px 12px; border-radius: 10px; display: flex; gap: 10px; align-items: center; font-weight: 500; }
    nav a:hover { background: rgba(255, 255, 255, .08); }
    nav a.active { background: var(--accent); color: #0b1b4d; font-weight: 700; }
    .user { display: flex; justify-content: space-between; align-items: center; gap: 8px; font-size: 13px; padding: 8px; }
    .main { flex: 1; min-width: 0; }
    main { padding: 24px; max-width: 1200px; margin: 0 auto; }
    .top { display: none; align-items: center; gap: 12px; padding: 12px 16px; background: #fff; box-shadow: var(--shadow); position: sticky; top: 0; z-index: 20; }
    .burger { border: 0; background: none; font-size: 22px; cursor: pointer; }
    @media (max-width: 860px) {
      .side { position: fixed; z-index: 40; left: -270px; transition: left .2s; }
      .side.open { left: 0; }
      .top { display: flex; }
      main { padding: 16px; }
    }
    @media print { .side, .top { display: none; } main { padding: 0; max-width: none; } }
  `],
})
export class LayoutComponent {
  api = inject(ApiService);
  open = signal(false);
  nav = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/billing', label: 'New Bill', icon: '🧾' },
    { path: '/reports', label: 'Billing Reports', icon: '📑' },
    { path: '/products', label: 'Products', icon: '📦' },
    { path: '/categories', label: 'Categories', icon: '🗂️' },
    { path: '/settings', label: 'Shop Settings', icon: '⚙️' },
  ];
}
