import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../shared/components/icons.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <header class="h-16 border-b border-slate-200 bg-white sticky top-0 z-30 flex items-center justify-between px-6">
      <!-- Left: System Identity -->
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span class="text-xs font-semibold text-slate-800">StockSphere Inventory Management</span>
        </div>
      </div>

      <!-- Right: Action & Profile -->
      <div class="flex items-center gap-3">
        <button
          type="button"
          (click)="refresh.emit()"
          title="Refresh Metrics"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors shadow-sm"
        >
          <app-icon name="refresh" class="w-3.5 h-3.5 text-slate-500"></app-icon>
          <span>Refresh</span>
        </button>

        <div class="h-4 w-px bg-slate-200"></div>

        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-semibold text-slate-700">
            OP
          </div>
          <div class="text-left hidden sm:block">
            <div class="text-xs font-semibold text-slate-900 leading-none">Operations Manager</div>
            <div class="text-[11px] text-slate-500 leading-none mt-1">Inventory Operations</div>
          </div>
        </div>
      </div>
    </header>
  `
})
export class HeaderComponent {
  @Output() refresh = new EventEmitter<void>();
}
