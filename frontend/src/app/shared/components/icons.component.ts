import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      vertical-align: middle;
      flex-shrink: 0;
      line-height: 0;
    }
    :host:not([class*="w-"]) {
      width: 1.25rem;
    }
    :host:not([class*="h-"]) {
      height: 1.25rem;
    }
    svg {
      width: 100%;
      height: 100%;
      display: block;
    }
  `],
  template: `
    <svg
      [attr.fill]="fill || 'none'"
      [attr.stroke]="stroke || 'currentColor'"
      [attr.stroke-width]="strokeWidth || 1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      viewBox="0 0 24 24"
    >
      <!-- Dashboard -->
      @if (name === 'dashboard') {
        <rect width="7" height="9" x="3" y="3" rx="1" />
        <rect width="7" height="5" x="14" y="3" rx="1" />
        <rect width="7" height="9" x="14" y="12" rx="1" />
        <rect width="7" height="5" x="3" y="16" rx="1" />
      }
      <!-- Products / Box / Package -->
      @else if (name === 'products' || name === 'box' || name === 'package') {
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <path d="m3.3 7 8.7 5 8.7-5" />
        <path d="M12 22V12" />
      }
      <!-- Warehouse -->
      @else if (name === 'warehouse' || name === 'building') {
        <path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-4.8a2 2 0 0 1 2.08 0l8 4.8A2 2 0 0 1 22 8.35Z" />
        <path d="M6 18h12" />
        <path d="M6 14h12" />
        <rect width="4" height="4" x="10" y="18" />
      }
      <!-- Inventory / Layers / Database -->
      @else if (name === 'inventory') {
        <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.9a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
        <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
        <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
      }
      <!-- Transfers / ArrowLeftRight -->
      @else if (name === 'transfers' || name === 'arrow-left-right') {
        <path d="m16 3 4 4-4 4" />
        <path d="M20 7H4" />
        <path d="m8 21-4-4 4-4" />
        <path d="M4 17h16" />
      }
      <!-- Adjustments / Sliders -->
      @else if (name === 'adjustments') {
        <line x1="4" x2="4" y1="21" y2="14" />
        <line x1="4" x2="4" y1="10" y2="3" />
        <line x1="12" x2="12" y1="21" y2="12" />
        <line x1="12" x2="12" y1="8" y2="3" />
        <line x1="20" x2="20" y1="21" y2="16" />
        <line x1="20" x2="20" y1="12" y2="3" />
        <line x1="1" x2="7" y1="14" y2="14" />
        <line x1="9" x2="15" y1="8" y2="8" />
        <line x1="17" x2="23" y1="16" y2="16" />
      }
      <!-- Procurement / Truck / PO -->
      @else if (name === 'procurement' || name === 'truck') {
        <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
        <path d="M15 18H9" />
        <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14v10Z" />
        <circle cx="17" cy="18" r="2" />
        <circle cx="7" cy="18" r="2" />
      }
      <!-- Orders / ShoppingCart -->
      @else if (name === 'orders' || name === 'cart') {
        <circle cx="8" cy="21" r="1" />
        <circle cx="19" cy="21" r="1" />
        <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
      }
      <!-- Agile / GitPullRequest / Board -->
      @else if (name === 'agile' || name === 'sprint') {
        <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
        <polyline points="13 14 17 10 13 6" />
      }
      <!-- Plus -->
      @else if (name === 'plus') {
        <path d="M5 12h14" />
        <path d="M12 5v14" />
      }
      <!-- Check -->
      @else if (name === 'check') {
        <path d="M20 6 9 17l-5-5" />
      }
      <!-- X / Close -->
      @else if (name === 'x') {
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
      }
      <!-- Search -->
      @else if (name === 'search') {
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      }
      <!-- Refresh -->
      @else if (name === 'refresh') {
        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
        <path d="M16 16h5v5" />
      }
      <!-- Alert Triangle -->
      @else if (name === 'alert-triangle' || name === 'warning') {
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
        <line x1="12" x2="12" y1="9" y2="13" />
        <line x1="12" x2="12.01" y1="17" y2="17" />
      }
      <!-- Dollar Sign -->
      @else if (name === 'dollar-sign') {
        <line x1="12" x2="12" y1="2" y2="22" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      }
      <!-- Trending Up -->
      @else if (name === 'trending-up') {
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="16 7 22 7 22 13" />
      }
      <!-- Filter -->
      @else if (name === 'filter') {
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
      }
      <!-- Edit / Pencil -->
      @else if (name === 'edit') {
        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      }
      <!-- Trash -->
      @else if (name === 'trash') {
        <path d="M3 6h18" />
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      }
      <!-- Users -->
      @else if (name === 'users') {
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      }
      <!-- Clock -->
      @else if (name === 'clock') {
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      }
      <!-- Tag -->
      @else if (name === 'tag') {
        <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
        <path d="M7 7h.01" />
      }
      <!-- Shield Check -->
      @else if (name === 'shield-check') {
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        <path d="m9 12 2 2 4-4" />
      }
      <!-- Chevron Right -->
      @else if (name === 'chevron-right') {
        <path d="m9 18 6-6-6-6" />
      }
      <!-- Chevron Down -->
      @else if (name === 'chevron-down') {
        <path d="m6 9 6 6 6-6" />
      }
      <!-- Info -->
      @else if (name === 'info') {
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
      }
      <!-- Default fallback -->
      @else {
        <circle cx="12" cy="12" r="10" />
      }
    </svg>
  `
})
export class IconComponent {
  @Input() name = 'box';
  @Input() fill?: string;
  @Input() stroke?: string;
  @Input() strokeWidth?: number;
}
