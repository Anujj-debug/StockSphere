import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IconComponent } from '../shared/components/icons.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  template: `
    <aside class="w-64 h-screen sticky top-0 flex flex-col bg-white border-r border-slate-200 select-none z-40">
      <!-- Logo Header -->
      <div class="h-16 flex items-center gap-3 px-6 border-b border-slate-200 bg-white">
        <div class="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">
          <app-icon name="inventory" class="w-4 h-4"></app-icon>
        </div>
        <div>
          <h1 class="text-sm font-bold text-slate-900 tracking-tight">StockSphere</h1>
          <p class="text-[11px] text-slate-500">Retail Inventory System</p>
        </div>
      </div>

      <!-- Navigation Links -->
      <div class="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <!-- Overview -->
        <div>
          <div class="px-3 mb-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Overview</div>
          <nav class="space-y-0.5">
            <a
              routerLink="/dashboard"
              routerLinkActive="bg-slate-100 text-slate-900 font-semibold"
              class="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors group"
            >
              <div class="flex items-center gap-2.5">
                <app-icon name="dashboard" class="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors"></app-icon>
                <span>Dashboard</span>
              </div>
            </a>
          </nav>
        </div>

        <!-- Inventory & Catalog -->
        <div>
          <div class="px-3 mb-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Inventory & Facilities</div>
          <nav class="space-y-0.5">
            <a
              routerLink="/products"
              routerLinkActive="bg-slate-100 text-slate-900 font-semibold"
              class="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors group"
            >
              <div class="flex items-center gap-2.5">
                <app-icon name="products" class="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors"></app-icon>
                <span>Products & Catalog</span>
              </div>
            </a>

            <a
              routerLink="/warehouses"
              routerLinkActive="bg-slate-100 text-slate-900 font-semibold"
              class="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors group"
            >
              <div class="flex items-center gap-2.5">
                <app-icon name="warehouse" class="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors"></app-icon>
                <span>Warehouses & Bins</span>
              </div>
            </a>

            <a
              routerLink="/inventory"
              routerLinkActive="bg-slate-100 text-slate-900 font-semibold"
              class="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors group"
            >
              <div class="flex items-center gap-2.5">
                <app-icon name="inventory" class="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors"></app-icon>
                <span>Stock Levels & Ledger</span>
              </div>
              @if (lowStockCount > 0) {
                <span class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  {{ lowStockCount }} low
                </span>
              }
            </a>
          </nav>
        </div>

        <!-- Operations -->
        <div>
          <div class="px-3 mb-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Operations</div>
          <nav class="space-y-0.5">
            <a
              routerLink="/transfers"
              routerLinkActive="bg-slate-100 text-slate-900 font-semibold"
              class="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors group"
            >
              <div class="flex items-center gap-2.5">
                <app-icon name="transfers" class="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors"></app-icon>
                <span>Stock Transfers</span>
              </div>
              @if (inTransitCount > 0) {
                <span class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  {{ inTransitCount }} transit
                </span>
              }
            </a>

            <a
              routerLink="/adjustments"
              routerLinkActive="bg-slate-100 text-slate-900 font-semibold"
              class="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors group"
            >
              <div class="flex items-center gap-2.5">
                <app-icon name="adjustments" class="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors"></app-icon>
                <span>Cycle Counts & Audits</span>
              </div>
            </a>

            <a
              routerLink="/procurement"
              routerLinkActive="bg-slate-100 text-slate-900 font-semibold"
              class="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors group"
            >
              <div class="flex items-center gap-2.5">
                <app-icon name="procurement" class="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors"></app-icon>
                <span>Procurement (PO & GRN)</span>
              </div>
            </a>

            <a
              routerLink="/sales-orders"
              routerLinkActive="bg-slate-100 text-slate-900 font-semibold"
              class="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors group"
            >
              <div class="flex items-center gap-2.5">
                <app-icon name="orders" class="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors"></app-icon>
                <span>Sales Orders</span>
              </div>
              @if (pendingOrdersCount > 0) {
                <span class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  {{ pendingOrdersCount }} pending
                </span>
              }
            </a>
          </nav>
        </div>

        <!-- Agile Governance -->
        <div>
          <div class="px-3 mb-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Governance</div>
          <nav class="space-y-0.5">
            <a
              routerLink="/agile"
              routerLinkActive="bg-slate-100 text-slate-900 font-semibold"
              class="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors group"
            >
              <div class="flex items-center gap-2.5">
                <app-icon name="agile" class="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors"></app-icon>
                <span>Team & Governance</span>
              </div>
            </a>
          </nav>
        </div>
      </div>

      <!-- Footer Info -->
      <div class="p-3 border-t border-slate-200 bg-slate-50/60">
        <div class="flex items-center justify-between px-2 py-1 text-xs text-slate-500">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span class="font-medium text-slate-600">System Ready</span>
          </div>
          <span class="font-mono text-[11px] text-slate-400">v1.0.0</span>
        </div>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  @Input() lowStockCount = 0;
  @Input() inTransitCount = 0;
  @Input() pendingOrdersCount = 0;
}
