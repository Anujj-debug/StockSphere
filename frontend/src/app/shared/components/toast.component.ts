import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../core/services/toast.service';
import { IconComponent } from './icons.component';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="fixed top-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border bg-white shadow-xl text-slate-800 transition-all duration-200 animate-slide-in"
          [ngClass]="{
            'border-emerald-200': toast.type === 'success',
            'border-rose-200': toast.type === 'error',
            'border-amber-200': toast.type === 'warning',
            'border-blue-200': toast.type === 'info'
          }"
        >
          <div class="shrink-0 mt-0.5">
            @if (toast.type === 'success') {
              <div class="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <app-icon name="check" class="w-3 h-3"></app-icon>
              </div>
            } @else if (toast.type === 'error') {
              <div class="w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                <app-icon name="x" class="w-3 h-3"></app-icon>
              </div>
            } @else if (toast.type === 'warning') {
              <div class="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                <app-icon name="alert-triangle" class="w-3 h-3"></app-icon>
              </div>
            } @else {
              <div class="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <app-icon name="info" class="w-3 h-3"></app-icon>
              </div>
            }
          </div>

          <div class="flex-1 min-w-0">
            <h4 class="text-xs font-semibold text-slate-900 tracking-tight">{{ toast.title }}</h4>
            <p class="text-xs text-slate-600 mt-0.5 break-words">{{ toast.message }}</p>
          </div>

          <button
            type="button"
            (click)="toastService.dismiss(toast.id)"
            class="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-100"
          >
            <app-icon name="x" class="w-3.5 h-3.5"></app-icon>
          </button>
        </div>
      }
    </div>
  `
})
export class ToastComponent {
  readonly toastService = inject(ToastService);
}
