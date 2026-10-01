import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryService } from '../../core/services/inventory.service';
import { WarehouseService } from '../../core/services/warehouse.service';
import { ToastService } from '../../core/services/toast.service';
import { Stock, InventoryTransaction, StockThresholdUpdate } from '../../core/models/inventory.model';
import { Warehouse } from '../../core/models/warehouse.model';
import { IconComponent } from '../../shared/components/icons.component';
import { ModalComponent } from '../../shared/components/modal.component';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, ModalComponent],
  template: `
    <div class="space-y-6 animate-fade-in">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            Real-Time Stock & Audit Ledger
          </h2>
          <p class="text-xs text-slate-500 mt-0.5">
            Calculated on-hand, reserved, and available stock levels across warehouses with immutable ledger traceability.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            (click)="loadData()"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200 transition-colors shadow-sm"
          >
            <app-icon name="refresh" class="w-3.5 h-3.5"></app-icon>
            <span>Refresh Balances</span>
          </button>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="flex items-center gap-1 border-b border-slate-200">
        <button
          type="button"
          (click)="activeTab.set('matrix')"
          class="flex items-center gap-2 px-3.5 py-2 text-xs font-medium border-b-2 -mb-px transition-colors"
          [ngClass]="activeTab() === 'matrix' ? 'border-slate-900 text-slate-900 font-semibold' : 'border-transparent text-slate-500 hover:text-slate-900'"
        >
          <app-icon name="inventory" class="w-3.5 h-3.5"></app-icon>
          <span>Stock Matrix ({{ stocks().length }})</span>
        </button>

        <button
          type="button"
          (click)="activeTab.set('ledger')"
          class="flex items-center gap-2 px-3.5 py-2 text-xs font-medium border-b-2 -mb-px transition-colors"
          [ngClass]="activeTab() === 'ledger' ? 'border-slate-900 text-slate-900 font-semibold' : 'border-transparent text-slate-500 hover:text-slate-900'"
        >
          <app-icon name="clock" class="w-3.5 h-3.5"></app-icon>
          <span>Immutable Ledger ({{ transactions().length }})</span>
        </button>
      </div>

      <!-- TAB 1: STOCK MATRIX -->
      @if (activeTab() === 'matrix') {
        <div class="space-y-4">
          <!-- Filters Bar -->
          <div class="p-3 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div class="flex flex-wrap items-center gap-3">
              <!-- Warehouse filter -->
              <div class="flex items-center gap-2 text-xs text-slate-700">
                <span class="text-slate-500 font-medium">Warehouse:</span>
                <select
                  [(ngModel)]="selectedWarehouseId"
                  (ngModelChange)="onWarehouseFilterChange()"
                  class="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-slate-400 focus:bg-white"
                >
                  <option [ngValue]="null">All Facilities</option>
                  @for (wh of warehouses(); track wh.id) {
                    <option [ngValue]="wh.id">{{ wh.name }}</option>
                  }
                </select>
              </div>

              <!-- Quick Health Filter Toggle -->
              <div class="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
                <button
                  type="button"
                  (click)="filterMode.set('ALL'); onWarehouseFilterChange()"
                  class="px-2.5 py-1 rounded-md transition-colors text-xs font-medium"
                  [ngClass]="filterMode() === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'"
                >
                  All Items
                </button>
                <button
                  type="button"
                  (click)="filterMode.set('LOW_STOCK'); loadLowStock()"
                  class="px-2.5 py-1 rounded-md transition-colors text-xs font-medium"
                  [ngClass]="filterMode() === 'LOW_STOCK' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-500 hover:text-amber-700'"
                >
                  Low Stock Alert
                </button>
                <button
                  type="button"
                  (click)="filterMode.set('OUT_OF_STOCK'); loadOutOfStock()"
                  class="px-2.5 py-1 rounded-md transition-colors text-xs font-medium"
                  [ngClass]="filterMode() === 'OUT_OF_STOCK' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-500 hover:text-rose-700'"
                >
                  Out of Stock
                </button>
              </div>
            </div>

            <div class="text-xs text-slate-500">
              Formula: <span class="font-mono text-slate-700">Available = OnHand - Reserved</span>
            </div>
          </div>

          <!-- Stock Table -->
          <div class="rounded-xl bg-white border border-slate-200 overflow-hidden shadow-sm">
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead class="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th class="py-2.5 px-4">Product SKU</th>
                    <th class="py-2.5 px-4">Product Name</th>
                    <th class="py-2.5 px-4">Facility Hub</th>
                    <th class="py-2.5 px-4 text-center font-mono">On Hand</th>
                    <th class="py-2.5 px-4 text-center font-mono">Reserved</th>
                    <th class="py-2.5 px-4 text-center font-mono">Available</th>
                    <th class="py-2.5 px-4 text-center font-mono">Reorder Pt</th>
                    <th class="py-2.5 px-4 text-center">Status</th>
                    <th class="py-2.5 px-4 text-right">Thresholds</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-slate-700">
                  @for (stk of stocks(); track stk.id) {
                    <tr class="hover:bg-slate-50/75 transition-colors">
                      <td class="py-2.5 px-4 font-mono font-semibold text-slate-900">{{ stk.productSku }}</td>
                      <td class="py-2.5 px-4">
                        <div class="font-medium text-slate-900">{{ stk.productName }}</div>
                        <div class="text-[10px] text-slate-400 font-mono">Valuation: \${{ (stk.quantityOnHand * stk.costPrice) | number:'1.2-2' }}</div>
                      </td>
                      <td class="py-2.5 px-4">
                        <span class="text-slate-800 font-medium">{{ stk.warehouseName }}</span>
                        <div class="text-[10px] text-slate-400 font-mono">{{ stk.warehouseCode }}</div>
                      </td>
                      <td class="py-2.5 px-4 text-center font-mono font-bold text-slate-900">{{ stk.quantityOnHand }}</td>
                      <td class="py-2.5 px-4 text-center font-mono text-amber-700 font-semibold">{{ stk.quantityReserved }}</td>
                      <td class="py-2.5 px-4 text-center font-mono font-bold" [ngClass]="stk.availableQuantity > 0 ? 'text-emerald-700' : 'text-rose-700'">
                        {{ stk.availableQuantity }}
                      </td>
                      <td class="py-2.5 px-4 text-center font-mono text-slate-500">
                        {{ stk.reorderPoint || '-' }}
                        <span class="text-[10px] text-slate-400">(Min: {{ stk.minStockLevel || '-' }})</span>
                      </td>
                      <td class="py-2.5 px-4 text-center">
                        @if (stk.outOfStock) {
                          <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            OUT OF STOCK
                          </span>
                        } @else if (stk.lowStock) {
                          <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            LOW STOCK
                          </span>
                        } @else {
                          <span class="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            OPTIMAL
                          </span>
                        }
                      </td>
                      <td class="py-2.5 px-4 text-right">
                        <button
                          type="button"
                          (click)="openThresholdModal(stk)"
                          class="px-2.5 py-1 text-xs rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-colors shadow-xs"
                        >
                          Configure
                        </button>
                      </td>
                    </tr>
                  }
                  @if (stocks().length === 0) {
                    <tr>
                      <td colspan="9" class="text-center py-10 text-slate-500">
                        No stock records matching criteria.
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      }

      <!-- TAB 2: AUDIT LEDGER -->
      @if (activeTab() === 'ledger') {
        <div class="rounded-xl bg-white border border-slate-200 overflow-hidden shadow-sm">
          <div class="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 class="text-xs font-semibold text-slate-900">Immutable Ledger Audit Trail</h3>
              <p class="text-[11px] text-slate-500">All transaction movements log previous balance, delta, new balance, and operator.</p>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th class="py-2.5 px-4">Transaction ID</th>
                  <th class="py-2.5 px-4">Operation Type</th>
                  <th class="py-2.5 px-4">SKU & Item</th>
                  <th class="py-2.5 px-4">Facility</th>
                  <th class="py-2.5 px-4 text-center">Change</th>
                  <th class="py-2.5 px-4 text-right font-mono">Balance Progression</th>
                  <th class="py-2.5 px-4">Reference #</th>
                  <th class="py-2.5 px-4">Operator</th>
                  <th class="py-2.5 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-slate-700">
                @for (txn of transactions(); track txn.id) {
                  <tr class="hover:bg-slate-50/75 transition-colors">
                    <td class="py-2.5 px-4 font-mono font-semibold text-slate-900">{{ txn.transactionNumber }}</td>
                    <td class="py-2.5 px-4">
                      <span
                        class="px-2 py-0.5 rounded text-[10px] font-medium border"
                        [ngClass]="{
                          'bg-emerald-50 text-emerald-700 border-emerald-200': txn.type === 'INITIAL_STOCK' || txn.type === 'PURCHASE_RECEIPT' || txn.type === 'TRANSFER_IN' || txn.type === 'ADJUSTMENT_POSITIVE',
                          'bg-amber-50 text-amber-700 border-amber-200': txn.type === 'TRANSFER_OUT',
                          'bg-rose-50 text-rose-700 border-rose-200': txn.type === 'SALES_FULFILLMENT' || txn.type === 'ADJUSTMENT_NEGATIVE'
                        }"
                      >
                        {{ txn.type }}
                      </span>
                    </td>
                    <td class="py-2.5 px-4">
                      <span class="font-medium text-slate-900">{{ txn.product?.name }}</span>
                      <div class="text-[10px] text-slate-400 font-mono">{{ txn.product?.sku }}</div>
                    </td>
                    <td class="py-2.5 px-4 text-slate-700">{{ txn.warehouse?.name }}</td>
                    <td class="py-2.5 px-4 text-center font-bold" [ngClass]="txn.quantityChange >= 0 ? 'text-emerald-700' : 'text-rose-700'">
                      {{ txn.quantityChange >= 0 ? '+' + txn.quantityChange : txn.quantityChange }}
                    </td>
                    <td class="py-2.5 px-4 text-right font-mono text-slate-600">
                      {{ txn.quantityBefore }} &rarr; <span class="font-bold text-slate-900">{{ txn.quantityAfter }}</span>
                    </td>
                    <td class="py-2.5 px-4 font-mono text-slate-500 text-[11px]">{{ txn.referenceNumber || '-' }}</td>
                    <td class="py-2.5 px-4 text-slate-600">{{ txn.performedBy || 'System' }}</td>
                    <td class="py-2.5 px-4 text-right font-mono text-slate-400 text-[11px]">
                      {{ txn.createdAt | date:'short' }}
                    </td>
                  </tr>
                }
                @if (transactions().length === 0) {
                  <tr>
                    <td colspan="9" class="text-center py-10 text-slate-500">
                      No audit transactions recorded yet.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- MODAL: UPDATE SAFETY THRESHOLDS -->
      <app-modal
        [isOpen]="isThresholdModalOpen()"
        title="Configure Safety Stock Thresholds"
        icon="inventory"
        (close)="isThresholdModalOpen.set(false)"
      >
        @if (selectedStockForThreshold()) {
          <form (ngSubmit)="saveThresholds()" class="space-y-4 text-xs">
            <div class="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 space-y-1">
              <div>Product: <strong class="text-slate-900">{{ selectedStockForThreshold()!.productName }}</strong> ({{ selectedStockForThreshold()!.productSku }})</div>
              <div>Facility: <strong class="text-slate-900">{{ selectedStockForThreshold()!.warehouseName }}</strong></div>
              <div>Current On Hand: <strong class="text-slate-900 font-mono">{{ selectedStockForThreshold()!.quantityOnHand }}</strong> units</div>
            </div>

            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="block text-slate-700 font-medium mb-1">Min Safety Level</label>
                <input
                  type="number"
                  [(ngModel)]="thresholdForm.minLevel"
                  name="minLevel"
                  class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-slate-900 focus:bg-white"
                />
              </div>
              <div>
                <label class="block text-slate-700 font-medium mb-1">Reorder Point *</label>
                <input
                  type="number"
                  [(ngModel)]="thresholdForm.reorderPoint"
                  name="reorderPoint"
                  required
                  class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-slate-900 focus:bg-white"
                />
              </div>
              <div>
                <label class="block text-slate-700 font-medium mb-1">Max Level</label>
                <input
                  type="number"
                  [(ngModel)]="thresholdForm.maxLevel"
                  name="maxLevel"
                  class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-slate-900 focus:bg-white"
                />
              </div>
            </div>

            <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                (click)="isThresholdModalOpen.set(false)"
                class="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors shadow-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors shadow-sm"
              >
                Save Thresholds
              </button>
            </div>
          </form>
        }
      </app-modal>
    </div>
  `
})
export class InventoryComponent implements OnInit {
  private readonly inventoryService = inject(InventoryService);
  private readonly warehouseService = inject(WarehouseService);
  private readonly toast = inject(ToastService);

