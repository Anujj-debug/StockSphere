import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService } from '../../core/services/dashboard.service';
import { InventoryService } from '../../core/services/inventory.service';
import { ToastService } from '../../core/services/toast.service';
import { DashboardSummary } from '../../core/models/dashboard.model';
import { InventoryTransaction } from '../../core/models/inventory.model';
import { IconComponent } from '../../shared/components/icons.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  template: `
    <div class="space-y-6 animate-fade-in">
      <!-- Top Title and Action Buttons -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-slate-900 tracking-tight">Executive Dashboard</h2>
          <p class="text-xs text-slate-500 mt-0.5">
            Multi-facility inventory valuation, throughput analytics, and operational metrics.
          </p>
        </div>

        <div class="flex items-center gap-2.5">
          <button
            type="button"
            (click)="loadData()"
            [disabled]="loading()"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors shadow-sm disabled:opacity-50"
          >
            <app-icon name="refresh" class="w-3.5 h-3.5" [class]="loading() ? 'animate-spin' : ''"></app-icon>
            <span>Sync</span>
          </button>

          <a
            routerLink="/procurement"
            class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium shadow-sm transition-colors"
          >
            <app-icon name="plus" class="w-3.5 h-3.5"></app-icon>
            <span>Issue PO</span>
          </a>

          <a
            routerLink="/sales-orders"
            class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium shadow-sm transition-colors"
          >
            <app-icon name="cart" class="w-3.5 h-3.5"></app-icon>
            <span>New Order</span>
          </a>
        </div>
      </div>

      <!-- Safety Threshold Alert Banner -->
      @if (summary() && (summary()!.lowStockCount > 0 || summary()!.outOfStockCount > 0)) {
        <div class="p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
              <app-icon name="alert-triangle" class="w-4 h-4"></app-icon>
            </div>
            <div>
              <h4 class="text-xs font-semibold text-amber-900">Inventory Safety Threshold Warning</h4>
              <p class="text-xs text-amber-700 mt-0.5">
                {{ summary()!.lowStockCount }} items below reorder point and {{ summary()!.outOfStockCount }} out of stock across facilities.
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <a
              routerLink="/inventory"
              class="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-medium text-xs hover:bg-amber-500 transition-colors shadow-sm"
            >
              Review Stock Matrix
            </a>
          </div>
        </div>
      }

      <!-- Main KPI Stat Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- 1. Total Valuation -->
        <div class="p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-slate-500">Total Stock Valuation</span>
            <div class="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <app-icon name="dollar-sign" class="w-4 h-4"></app-icon>
            </div>
          </div>
          <div class="mt-2">
            <div class="text-2xl font-bold text-slate-900 tracking-tight font-mono">
              \${{ (summary()?.totalInventoryValuation || 0) | number:'1.2-2' }}
            </div>
            <div class="text-xs text-slate-500 mt-1">
              Valuation across {{ summary()?.totalWarehouses || 0 }} active facilities
            </div>
          </div>
        </div>

        <!-- 2. Units On Hand -->
        <div class="p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-slate-500">Total Units On Hand</span>
            <div class="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <app-icon name="inventory" class="w-4 h-4"></app-icon>
            </div>
          </div>
          <div class="mt-2">
            <div class="text-2xl font-bold text-slate-900 tracking-tight font-mono">
              {{ (summary()?.totalStockUnitsOnHand || 0) | number }}
            </div>
            <div class="text-xs text-slate-500 mt-1">
              {{ summary()?.activeProducts || 0 }} active product SKUs
            </div>
          </div>
        </div>

        <!-- 3. Sales Revenue -->
        <div class="p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-slate-500">Fulfillment Revenue</span>
            <div class="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <app-icon name="cart" class="w-4 h-4"></app-icon>
            </div>
          </div>
          <div class="mt-2">
            <div class="text-2xl font-bold text-slate-900 tracking-tight font-mono">
              \${{ (summary()?.totalSalesRevenue || 0) | number:'1.2-2' }}
            </div>
            <div class="text-xs text-slate-500 mt-1">
              {{ summary()?.pendingSalesOrdersCount || 0 }} orders pending dispatch
            </div>
          </div>
        </div>

        <!-- 4. Procurement Spend -->
        <div class="p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-slate-500">Procurement Committed</span>
            <div class="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <app-icon name="truck" class="w-4 h-4"></app-icon>
            </div>
          </div>
          <div class="mt-2">
            <div class="text-2xl font-bold text-slate-900 tracking-tight font-mono">
              \${{ (summary()?.totalProcurementSpend || 0) | number:'1.2-2' }}
            </div>
            <div class="text-xs text-slate-500 mt-1">
              {{ summary()?.inTransitTransfersCount || 0 }} transfers in transit
            </div>
          </div>
        </div>
      </div>

      <!-- Mid Section: Facility Valuation & Fast Actions -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Warehouse Valuation Breakdown (2 cols) -->
        <div class="lg:col-span-2 p-5 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="text-sm font-semibold text-slate-900">Facility Valuation Distribution</h3>
                <p class="text-xs text-slate-500">Current asset allocation by facility hub</p>
              </div>
              <a routerLink="/warehouses" class="text-xs text-blue-600 hover:text-blue-700 font-medium">
                Manage Facilities &rarr;
              </a>
            </div>

            <div class="space-y-3 mt-4">
              @for (entry of getValuationEntries(); track entry.warehouse) {
                <div class="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div class="flex items-center justify-between mb-1.5 text-xs">
                    <span class="font-medium text-slate-800">{{ entry.warehouse }}</span>
                    <div class="font-mono text-slate-700 font-semibold">
                      \${{ entry.amount | number:'1.2-2' }}
                      <span class="text-slate-400 font-normal ml-1">({{ entry.percentage }}%)</span>
                    </div>
                  </div>
                  <div class="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      class="h-full bg-slate-800 rounded-full transition-all duration-300"
                      [style.width.%]="entry.percentage"
                    ></div>
                  </div>
                </div>
              }
            </div>
          </div>

          <div class="mt-5 pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
            <span>Valuation Formula: Sum(Quantity On Hand &times; Unit Cost)</span>
            <span class="font-medium text-slate-700">Automated GRN Cost Revaluation</span>
          </div>
        </div>

        <!-- Operations Navigation (1 col) -->
        <div class="p-5 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 class="text-sm font-semibold text-slate-900">Operations Hub</h3>
            <p class="text-xs text-slate-500">Direct shortcuts to active retail workflows</p>

            <div class="space-y-2.5 mt-4">
              <a
                routerLink="/transfers"
                class="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors group"
              >
                <div class="flex items-center gap-2.5">
                  <div class="w-7 h-7 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center">
                    <app-icon name="arrow-left-right" class="w-3.5 h-3.5"></app-icon>
                  </div>
                  <div>
                    <div class="text-xs font-semibold text-slate-800 group-hover:text-slate-900">Stock Transfers</div>
                    <div class="text-[11px] text-slate-500">Move inventory between hubs</div>
                  </div>
                </div>
                <app-icon name="chevron-right" class="w-3.5 h-3.5 text-slate-400"></app-icon>
              </a>

              <a
                routerLink="/adjustments"
                class="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors group"
              >
                <div class="flex items-center gap-2.5">
                  <div class="w-7 h-7 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center">
                    <app-icon name="adjustments" class="w-3.5 h-3.5"></app-icon>
                  </div>
                  <div>
                    <div class="text-xs font-semibold text-slate-800 group-hover:text-slate-900">Cycle Count Audits</div>
                    <div class="text-[11px] text-slate-500">Reconcile physical variance</div>
                  </div>
                </div>
                <app-icon name="chevron-right" class="w-3.5 h-3.5 text-slate-400"></app-icon>
              </a>

              <a
                routerLink="/procurement"
                class="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors group"
              >
                <div class="flex items-center gap-2.5">
                  <div class="w-7 h-7 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center">
                    <app-icon name="shield-check" class="w-3.5 h-3.5"></app-icon>
                  </div>
                  <div>
                    <div class="text-xs font-semibold text-slate-800 group-hover:text-slate-900">Goods Receipt (GRN)</div>
                    <div class="text-[11px] text-slate-500">Dock verification and restock</div>
                  </div>
                </div>
                <app-icon name="chevron-right" class="w-3.5 h-3.5 text-slate-400"></app-icon>
              </a>

              <a
                routerLink="/agile"
                class="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors group"
              >
                <div class="flex items-center gap-2.5">
                  <div class="w-7 h-7 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center">
                    <app-icon name="agile" class="w-3.5 h-3.5"></app-icon>
                  </div>
                  <div>
                    <div class="text-xs font-semibold text-slate-800 group-hover:text-slate-900">Team & Governance</div>
                    <div class="text-[11px] text-slate-500">Role assignments and project matrix</div>
                  </div>
                </div>
                <app-icon name="chevron-right" class="w-3.5 h-3.5 text-slate-400"></app-icon>
              </a>
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-400">
            Standard Operating Procedures Enabled
          </div>
        </div>
      </div>

      <!-- Recent Transactions Table -->
      <div class="rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div class="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
          <div>
            <h3 class="text-sm font-semibold text-slate-900">Recent Audit Transactions</h3>
            <p class="text-xs text-slate-500">Immutable ledger log of inventory movements</p>
          </div>
          <a routerLink="/inventory" class="text-xs text-blue-600 hover:text-blue-700 font-medium">
            View All Ledger Records &rarr;
          </a>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 text-slate-600 uppercase tracking-wider border-b border-slate-200 font-semibold">
              <tr>
                <th class="py-3 px-4">Transaction Number</th>
                <th class="py-3 px-4">Type</th>
                <th class="py-3 px-4">Product</th>
                <th class="py-3 px-4">Facility</th>
                <th class="py-3 px-4 text-center">Change</th>
                <th class="py-3 px-4 text-right">Balance</th>
                <th class="py-3 px-4">User</th>
                <th class="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-700">
              @for (txn of transactions().slice(0, 7); track txn.id) {
                <tr class="hover:bg-slate-50/80 transition-colors">
                  <td class="py-3 px-4 font-mono font-medium text-slate-900">{{ txn.transactionNumber }}</td>
                  <td class="py-3 px-4">
                    <span
                      class="px-2 py-0.5 rounded text-[10px] font-semibold border"
                      [ngClass]="{
                        'bg-emerald-50 text-emerald-700 border-emerald-200': txn.type === 'INITIAL_STOCK' || txn.type === 'PURCHASE_RECEIPT' || txn.type === 'TRANSFER_IN' || txn.type === 'ADJUSTMENT_POSITIVE',
                        'bg-amber-50 text-amber-700 border-amber-200': txn.type === 'TRANSFER_OUT',
                        'bg-rose-50 text-rose-700 border-rose-200': txn.type === 'SALES_FULFILLMENT' || txn.type === 'ADJUSTMENT_NEGATIVE'
                      }"
                    >
                      {{ txn.type }}
                    </span>
                  </td>
                  <td class="py-3 px-4 font-medium text-slate-900">{{ txn.product?.name || 'SKU' }}</td>
                  <td class="py-3 px-4 text-slate-600">{{ txn.warehouse?.name }}</td>
                  <td class="py-3 px-4 text-center font-bold font-mono" [ngClass]="txn.quantityChange >= 0 ? 'text-emerald-600' : 'text-rose-600'">
                    {{ txn.quantityChange >= 0 ? '+' + txn.quantityChange : txn.quantityChange }}
                  </td>
                  <td class="py-3 px-4 text-right font-mono text-slate-600">
                    {{ txn.quantityBefore }} &rarr; <span class="font-bold text-slate-900">{{ txn.quantityAfter }}</span>
                  </td>
                  <td class="py-3 px-4 text-slate-500">{{ txn.performedBy || 'System' }}</td>
                  <td class="py-3 px-4 text-right text-slate-500 font-mono text-[11px]">{{ txn.createdAt | date:'short' }}</td>
                </tr>
              }
              @if (transactions().length === 0) {
                <tr>
                  <td colspan="8" class="text-center py-8 text-slate-400">
                    No recent transactions recorded.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly inventoryService = inject(InventoryService);
  private readonly toast = inject(ToastService);

  readonly summary = signal<DashboardSummary | null>(null);
  readonly transactions = signal<InventoryTransaction[]>([]);
  readonly loading = signal(false);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.dashboardService.getSummary().subscribe({
      next: (data) => {
        this.summary.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('Sync Error', 'Could not fetch dashboard summary. Please try again.');
        this.loading.set(false);
      }
    });

    this.inventoryService.getRecentTransactions().subscribe({
      next: (txns) => this.transactions.set(txns),
      error: () => {}
    });
  }

  getValuationEntries(): { warehouse: string; amount: number; percentage: number }[] {
    const s = this.summary();
    if (!s || !s.warehouseValuations) return [];

    const total = s.totalInventoryValuation > 0 ? s.totalInventoryValuation : 1;
    return Object.entries(s.warehouseValuations).map(([warehouse, amount]) => ({
      warehouse,
      amount,
      percentage: Math.min(100, Math.round((amount / total) * 100))
    }));
  }
}
