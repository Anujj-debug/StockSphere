import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransferService } from '../../core/services/transfer.service';
import { WarehouseService } from '../../core/services/warehouse.service';
import { ProductService } from '../../core/services/product.service';
import { ToastService } from '../../core/services/toast.service';
import { StockTransferRequest, StockTransferResponse, StockTransferStatus } from '../../core/models/transfer.model';
import { Warehouse } from '../../core/models/warehouse.model';
import { Product } from '../../core/models/product.model';
import { IconComponent } from '../../shared/components/icons.component';
import { ModalComponent } from '../../shared/components/modal.component';

@Component({
  selector: 'app-transfers',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, ModalComponent],
  template: `
    <div class="space-y-6 animate-fade-in">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            Inter-Warehouse Stock Transfers
          </h2>
          <p class="text-xs text-slate-500 mt-0.5">
            Rebalance inventory between Central DC, Regional Hubs, and Retail Backrooms with multi-step authorization.
          </p>
        </div>

        <button
          type="button"
          (click)="openRequestModal()"
          class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium shadow-sm transition-colors"
        >
          <app-icon name="plus" class="w-3.5 h-3.5"></app-icon>
          <span>Initiate Transfer Order</span>
        </button>
      </div>

      <!-- Filter Status Pills -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <button
          type="button"
          (click)="filterStatus.set(null); loadTransfers()"
          class="px-3 py-1.5 rounded-lg border transition-all text-xs font-medium"
          [ngClass]="filterStatus() === null ? 'bg-slate-900 border-slate-900 text-white shadow-xs' : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'"
        >
          All Transfers ({{ transfers().length }})
        </button>

        <button
          type="button"
          (click)="filterStatus.set('REQUESTED'); loadTransfers()"
          class="px-3 py-1.5 rounded-lg border transition-all text-xs font-medium"
          [ngClass]="filterStatus() === 'REQUESTED' ? 'bg-amber-600 border-amber-600 text-white shadow-xs' : 'bg-white border-slate-200 text-slate-600 hover:text-amber-700 hover:bg-slate-50'"
        >
          Requested
        </button>

        <button
          type="button"
          (click)="filterStatus.set('APPROVED'); loadTransfers()"
          class="px-3 py-1.5 rounded-lg border transition-all text-xs font-medium"
          [ngClass]="filterStatus() === 'APPROVED' ? 'bg-blue-600 border-blue-600 text-white shadow-xs' : 'bg-white border-slate-200 text-slate-600 hover:text-blue-700 hover:bg-slate-50'"
        >
          Approved
        </button>

        <button
          type="button"
          (click)="filterStatus.set('IN_TRANSIT'); loadTransfers()"
          class="px-3 py-1.5 rounded-lg border transition-all text-xs font-medium"
          [ngClass]="filterStatus() === 'IN_TRANSIT' ? 'bg-purple-600 border-purple-600 text-white shadow-xs' : 'bg-white border-slate-200 text-slate-600 hover:text-purple-700 hover:bg-slate-50'"
        >
          In-Transit
        </button>

        <button
          type="button"
          (click)="filterStatus.set('COMPLETED'); loadTransfers()"
          class="px-3 py-1.5 rounded-lg border transition-all text-xs font-medium"
          [ngClass]="filterStatus() === 'COMPLETED' ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs' : 'bg-white border-slate-200 text-slate-600 hover:text-emerald-700 hover:bg-slate-50'"
        >
          Completed
        </button>

        <button
          type="button"
          (click)="filterStatus.set('CANCELLED'); loadTransfers()"
          class="px-3 py-1.5 rounded-lg border transition-all text-xs font-medium"
          [ngClass]="filterStatus() === 'CANCELLED' ? 'bg-rose-600 border-rose-600 text-white shadow-xs' : 'bg-white border-slate-200 text-slate-600 hover:text-rose-700 hover:bg-slate-50'"
        >
          Cancelled
        </button>
      </div>

      <!-- Transfers List -->
      <div class="space-y-4">
        @for (transfer of transfers(); track transfer.id) {
          <div class="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 shadow-sm transition-all space-y-4">
            <!-- Header Row -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div class="flex items-center gap-2.5">
                <span class="font-mono text-xs font-semibold text-slate-900">{{ transfer.transferNumber }}</span>
                <span
                  class="px-2 py-0.5 rounded text-[10px] font-medium border uppercase"
                  [ngClass]="{
                    'bg-amber-50 text-amber-700 border-amber-200': transfer.status === 'REQUESTED',
                    'bg-blue-50 text-blue-700 border-blue-200': transfer.status === 'APPROVED',
                    'bg-purple-50 text-purple-700 border-purple-200': transfer.status === 'IN_TRANSIT',
                    'bg-emerald-50 text-emerald-700 border-emerald-200': transfer.status === 'COMPLETED',
                    'bg-rose-50 text-rose-700 border-rose-200': transfer.status === 'CANCELLED'
                  }"
                >
                  {{ transfer.status }}
                </span>
              </div>

              <!-- Workflow Actions -->
              <div class="flex items-center gap-1.5">
                @if (transfer.status === 'REQUESTED') {
                  <button
                    type="button"
                    (click)="approve(transfer.id)"
                    class="px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors shadow-xs"
                  >
                    Approve Order
                  </button>
                  <button
                    type="button"
                    (click)="cancel(transfer.id)"
                    class="px-2.5 py-1 rounded-md border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 text-xs font-medium transition-colors shadow-xs"
                  >
                    Reject
                  </button>
                }

                @if (transfer.status === 'APPROVED') {
                  <button
                    type="button"
                    (click)="dispatch(transfer.id)"
                    class="px-2.5 py-1 rounded-md bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium transition-colors flex items-center gap-1 shadow-xs"
                  >
                    <app-icon name="truck" class="w-3.5 h-3.5"></app-icon>
                    <span>Dispatch Items</span>
                  </button>
                }

                @if (transfer.status === 'IN_TRANSIT') {
                  <button
                    type="button"
                    (click)="receive(transfer.id)"
                    class="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors flex items-center gap-1 shadow-xs"
                  >
                    <app-icon name="check" class="w-3.5 h-3.5"></app-icon>
                    <span>Receive at Dock</span>
                  </button>
                }
              </div>
            </div>

            <!-- Route Details -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div class="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span class="text-slate-500 block mb-0.5">Source Facility (Out)</span>
                <span class="font-semibold text-slate-900">{{ transfer.sourceWarehouseName }}</span>
              </div>

              <div class="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span class="text-slate-500 block mb-0.5">Destination Facility (In)</span>
                <span class="font-semibold text-slate-900">{{ transfer.destinationWarehouseName }}</span>
              </div>

              <div class="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span class="text-slate-500 block mb-0.5">Transfer Audit Log</span>
                <div class="text-slate-700">Requested by: <strong class="text-slate-900">{{ transfer.requestedBy || 'marcus.inv' }}</strong></div>
                @if (transfer.approvedBy) {
                  <div class="text-slate-700">Approved by: <strong class="text-slate-900">{{ transfer.approvedBy }}</strong></div>
                }
              </div>
            </div>

            <!-- Items table -->
            <div class="rounded-lg bg-white border border-slate-200 overflow-hidden">
              <table class="w-full text-left text-xs">
                <thead class="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th class="py-2 px-3">SKU</th>
                    <th class="py-2 px-3">Product Name</th>
                    <th class="py-2 px-3 text-center">Requested Qty</th>
                    <th class="py-2 px-3 text-center">Transferred Qty</th>
                    <th class="py-2 px-3 text-center">Received Qty</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-slate-700">
                  @for (item of transfer.items; track item.id) {
                    <tr class="hover:bg-slate-50/75">
                      <td class="py-2 px-3 font-mono font-semibold text-slate-900">{{ item.productSku }}</td>
                      <td class="py-2 px-3 font-medium text-slate-900">{{ item.productName }}</td>
                      <td class="py-2 px-3 text-center font-mono font-semibold text-slate-900">{{ item.quantityRequested }}</td>
                      <td class="py-2 px-3 text-center font-mono text-purple-700 font-semibold">{{ item.quantityTransferred || '-' }}</td>
                      <td class="py-2 px-3 text-center font-mono text-emerald-700 font-semibold">{{ item.quantityReceived || '-' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            @if (transfer.notes) {
              <div class="text-xs text-slate-500 italic">
                Note: {{ transfer.notes }}
              </div>
            }
          </div>
        }

        @if (transfers().length === 0) {
          <div class="p-10 text-center rounded-xl bg-white border border-slate-200 text-slate-500 text-xs">
            No transfer orders found in this view.
          </div>
        }
      </div>

      <!-- MODAL: REQUEST TRANSFER -->
      <app-modal
        [isOpen]="isRequestModalOpen()"
        title="Create Inter-Warehouse Transfer"
        icon="arrow-left-right"
        (close)="isRequestModalOpen.set(false)"
      >
        <form (ngSubmit)="submitTransferRequest()" class="space-y-4 text-xs">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-700 font-medium mb-1">Source Warehouse (Origin) *</label>
              <select
                [(ngModel)]="requestForm.sourceWarehouseId"
                name="sourceWh"
                required
                class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
              >
                @for (wh of warehouses(); track wh.id) {
                  <option [value]="wh.id">{{ wh.name }}</option>
                }
              </select>
            </div>
            <div>
              <label class="block text-slate-700 font-medium mb-1">Destination Warehouse *</label>
              <select
                [(ngModel)]="requestForm.destinationWarehouseId"
                name="destWh"
                required
                class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
              >
                @for (wh of warehouses(); track wh.id) {
                  <option [value]="wh.id">{{ wh.name }}</option>
                }
              </select>
            </div>
          </div>

          <!-- Line Items -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="text-slate-700 font-medium">Items to Transfer *</label>
              <button
                type="button"
                (click)="addItemLine()"
                class="text-slate-900 hover:underline font-semibold"
              >
                + Add SKU
              </button>
            </div>

            @for (item of requestForm.items; track $index) {
              <div class="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200">
                <select
                  [(ngModel)]="item.productId"
                  name="prod_{{$index}}"
                  required
                  class="flex-1 bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-slate-900"
                >
                  @for (prod of products(); track prod.id) {
                    <option [value]="prod.id">{{ prod.name }} ({{ prod.sku }})</option>
                  }
                </select>

                <div class="w-28 flex items-center gap-1.5">
                  <span class="text-slate-500 text-[11px]">Qty:</span>
                  <input
                    type="number"
                    min="1"
                    [(ngModel)]="item.quantity"
                    name="qty_{{$index}}"
                    required
                    class="w-full bg-white border border-slate-300 rounded-md px-2 py-1.5 text-slate-900 font-mono focus:outline-none focus:border-slate-900"
                  />
                </div>

                @if (requestForm.items.length > 1) {
                  <button
                    type="button"
                    (click)="removeItemLine($index)"
                    class="p-1 rounded text-rose-600 hover:bg-rose-50"
                  >
                    <app-icon name="trash" class="w-3.5 h-3.5"></app-icon>
                  </button>
                }
              </div>
            }
          </div>

          <div>
            <label class="block text-slate-700 font-medium mb-1">Transfer Reason / Notes</label>
            <textarea
              [(ngModel)]="requestForm.notes"
              name="transferNotes"
              rows="2"
              placeholder="e.g. Stock balancing for Manhattan flagship store holiday campaign..."
              class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
            ></textarea>
          </div>

          <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              (click)="isRequestModalOpen.set(false)"
              class="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors shadow-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors shadow-sm"
            >
              Submit Transfer Request
            </button>
          </div>
        </form>
      </app-modal>
    </div>
  `
})
export class TransfersComponent implements OnInit {
  private readonly transferService = inject(TransferService);
  private readonly warehouseService = inject(WarehouseService);
  private readonly productService = inject(ProductService);
  private readonly toast = inject(ToastService);