  readonly activeTab = signal<'matrix' | 'ledger'>('matrix');
  readonly filterMode = signal<'ALL' | 'LOW_STOCK' | 'OUT_OF_STOCK'>('ALL');

  readonly stocks = signal<Stock[]>([]);
  readonly warehouses = signal<Warehouse[]>([]);
  readonly transactions = signal<InventoryTransaction[]>([]);

  selectedWarehouseId: number | null = null;

  // Threshold modal
  readonly isThresholdModalOpen = signal(false);
  readonly selectedStockForThreshold = signal<Stock | null>(null);

  thresholdForm: StockThresholdUpdate = {
    warehouseId: 0,
    productId: 0,
    minLevel: 10,
    reorderPoint: 25,
    maxLevel: 500
  };

  ngOnInit(): void {
    this.loadWarehouses();
    this.loadData();
  }

  loadWarehouses(): void {
    this.warehouseService.getWarehouses().subscribe({
      next: (whs) => this.warehouses.set(whs),
      error: () => {}
    });
  }

  loadData(): void {
    if (this.selectedWarehouseId) {
      this.inventoryService.getStocksByWarehouse(this.selectedWarehouseId).subscribe({
        next: (stks) => this.stocks.set(stks),
        error: () => this.toast.error('Error', 'Failed to load warehouse stocks.')
      });
      this.inventoryService.getTransactionsByWarehouse(this.selectedWarehouseId).subscribe({
        next: (txns) => this.transactions.set(txns),
        error: () => {}
      });
    } else {
      this.inventoryService.getAllStocks().subscribe({
        next: (stks) => this.stocks.set(stks),
        error: () => this.toast.error('Error', 'Failed to load stock matrix.')
      });
      this.inventoryService.getRecentTransactions().subscribe({
        next: (txns) => this.transactions.set(txns),
        error: () => {}
      });
    }
  }

