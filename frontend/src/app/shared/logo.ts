import { Component, Input } from '@angular/core';

// Temporary rope-themed logo. Shown only when no custom logo is set in Shop Settings.
@Component({
  selector: 'app-rope-logo',
  standalone: true,
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 64 64" aria-label="Deshpande Ropes logo">
      <rect width="64" height="64" rx="14" fill="#4169e1" />
      <g fill="none" stroke-width="5" stroke-linecap="round">
        <path d="M18 46 C18 30 30 34 32 22 C34 10 46 18 46 18" stroke="#e8eeff" />
        <path d="M26 50 C26 38 38 40 40 30 C42 22 50 26 50 26" stroke="#93b4ff" />
      </g>
      <circle cx="46" cy="18" r="3.5" fill="#e8eeff" />
    </svg>`,
})
export class RopeLogoComponent {
  @Input() size = 40;
}