  readonly transfers = signal<StockTransferResponse[]>([]);
  readonly warehouses = signal<Warehouse[]>([]);
  readonly products = signal<Product[]>([]);
  readonly filterStatus = signal<StockTransferStatus | null>(null);

  readonly isRequestModalOpen = signal(false);

  requestForm: StockTransferRequest = {
    sourceWarehouseId: 1,
    destinationWarehouseId: 2,
    requestedBy: 'marcus.inv',
    notes: '',
    items: [{ productId: 1, quantity: 10 }]
  };

  ngOnInit(): void {
    this.loadTransfers();
    this.loadMetadata();
  }

  loadTransfers(): void {
    const status = this.filterStatus() || undefined;
    this.transferService.getAllTransfers(status).subscribe({
      next: (data) => this.transfers.set(data),
      error: () => this.toast.error('Error', 'Failed to load transfer orders.')
    });
  }

  loadMetadata(): void {
    this.warehouseService.getWarehouses().subscribe({
      next: (whs) => {
        this.warehouses.set(whs);
        if (whs.length >= 2) {
          this.requestForm.sourceWarehouseId = whs[0].id!;
          this.requestForm.destinationWarehouseId = whs[1].id!;
        }
      },
      error: () => {}
    });

    this.productService.getProducts().subscribe({
      next: (prods) => {
        this.products.set(prods);
        if (prods.length > 0) {
          this.requestForm.items[0].productId = prods[0].id!;
        }
      },
      error: () => {}
    });
  }

