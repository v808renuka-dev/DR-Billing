import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../core/api.service';
import { errMsg } from '../core/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="wrap">
      <aside class="hero" aria-hidden="true">
        <div class="hero-inner">
          <div class="hero-logo">
            @if (api.shop().logo) { <img [src]="api.shop().logo" alt="" /> } @else { <img src="DR.png" alt="" /> }
          </div>
          <h2>{{ api.shop().shop_name }}</h2>
          <p>Shop management &amp; billing — inventory, invoices and customers in one place.</p>
        </div>
      </aside>
      <main class="panel">
      <form class="card box" (ngSubmit)="reset()" [hidden]="!forgot()">
        <div class="logo">
          @if (api.shop().logo) { <img [src]="api.shop().logo" alt="logo" /> } @else { <img src="DR.png" alt="logo" /> }
        </div>
        <h1>Reset password</h1>
        <p class="sub">Enter the recovery key from the server's <b>.env</b> file (RECOVERY_KEY)</p>
        @if (error()) { <div class="alert" role="alert">{{ error() }}</div> }
        <div class="field"><label for="ru">Username</label><input id="ru" name="ru" [(ngModel)]="username" required /></div>
        <div class="field"><label for="rk">Recovery key</label><input id="rk" name="rk" [(ngModel)]="recoveryKey" required /></div>
        <div class="field"><label for="rp">New password</label><input id="rp" name="rp" type="password" [(ngModel)]="newPassword" minlength="6" required /></div>
        <div class="field"><label for="rc">Confirm new password</label><input id="rc" name="rc" type="password" [(ngModel)]="confirm" required /></div>
        <button class="btn full" [disabled]="busy()">{{ busy() ? 'Saving…' : 'Reset password' }}</button>
        <a class="link" role="button" tabindex="0" (click)="back()" (keydown.enter)="back()">← Back to sign in</a>
      </form>
      <form class="card box" (ngSubmit)="submit()" [hidden]="forgot()">
        <div class="logo">
          @if (api.shop().logo) { <img [src]="api.shop().logo" alt="logo" /> } @else { <img src="DR.png" alt="logo" /> }
        </div>
        <h1>{{ api.shop().app_name }}</h1>
        <p class="sub">{{ api.shop().shop_name }} – Shop Management &amp; Billing</p>
        @if (info()) { <div class="alert ok" role="status">{{ info() }}</div> }
        @if (error()) { <div class="alert" role="alert">{{ error() }}</div> }
        <div class="field"><label for="u">Username</label>
          <input id="u" name="u" [(ngModel)]="username" autocomplete="username" required autofocus /></div>
        <div class="field"><label for="p">Password</label>
          <input id="p" name="p" type="password" [(ngModel)]="password" autocomplete="current-password" required /></div>
        <button class="btn full" [disabled]="busy()">{{ busy() ? 'Signing in…' : 'Sign in' }}</button>
        <a class="link" role="button" tabindex="0" (click)="forgot.set(true); error.set(''); info.set('')" (keydown.enter)="forgot.set(true); error.set(''); info.set('')">Forgot password?</a>
      </form>
      </main>
    </div>
  `,
  styles: [`
    .wrap { min-height: 100vh; display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr); background: var(--bg); }
    .hero { position: relative; display: flex; align-items: center; justify-content: center; padding: 48px; color: #fff; overflow: hidden;
      background: radial-gradient(circle at 15% 10%, rgba(147,180,255,.45), transparent 50%),
                  radial-gradient(circle at 90% 95%, rgba(147,180,255,.22), transparent 45%),
                  linear-gradient(145deg, #0b1b4d, #1e3a8a 55%, #4169e1); }
    .hero::after { content: ''; position: absolute; inset: 0; opacity: .07;
      background: repeating-linear-gradient(45deg, #fff 0 2px, transparent 2px 14px); }
    .hero-inner { position: relative; z-index: 1; max-width: 400px; }
    .hero-logo { display: block; margin-bottom: 36px; filter: drop-shadow(0 16px 32px rgba(5,15,60,.55)); }
    .hero-logo img { max-width: 220px; max-height: 220px; object-fit: contain; }
    .hero h2 { margin: 0 0 12px; font-size: 34px; line-height: 1.15; letter-spacing: -.02em; font-weight: 700; }
    .hero p { margin: 0; font-size: 16px; line-height: 1.6; color: rgba(255,255,255,.82); }
    .panel { display: grid; place-items: center; padding: 32px 20px; }
    .box.card { width: 100%; max-width: 420px; padding: 40px 36px; text-align: left; border-radius: 20px;
      border: 1px solid var(--line); box-shadow: 0 2px 4px rgba(20,40,100,.05), 0 24px 48px -12px rgba(20,40,100,.2); }
    .logo { margin-bottom: 20px; display: none; }
    .logo img { height: 88px; object-fit: contain; }
    h1 { margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -.02em; color: var(--ink); }
    .sub { color: var(--muted); margin: 6px 0 24px; font-size: 14px; line-height: 1.5; }
    .field { text-align: left; margin-bottom: 16px; }
    .field label { font-size: 13px; color: var(--ink); margin-bottom: 6px; }
    .field input { width: 100%; box-sizing: border-box; padding: 12px 14px; font-size: 15px; border-radius: 10px;
      border: 1.5px solid var(--line); background: #f9fbff; transition: border-color .15s, box-shadow .15s, background .15s; }
    .field input:hover { border-color: #b9c7ee; }
    .field input:focus { outline: none; background: #fff; border-color: #4169e1; box-shadow: 0 0 0 4px rgba(65,105,225,.2); }
    .alert { border: 1px solid #f5c2c2; font-size: 14px; }
    .alert.ok { border-color: #bfe5cc; }
    .link { color: #2f55c9; display: block; margin-top: 18px; text-align: center; cursor: pointer; font-size: 14px; font-weight: 500; border-radius: 6px; }
    .link:hover { text-decoration: underline; }
    .link:focus-visible { outline: 3px solid rgba(65,105,225,.4); outline-offset: 3px; }
    .full { width: 100%; justify-content: center; padding: 13px; font-size: 15px; font-weight: 600; border-radius: 10px; margin-top: 8px;
      background: linear-gradient(180deg, #4169e1, #1e3a8a); box-shadow: 0 6px 16px -4px rgba(30,58,138,.5);
      transition: transform .1s, box-shadow .15s, filter .15s; }
    .full:hover:not(:disabled) { filter: brightness(1.08); box-shadow: 0 8px 20px -4px rgba(30,58,138,.55); }
    .full:active:not(:disabled) { transform: translateY(1px); }
    .full:focus-visible { outline: 3px solid rgba(147,180,255,.9); outline-offset: 2px; }
    .full:disabled { opacity: .65; cursor: not-allowed; }
    @media (max-width: 860px) {
      .wrap { grid-template-columns: 1fr; background: radial-gradient(circle at top left, #a9c0ff, transparent 55%), linear-gradient(135deg, #0b1b4d, #4169e1); }
      .hero { display: none; }
      .logo { display: flex; justify-content: center; }
      .box.card { padding: 32px 24px; }
    }
    @media (prefers-reduced-motion: reduce) { .full, .field input { transition: none; } }
  `],
})
export class LoginComponent {
  api = inject(ApiService);
  private router = inject(Router);
  username = '';
  password = '';
  error = signal('');
  busy = signal(false);
  forgot = signal(false);
  info = signal('');
  recoveryKey = '';
  newPassword = '';
  confirm = '';

  back() { this.forgot.set(false); this.error.set(''); }
  reset() {
    this.error.set('');
    if (this.newPassword.length < 6) { this.error.set('Password must be at least 6 characters'); return; }
    if (this.newPassword !== this.confirm) { this.error.set('Passwords do not match'); return; }
    this.busy.set(true);
    this.api.resetPassword(this.username.trim(), this.recoveryKey.trim(), this.newPassword).subscribe({
      next: () => {
        this.busy.set(false); this.forgot.set(false); this.password = '';
        this.recoveryKey = this.newPassword = this.confirm = '';
        this.info.set('Password reset. Please sign in with your new password.');
      },
      error: e => { this.error.set(errMsg(e)); this.busy.set(false); },
    });
  }

  constructor() { if (this.api.token()) this.router.navigate(['/dashboard']); }

  submit() {
    this.error.set('');
    this.busy.set(true);
    this.api.login(this.username.trim(), this.password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: e => { this.error.set(errMsg(e)); this.busy.set(false); },
    });
  }
}
