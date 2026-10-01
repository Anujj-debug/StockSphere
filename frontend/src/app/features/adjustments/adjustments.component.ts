import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdjustmentService } from '../../core/services/adjustment.service';
import { WarehouseService } from '../../core/services/warehouse.service';
import { ProductService } from '../../core/services/product.service';
import { ToastService } from '../../core/services/toast.service';
import { StockAdjustmentRequest, StockAdjustmentResponse, AdjustmentReason } from '../../core/models/adjustment.model';
import { Warehouse } from '../../core/models/warehouse.model';
import { Product } from '../../core/models/product.model';
import { IconComponent } from '../../shared/components/icons.component';
import { ModalComponent } from '../../shared/components/modal.component';

@Component({
  selector: 'app-adjustments',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, ModalComponent],
  template: `
    <div class="space-y-6 animate-fade-in">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            Physical Cycle Counts & Audit Write-Offs
          </h2>
          <p class="text-xs text-slate-500 mt-0.5">
            Reconcile physical floor counts, shrinkage, damage, and spoilage with automatic valuation impact ledger calculation.
          </p>
        </div>

        <button
          type="button"
          (click)="openAdjustmentModal()"
          class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium shadow-sm transition-colors"
        >
          <app-icon name="adjustments" class="w-3.5 h-3.5"></app-icon>
          <span>Log Physical Adjustment</span>
        </button>
      </div>

      <!-- Historical Adjustments Table -->
      <div class="rounded-xl bg-white border border-slate-200 overflow-hidden shadow-sm">
        <div class="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 class="text-xs font-semibold text-slate-900">Reconciliation Ledger</h3>
            <p class="text-[11px] text-slate-500">All adjustments record quantity delta and financial valuation variance.</p>
          </div>
          <span class="text-xs text-slate-500 font-mono">Count: {{ adjustments().length }} records</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th class="py-2.5 px-4">Adjustment #</th>
                <th class="py-2.5 px-4">Reason</th>
                <th class="py-2.5 px-4">Facility</th>
                <th class="py-2.5 px-4">Product SKU</th>
                <th class="py-2.5 px-4 text-center">Delta Qty</th>
                <th class="py-2.5 px-4 text-right">Count Trace</th>
                <th class="py-2.5 px-4 text-right">Valuation Impact</th>
                <th class="py-2.5 px-4">Auditor</th>
                <th class="py-2.5 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-700">
              @for (adj of adjustments(); track adj.id) {
                <tr class="hover:bg-slate-50/75 transition-colors">
                  <td class="py-2.5 px-4 font-mono font-semibold text-slate-900">{{ adj.adjustmentNumber }}</td>
                  <td class="py-2.5 px-4">
                    <span
                      class="px-2 py-0.5 rounded text-[10px] font-medium border uppercase"
                      [ngClass]="{
                        'bg-blue-50 text-blue-700 border-blue-200': adj.reason === 'CYCLE_COUNT',
                        'bg-rose-50 text-rose-700 border-rose-200': adj.reason === 'DAMAGE' || adj.reason === 'SPOILAGE',
                        'bg-amber-50 text-amber-700 border-amber-200': adj.reason === 'SHRINKAGE',
                        'bg-purple-50 text-purple-700 border-purple-200': adj.reason === 'INTERNAL_USE' || adj.reason === 'RETURN_TO_VENDOR'
                      }"
                    >
                      {{ adj.reason }}
                    </span>
                  </td>
                  <td class="py-2.5 px-4 text-slate-700">{{ adj.warehouseName }}</td>
                  <td class="py-2.5 px-4">
                    <span class="font-medium text-slate-900">{{ adj.productName }}</span>
                    <div class="text-[10px] text-slate-400 font-mono">{{ adj.productSku }}</div>
                  </td>
                  <td class="py-2.5 px-4 text-center font-bold font-mono" [ngClass]="adj.quantityDelta >= 0 ? 'text-emerald-700' : 'text-rose-700'">
                    {{ adj.quantityDelta >= 0 ? '+' + adj.quantityDelta : adj.quantityDelta }}
                  </td>
                  <td class="py-2.5 px-4 text-right font-mono text-slate-600">
                    {{ adj.previousQuantity }} &rarr; <span class="font-bold text-slate-900">{{ adj.newQuantity }}</span>
                  </td>
                  <td class="py-2.5 px-4 text-right font-mono font-bold" [ngClass]="adj.totalValuationImpact >= 0 ? 'text-emerald-700' : 'text-rose-700'">
                    {{ adj.totalValuationImpact >= 0 ? '+\$' : '-\$' }}{{ (adj.totalValuationImpact < 0 ? -adj.totalValuationImpact : adj.totalValuationImpact) | number:'1.2-2' }}
                  </td>
                  <td class="py-2.5 px-4 text-slate-600">{{ adj.adjustedBy || 'elena.wh' }}</td>
                  <td class="py-2.5 px-4 text-right font-mono text-slate-400 text-[11px]">{{ adj.createdAt | date:'short' }}</td>
                </tr>
              }
              @if (adjustments().length === 0) {
                <tr>
                  <td colspan="9" class="text-center py-10 text-slate-500">
                    No physical adjustments recorded yet.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- MODAL: LOG ADJUSTMENT -->
      <app-modal
        [isOpen]="isAdjustmentModalOpen()"
        title="Record Cycle Count / Physical Adjustment"
        icon="adjustments"
        (close)="isAdjustmentModalOpen.set(false)"
      >
        <form (ngSubmit)="saveAdjustment()" class="space-y-4 text-xs">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-700 font-medium mb-1">Facility Warehouse *</label>
              <select
                [(ngModel)]="adjustmentForm.warehouseId"
                name="adjWh"
                required
                class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
              >
                @for (wh of warehouses(); track wh.id) {
                  <option [value]="wh.id">{{ wh.name }}</option>
                }
              </select>
            </div>
            <div>
              <label class="block text-slate-700 font-medium mb-1">Product SKU *</label>
              <select
                [(ngModel)]="adjustmentForm.productId"
                name="adjProd"
                required
                class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
              >
                @for (p of products(); track p.id) {
                  <option [value]="p.id">{{ p.name }} ({{ p.sku }}) - \${{ p.costPrice }}/ea</option>
                }
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-700 font-medium mb-1">Adjustment Reason Code *</label>
              <select
                [(ngModel)]="adjustmentForm.reason"
                name="adjReason"
                required
                class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
              >
                <option value="CYCLE_COUNT">CYCLE_COUNT (Physical Audit Reconciliation)</option>
                <option value="DAMAGE">DAMAGE (Broken in Warehouse Handling)</option>
                <option value="SPOILAGE">SPOILAGE (Expired / Perished Goods)</option>
                <option value="SHRINKAGE">SHRINKAGE (Missing / Discrepancy)</option>
                <option value="INTERNAL_USE">INTERNAL_USE (Store Display / Testing)</option>
                <option value="RETURN_TO_VENDOR">RETURN_TO_VENDOR (Defective Return)</option>
              </select>
            </div>
            <div>
              <label class="block text-slate-700 font-medium mb-1">
                Quantity Delta * <span class="text-slate-500 font-normal">(+ to add, - to deduct)</span>
              </label>
              <input
                type="number"
                [(ngModel)]="adjustmentForm.quantityDelta"
                name="adjDelta"
                required
                placeholder="-2 or +5"
                class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label class="block text-slate-700 font-medium mb-1">Audit Notes / Root Cause</label>
            <textarea
              [(ngModel)]="adjustmentForm.notes"
              name="adjNotes"
              rows="2"
              placeholder="e.g. Found damaged water seal during quarterly zone audit..."
              class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
            ></textarea>
          </div>

          <div>
            <label class="block text-slate-700 font-medium mb-1">Audited / Adjusted By</label>
            <input
              type="text"
              [(ngModel)]="adjustmentForm.adjustedBy"
              name="adjBy"
              placeholder="elena.wh"
              class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
            />
          </div>

          <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              (click)="isAdjustmentModalOpen.set(false)"
              class="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors shadow-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors shadow-sm"
            >
              Post Adjustment
            </button>
          </div>
        </form>
      </app-modal>
    </div>
  `
})
export class AdjustmentsComponent implements OnInit {
  private readonly adjustmentService = inject(AdjustmentService);
  private readonly warehouseService = inject(WarehouseService);
  private readonly productService = inject(ProductService);
  private readonly toast = inject(ToastService);