  openRequestModal(): void {
    this.requestForm = {
      sourceWarehouseId: this.warehouses()[0]?.id || 1,
      destinationWarehouseId: this.warehouses()[1]?.id || 2,
      requestedBy: 'marcus.inv',
      notes: '',
      items: [{ productId: this.products()[0]?.id || 1, quantity: 15 }]
    };
    this.isRequestModalOpen.set(true);
  }

  addItemLine(): void {
    const nextProd = this.products()[0]?.id || 1;
    this.requestForm.items.push({ productId: nextProd, quantity: 10 });
  }

  removeItemLine(index: number): void {
    this.requestForm.items.splice(index, 1);
  }

  submitTransferRequest(): void {
    if (this.requestForm.sourceWarehouseId === this.requestForm.destinationWarehouseId) {
      this.toast.error('Validation Error', 'Source and destination facilities must be different.');
      return;
    }

    this.transferService.requestTransfer(this.requestForm).subscribe({
      next: (created) => {
        this.toast.success('Transfer Requested', `Order ${created.transferNumber} created and stock reserved!`);
        this.isRequestModalOpen.set(false);
        this.loadTransfers();
      },
      error: (err) => this.toast.error('Request Failed', err?.error?.message || 'Check warehouse available stock.')
    });
  }

  approve(id: number): void {
    this.transferService.approveTransfer(id, 'marcus.inv').subscribe({
      next: () => {
        this.toast.success('Approved', 'Transfer approved by Inventory Manager.');
        this.loadTransfers();
      },
      error: (err) => this.toast.error('Error', err?.error?.message || 'Failed to approve transfer.')
    });
  }

  dispatch(id: number): void {
    this.transferService.dispatchTransfer(id).subscribe({
      next: () => {
        this.toast.success('Dispatched', 'Items set to IN_TRANSIT, TRANSFER_OUT ledger recorded.');
        this.loadTransfers();
      },
      error: (err) => this.toast.error('Error', err?.error?.message || 'Failed to dispatch items.')
    });
  }

  receive(id: number): void {
    this.transferService.receiveTransfer(id).subscribe({
      next: () => {
        this.toast.success('Received', 'Items restocked at destination warehouse, transfer COMPLETED.');
        this.loadTransfers();
      },
      error: (err) => this.toast.error('Error', err?.error?.message || 'Failed to receive items.')
    });
  }

  cancel(id: number): void {
    if (confirm('Are you sure you want to cancel this transfer order and release reserved stock?')) {
      this.transferService.cancelTransfer(id).subscribe({
        next: () => {
          this.toast.info('Cancelled', 'Transfer cancelled and stock reservation released.');
          this.loadTransfers();
        },
        error: (err) => this.toast.error('Error', err?.error?.message || 'Failed to cancel transfer.')
      });
    }
  }
}