  onWarehouseFilterChange(): void {
    this.loadData();
  }

  loadLowStock(): void {
    this.inventoryService.getLowStockItems(this.selectedWarehouseId || undefined).subscribe({
      next: (lowItems) => {
        this.stocks.set(lowItems);
        this.toast.info('Filter Applied', `Showing ${lowItems.length} low stock items.`);
      },
      error: () => this.toast.error('Error', 'Failed to filter low stock.')
    });
  }

  loadOutOfStock(): void {
    this.inventoryService.getOutOfStockItems().subscribe({
      next: (oosItems) => {
        this.stocks.set(oosItems);
        this.toast.info('Filter Applied', `Showing ${oosItems.length} out of stock items.`);
      },
      error: () => this.toast.error('Error', 'Failed to filter out of stock.')
    });
  }

  openThresholdModal(stk: Stock): void {
    this.selectedStockForThreshold.set(stk);
    this.thresholdForm = {
      warehouseId: stk.warehouseId,
      productId: stk.productId,
      minLevel: stk.minStockLevel || 10,
      reorderPoint: stk.reorderPoint || 20,
      maxLevel: stk.maxStockLevel || 500
    };
    this.isThresholdModalOpen.set(true);
  }

  saveThresholds(): void {
    this.inventoryService.updateStockThresholds(this.thresholdForm).subscribe({
      next: () => {
        this.toast.success('Thresholds Updated', 'Safety stock and reorder point saved.');
        this.isThresholdModalOpen.set(false);
        this.loadData();
      },
      error: () => this.toast.error('Error', 'Failed to update stock thresholds.')
    });
  }
}