  readonly adjustments = signal<StockAdjustmentResponse[]>([]);
  readonly warehouses = signal<Warehouse[]>([]);
  readonly products = signal<Product[]>([]);

  readonly isAdjustmentModalOpen = signal(false);

  adjustmentForm: StockAdjustmentRequest = {
    warehouseId: 1,
    productId: 1,
    reason: 'CYCLE_COUNT',
    quantityDelta: -1,
    notes: '',
    adjustedBy: 'elena.wh'
  };

  ngOnInit(): void {
    this.loadAdjustments();
    this.loadMetadata();
  }

  loadAdjustments(): void {
    this.adjustmentService.getAllAdjustments().subscribe({
      next: (data) => this.adjustments.set(data),
      error: () => this.toast.error('Error', 'Failed to load adjustments list.')
    });
  }

  loadMetadata(): void {
    this.warehouseService.getWarehouses().subscribe({
      next: (whs) => {
        this.warehouses.set(whs);
        if (whs.length > 0) this.adjustmentForm.warehouseId = whs[0].id!;
      },
      error: () => {}
    });

    this.productService.getProducts().subscribe({
      next: (prods) => {
        this.products.set(prods);
        if (prods.length > 0) this.adjustmentForm.productId = prods[0].id!;
      },
      error: () => {}
    });
  }

  openAdjustmentModal(): void {
    this.adjustmentForm = {
      warehouseId: this.warehouses()[0]?.id || 1,
      productId: this.products()[0]?.id || 1,
      reason: 'CYCLE_COUNT',
      quantityDelta: -1,
      notes: '',
      adjustedBy: 'elena.wh'
    };
    this.isAdjustmentModalOpen.set(true);
  }

  saveAdjustment(): void {
    this.adjustmentService.createAdjustment(this.adjustmentForm).subscribe({
      next: (res) => {
        this.toast.success(
          'Adjustment Recorded',
          `Logged ${res.adjustmentNumber} (${res.quantityDelta >= 0 ? '+' : ''}${res.quantityDelta} units). Valuation impact: \$${res.totalValuationImpact}`
        );
        this.isAdjustmentModalOpen.set(false);
        this.loadAdjustments();
      },
      error: (err) => this.toast.error('Failed', err?.error?.message || 'Check stock quantity availability.')
    });
  }
}
