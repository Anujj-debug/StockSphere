import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from './icons.component';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 z-50 overflow-y-auto">
        <!-- Backdrop -->
        <div
          class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
          (click)="onClose()"
        ></div>

        <!-- Center modal wrapper -->
        <div class="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
          <div
            class="relative transform overflow-hidden rounded-xl bg-white border border-slate-200 text-left shadow-2xl transition-all sm:my-8 w-full max-w-2xl p-6"
            (click)="$event.stopPropagation()"
          >
            <!-- Header -->
            <div class="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-200">
              <div class="flex items-center gap-2.5">
                @if (icon) {
                  <div class="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
                    <app-icon [name]="icon" class="w-4 h-4"></app-icon>
                  </div>
                }
                <h3 class="text-base font-semibold text-slate-900 tracking-tight">{{ title }}</h3>
              </div>
              <button
                type="button"
                (click)="onClose()"
                class="rounded-lg p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <app-icon name="x" class="w-4 h-4"></app-icon>
              </button>
            </div>

            <!-- Body -->
            <div class="max-h-[75vh] overflow-y-auto pr-1">
              <ng-content></ng-content>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class ModalComponent {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() icon?: string;
  @Output() close = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }
}
