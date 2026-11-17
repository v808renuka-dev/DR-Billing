import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { errMsg } from '../core/auth';
import { Shop } from '../core/models';
import { RopeLogoComponent } from '../shared/logo';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule, RopeLogoComponent],
  template: `
    <div class="page-head"><div><h1>Shop Settings</h1><p>Shop details and logo shown on invoices and reports</p></div></div>
    @if (msg()) { <div class="alert ok">{{ msg() }}</div> }
    @if (error()) { <div class="alert">{{ error() }}</div> }
    <form class="card" style="max-width:720px" (ngSubmit)="save()">
      <div class="field">
        <label>Logo</label>
        <div style="display:flex;gap:14px;align-items:center;flex-wrap:wrap">
          @if (s.logo) { <img [src]="s.logo" style="height:56px;max-width:140px;object-fit:contain" alt="logo" /> }
          @else { <app-rope-logo [size]="56" /> }
          <input type="file" accept="image/*" (change)="pick($event)" style="width:auto" />
          @if (s.logo) { <button type="button" class="btn ghost sm" (click)="s.logo = null">Use default logo</button> }
        </div>
      </div>
      <div class="form-row">
        <div class="field"><label>Shop name *</label><input name="sn" [(ngModel)]="s.shop_name" required /></div>
        <div class="field"><label>Application name *</label><input name="an" [(ngModel)]="s.app_name" required /></div>
      </div>
      <div class="field"><label>Address</label><textarea name="ad" rows="2" [(ngModel)]="s.address"></textarea></div>
      <div class="form-row">
        <div class="field"><label>Phone</label><input name="ph" [(ngModel)]="s.phone" /></div>
        <div class="field"><label>Email</label><input name="em" [(ngModel)]="s.email" /></div>
        <div class="field"><label>GST number</label><input name="gs" [(ngModel)]="s.gst_number" /></div>
      </div>
      <div class="field"><label>Invoice footer note</label><input name="ft" [(ngModel)]="s.invoice_footer" /></div>
      <button class="btn">Save settings</button>
    </form>
  `,
})
export class SettingsComponent {
  private api = inject(ApiService);
  s: Shop = { ...this.api.shop() };
  msg = signal('');
  error = signal('');

  constructor() { this.api.loadShop().subscribe(() => (this.s = { ...this.api.shop() })); }

  pick(ev: Event) {
    const f = (ev.target as HTMLInputElement).files?.[0];
    if (!f) return;
    if (f.size > 1024 * 1024) { this.error.set('Logo must be smaller than 1 MB'); return; }
    this.error.set('');
    const r = new FileReader();
    r.onload = () => (this.s.logo = r.result as string);
    r.readAsDataURL(f);
  }
  save() {
    this.msg.set(''); this.error.set('');
    this.api.saveShop(this.s).subscribe({
      next: () => this.msg.set('Settings saved'),
      error: e => this.error.set(errMsg(e)),
    });
  }
}
