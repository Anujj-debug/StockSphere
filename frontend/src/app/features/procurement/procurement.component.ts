import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProcurementService } from '../../core/services/procurement.service';
import { WarehouseService } from '../../core/services/warehouse.service';
import { ProductService } from '../../core/services/product.service';
import { ToastService } from '../../core/services/toast.service';
import {
  GoodsReceipt,
  PurchaseOrderRequest,
  PurchaseOrderResponse,
  PurchaseOrderStatus
} from '../../core/models/purchase-order.model';
import { Supplier, SupplierProduct } from '../../core/models/supplier.model';
import { Warehouse } from '../../core/models/warehouse.model';
import { Product } from '../../core/models/product.model';
import { IconComponent } from '../../shared/components/icons.component';
import { ModalComponent } from '../../shared/components/modal.component';

@Component({
  selector: 'app-procurement',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, ModalComponent],
  template: `
    <div class="space-y-6 animate-fade-in">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            Procurement & Supplier Management
          </h2>
          <p class="text-xs text-slate-500 mt-0.5">
            Supplier catalog agreements, multi-item purchase orders, and dock Goods Received Note (GRN) restocking workflows.
          </p>
        </div>

        <div class="flex items-center gap-2">
          @if (activeTab() === 'orders') {
            <button
              type="button"
              (click)="openPoModal()"
              class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium shadow-sm transition-colors"
            >
              <app-icon name="plus" class="w-3.5 h-3.5"></app-icon>
              <span>Issue Purchase Order (PO)</span>
            </button>
          } @else {
            <button
              type="button"
              (click)="openSupplierModal()"
              class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium shadow-sm transition-colors"
            >
              <app-icon name="plus" class="w-3.5 h-3.5"></app-icon>
              <span>Register Supplier</span>
            </button>
          }
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="flex items-center gap-1 border-b border-slate-200">
        <button
          type="button"
          (click)="activeTab.set('orders')"
          class="flex items-center gap-2 px-3.5 py-2 text-xs font-medium border-b-2 -mb-px transition-colors"
          [ngClass]="activeTab() === 'orders' ? 'border-slate-900 text-slate-900 font-semibold' : 'border-transparent text-slate-500 hover:text-slate-900'"
        >
          <app-icon name="truck" class="w-3.5 h-3.5"></app-icon>
          <span>Purchase Orders ({{ purchaseOrders().length }})</span>
        </button>

        <button
          type="button"
          (click)="activeTab.set('suppliers')"
          class="flex items-center gap-2 px-3.5 py-2 text-xs font-medium border-b-2 -mb-px transition-colors"
          [ngClass]="activeTab() === 'suppliers' ? 'border-slate-900 text-slate-900 font-semibold' : 'border-transparent text-slate-500 hover:text-slate-900'"
        >
          <app-icon name="building" class="w-3.5 h-3.5"></app-icon>
          <span>Suppliers & Costing Matrix ({{ suppliers().length }})</span>
        </button>
      </div>

      <!-- TAB 1: PURCHASE ORDERS -->
      @if (activeTab() === 'orders') {
        <div class="space-y-4">
          <!-- Filter Pills -->
          <div class="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              type="button"
              (click)="filterPoStatus.set(null); loadPurchaseOrders()"
              class="px-3 py-1.5 rounded-lg border transition-all text-xs font-medium"
              [ngClass]="filterPoStatus() === null ? 'bg-slate-900 border-slate-900 text-white shadow-xs' : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'"
            >
              All POs
            </button>
            <button
              type="button"
              (click)="filterPoStatus.set('DRAFT'); loadPurchaseOrders()"
              class="px-3 py-1.5 rounded-lg border transition-all text-xs font-medium"
              [ngClass]="filterPoStatus() === 'DRAFT' ? 'bg-slate-700 border-slate-700 text-white shadow-xs' : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'"
            >
              Draft
            </button>
            <button
              type="button"
              (click)="filterPoStatus.set('SUBMITTED'); loadPurchaseOrders()"
              class="px-3 py-1.5 rounded-lg border transition-all text-xs font-medium"
              [ngClass]="filterPoStatus() === 'SUBMITTED' ? 'bg-blue-600 border-blue-600 text-white shadow-xs' : 'bg-white border-slate-200 text-slate-600 hover:text-blue-700 hover:bg-slate-50'"
            >
              Submitted
            </button>
            <button
              type="button"
              (click)="filterPoStatus.set('APPROVED'); loadPurchaseOrders()"
              class="px-3 py-1.5 rounded-lg border transition-all text-xs font-medium"
              [ngClass]="filterPoStatus() === 'APPROVED' ? 'bg-purple-600 border-purple-600 text-white shadow-xs' : 'bg-white border-slate-200 text-slate-600 hover:text-purple-700 hover:bg-slate-50'"
            >
              Approved
            </button>
            <button
              type="button"
              (click)="filterPoStatus.set('RECEIVED'); loadPurchaseOrders()"
              class="px-3 py-1.5 rounded-lg border transition-all text-xs font-medium"
              [ngClass]="filterPoStatus() === 'RECEIVED' ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs' : 'bg-white border-slate-200 text-slate-600 hover:text-emerald-700 hover:bg-slate-50'"
            >
              Received (GRN)
            </button>
          </div>

          <!-- PO Cards List -->
          <div class="space-y-4">
            @for (po of purchaseOrders(); track po.id) {
              <div class="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 shadow-sm transition-all space-y-4">
                <!-- Row Header -->
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div class="flex items-center gap-2.5">
                    <span class="font-mono text-xs font-semibold text-slate-900">{{ po.poNumber }}</span>
                    <span
                      class="px-2 py-0.5 rounded text-[10px] font-medium border uppercase"
                      [ngClass]="{
                        'bg-slate-100 text-slate-700 border-slate-200': po.status === 'DRAFT',
                        'bg-blue-50 text-blue-700 border-blue-200': po.status === 'SUBMITTED',
                        'bg-purple-50 text-purple-700 border-purple-200': po.status === 'APPROVED',
                        'bg-emerald-50 text-emerald-700 border-emerald-200': po.status === 'RECEIVED',
                        'bg-rose-50 text-rose-700 border-rose-200': po.status === 'CANCELLED'
                      }"
                    >
                      {{ po.status }}
                    </span>
                    <span class="text-xs text-slate-400 font-mono">Issued: {{ po.createdAt | date:'mediumDate' }}</span>
                  </div>

                  <!-- Workflow Action Buttons -->
                  <div class="flex items-center gap-1.5">
                    @if (po.status === 'DRAFT') {
                      <button
                        type="button"
                        (click)="submitPo(po.id)"
                        class="px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors shadow-xs"
                      >
                        Submit to Vendor
                      </button>
                    }

                    @if (po.status === 'SUBMITTED') {
                      <button
                        type="button"
                        (click)="approvePo(po.id)"
                        class="px-2.5 py-1 rounded-md bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium transition-colors shadow-xs"
                      >
                        Approve PO
                      </button>
                    }

                    @if (po.status === 'APPROVED' || po.status === 'SUBMITTED') {
                      <button
                        type="button"
                        (click)="openGrnModal(po)"
                        class="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors flex items-center gap-1 shadow-xs"
                      >
                        <app-icon name="shield-check" class="w-3.5 h-3.5"></app-icon>
                        <span>Receive Goods (GRN)</span>
                      </button>
                    }

                    @if (po.status !== 'RECEIVED' && po.status !== 'CANCELLED') {
                      <button
                        type="button"
                        (click)="cancelPo(po.id)"
                        class="px-2.5 py-1 rounded-md border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 text-xs font-medium transition-colors shadow-xs"
                      >
                        Cancel
                      </button>
                    }
                  </div>
                </div>

                <!-- Info Grid -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div class="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span class="text-slate-500 block mb-0.5">Vendor Partner</span>
                    <strong class="text-slate-900 text-xs font-semibold">{{ po.supplierName }}</strong>
                    <div class="text-[10px] text-slate-400 font-mono">{{ po.supplierCode }}</div>
                  </div>

                  <div class="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span class="text-slate-500 block mb-0.5">Destination Facility</span>
                    <strong class="text-slate-900 text-xs font-semibold">{{ po.destinationWarehouseName }}</strong>
                  </div>

                  <div class="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span class="text-slate-500 block mb-0.5">Order Financial Value</span>
                    <strong class="text-emerald-700 text-xs font-mono font-semibold">\${{ po.totalAmount | number:'1.2-2' }}</strong>
                  </div>
                </div>

                <!-- Line Items Table -->
                <div class="rounded-lg bg-white border border-slate-200 overflow-hidden">
                  <table class="w-full text-left text-xs">
                    <thead class="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                      <tr>
                        <th class="py-2 px-3">SKU</th>
                        <th class="py-2 px-3">Item Description</th>
                        <th class="py-2 px-3 text-right">Agreed Unit Cost</th>
                        <th class="py-2 px-3 text-center">Ordered</th>
                        <th class="py-2 px-3 text-center">Received (Dock)</th>
                        <th class="py-2 px-3 text-right">Line Total</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 text-slate-700">
                      @for (item of po.items; track item.id) {
                        <tr class="hover:bg-slate-50/75">
                          <td class="py-2 px-3 font-mono font-semibold text-slate-900">{{ item.productSku }}</td>
                          <td class="py-2 px-3 font-medium text-slate-900">{{ item.productName }}</td>
                          <td class="py-2 px-3 text-right font-mono text-slate-600">\${{ item.unitCost | number:'1.2-2' }}</td>
                          <td class="py-2 px-3 text-center font-mono font-semibold text-slate-900">{{ item.quantityOrdered }}</td>
                          <td class="py-2 px-3 text-center font-mono font-semibold text-emerald-700">
                            {{ item.quantityReceived || 0 }} / {{ item.quantityOrdered }}
                          </td>
                          <td class="py-2 px-3 text-right font-mono font-semibold text-slate-900">\${{ item.lineTotal | number:'1.2-2' }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            }

            @if (purchaseOrders().length === 0) {
              <div class="p-10 text-center rounded-xl bg-white border border-slate-200 text-slate-500 text-xs">
                No purchase orders found matching this filter.
              </div>
            }
          </div>
        </div>
      }

      <!-- TAB 2: SUPPLIERS DIRECTORY -->
      @if (activeTab() === 'suppliers') {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (sup of suppliers(); track sup.id) {
            <div class="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 shadow-sm transition-all flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between">
                  <span class="font-mono text-xs text-slate-900 font-semibold">{{ sup.code }}</span>
                  <span class="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                    Rating {{ sup.rating ? (sup.rating | number:'1.1-1') : '4.8' }} / 5.0
                  </span>
                </div>

                <h4 class="text-sm font-semibold text-slate-900 mt-2">{{ sup.name }}</h4>

                <div class="mt-2.5 text-xs text-slate-500 space-y-1">
                  <div>Contact: <span class="text-slate-800 font-medium">{{ sup.contactPerson || 'Vendor Rep' }}</span></div>
                  <div>Email: <span class="text-slate-700">{{ sup.email }}</span></div>
                  <div>Phone: <span class="text-slate-600 font-mono">{{ sup.phone || 'N/A' }}</span></div>
                  <div>Terms: <span class="text-slate-800 font-mono font-medium">{{ sup.paymentTerms || 'NET_30' }}</span></div>
                  <div>Avg Lead Time: <span class="text-slate-800 font-medium">{{ sup.averageLeadTimeDays || 7 }} business days</span></div>
                </div>
              </div>

              <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  (click)="viewSupplierCatalog(sup)"
                  class="text-xs text-slate-700 hover:text-slate-900 font-medium flex items-center gap-1"
                >
                  <app-icon name="tag" class="w-3.5 h-3.5"></app-icon>
                  <span>Catalog Costing</span>
                </button>

                <div class="flex items-center gap-1">
                  <button
                    type="button"
                    (click)="editSupplier(sup)"
                    class="p-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors shadow-xs"
                  >
                    <app-icon name="edit" class="w-3.5 h-3.5"></app-icon>
                  </button>
                  <button
                    type="button"
                    (click)="deleteSupplier(sup)"
                    class="p-1 rounded-md border border-slate-200 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition-colors shadow-xs"
                  >
                    <app-icon name="trash" class="w-3.5 h-3.5"></app-icon>
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      }

      <!-- MODAL: ISSUE PURCHASE ORDER -->
      <app-modal
        [isOpen]="isPoModalOpen()"
        title="Issue Purchase Order"
        icon="truck"
        (close)="isPoModalOpen.set(false)"
      >
        <form (ngSubmit)="createPurchaseOrder()" class="space-y-4 text-xs">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-700 font-medium mb-1">Supplier / Vendor *</label>
              <select
                [(ngModel)]="poForm.supplierId"
                name="poSupplier"
                required
                class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
              >
                @for (sup of suppliers(); track sup.id) {
                  <option [value]="sup.id">{{ sup.name }} ({{ sup.code }})</option>
                }
              </select>
            </div>
            <div>
              <label class="block text-slate-700 font-medium mb-1">Destination Facility *</label>
              <select
                [(ngModel)]="poForm.destinationWarehouseId"
                name="poDestWh"
                required
                class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
              >
                @for (wh of warehouses(); track wh.id) {
                  <option [value]="wh.id">{{ wh.name }}</option>
                }
              </select>
            </div>
          </div>

          <!-- Items list -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="text-slate-700 font-medium">Order Line Items *</label>
              <button
                type="button"
                (click)="addPoItemLine()"
                class="text-slate-900 hover:underline font-semibold"
              >
                + Add Item
              </button>
            </div>

            @for (item of poForm.items; track $index) {
              <div class="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200">
                <select
                  [(ngModel)]="item.productId"
                  name="po_prod_{{$index}}"
                  (ngModelChange)="onPoProductSelected($index)"
                  required
                  class="flex-1 bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-slate-900"
                >
                  @for (prod of products(); track prod.id) {
                    <option [value]="prod.id">{{ prod.name }} ({{ prod.sku }})</option>
                  }
                </select>

                <div class="w-24 flex items-center gap-1">
                  <span class="text-slate-500 text-[10px]">Qty:</span>
                  <input
                    type="number"
                    min="1"
                    [(ngModel)]="item.quantityOrdered"
                    name="po_qty_{{$index}}"
                    required
                    class="w-full bg-white border border-slate-300 rounded-md px-2 py-1.5 text-slate-900 font-mono focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div class="w-28 flex items-center gap-1">
                  <span class="text-slate-500 text-[10px]">Cost:</span>
                  <input
                    type="number"
                    step="0.01"
                    [(ngModel)]="item.unitCost"
                    name="po_cost_{{$index}}"
                    required
                    class="w-full bg-white border border-slate-300 rounded-md px-2 py-1.5 text-slate-900 font-mono focus:outline-none focus:border-slate-900"
                  />
                </div>

                @if (poForm.items.length > 1) {
                  <button
                    type="button"
                    (click)="removePoItemLine($index)"
                    class="p-1 rounded text-rose-600 hover:bg-rose-50"
                  >
                    <app-icon name="trash" class="w-3.5 h-3.5"></app-icon>
                  </button>
                }
              </div>
            }
          </div>

          <div>
            <label class="block text-slate-700 font-medium mb-1">Procurement Notes</label>
            <textarea
              [(ngModel)]="poForm.notes"
              name="poNotes"
              rows="2"
              placeholder="e.g. Expedited delivery approved for Q3 stock replenishment..."
              class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
            ></textarea>
          </div>

          <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              (click)="isPoModalOpen.set(false)"
              class="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors shadow-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors shadow-sm"
            >
              Generate PO (Draft)
            </button>
          </div>
        </form>
      </app-modal>

      <!-- MODAL: GOODS RECEIVED NOTE (GRN) DOCK RESTOCKING -->
      <app-modal
        [isOpen]="isGrnModalOpen()"
        title="Dock Goods Received Note (GRN) & Restock"
        icon="shield-check"
        (close)="isGrnModalOpen.set(false)"
      >
        @if (selectedPoForGrn()) {
          <form (ngSubmit)="submitGrnReceipt()" class="space-y-4 text-xs">
            <div class="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 space-y-1">
              <div class="flex items-center justify-between">
                <span class="text-slate-900 font-bold font-mono">{{ selectedPoForGrn()!.poNumber }}</span>
                <span class="text-emerald-700 font-medium">Destination: {{ selectedPoForGrn()!.destinationWarehouseName }}</span>
              </div>
              <p class="text-[11px] text-slate-500">
                Verifying received inventory will increment warehouse stock on hand and recalculate weighted moving average cost.
              </p>
            </div>

            <div class="space-y-2.5">
              <label class="block text-slate-700 font-medium">Verify Received Quantities *</label>
              @for (item of grnReceipt.items; track item.poItemId; let idx = $index) {
                <div class="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <h5 class="font-medium text-slate-900">{{ selectedPoForGrn()!.items[idx]?.productName }}</h5>
                    <span class="font-mono text-slate-500 text-[11px]">
                      Ordered: {{ selectedPoForGrn()!.items[idx]?.quantityOrdered }} | Prev Received: {{ selectedPoForGrn()!.items[idx]?.quantityReceived || 0 }}
                    </span>
                  </div>

                  <div class="flex items-center gap-2">
                    <span class="text-slate-500 text-[11px]">Receive Qty:</span>
                    <input
                      type="number"
                      min="1"
                      [(ngModel)]="item.quantityReceived"
                      name="grn_qty_{{idx}}"
                      required
                      class="w-20 bg-white border border-slate-300 rounded-md px-2 py-1 text-slate-900 font-mono text-center focus:outline-none focus:border-slate-900"
                    />
                  </div>
                </div>
              }
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-slate-700 font-medium mb-1">Receiving Dock Staff</label>
                <input
                  type="text"
                  [(ngModel)]="grnReceipt.receivedBy"
                  name="grnBy"
                  placeholder="elena.wh"
                  class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                />
              </div>
              <div>
                <label class="block text-slate-700 font-medium mb-1">Dock Notes</label>
                <input
                  type="text"
                  [(ngModel)]="grnReceipt.notes"
                  name="grnNotes"
                  placeholder="Inspected with no transit carton damage."
                  class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                />
              </div>
            </div>

            <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                (click)="isGrnModalOpen.set(false)"
                class="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors shadow-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors shadow-sm"
              >
                Confirm GRN Dock Receipt
              </button>
            </div>
          </form>
        }
      </app-modal>

      <!-- MODAL: ADD / EDIT SUPPLIER -->
      <app-modal
        [isOpen]="isSupplierModalOpen()"
        [title]="editingSupplierId ? 'Edit Supplier' : 'Register New Vendor Partner'"
        icon="building"
        (close)="isSupplierModalOpen.set(false)"
      >
        <form (ngSubmit)="saveSupplier()" class="space-y-4 text-xs">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-700 font-medium mb-1">Supplier Code *</label>
              <input
                type="text"
                [(ngModel)]="supplierForm.code"
                name="supCode"
                required
                placeholder="e.g. VEND-SONY-01"
                class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>
            <div>
              <label class="block text-slate-700 font-medium mb-1">Supplier Name *</label>
              <input
                type="text"
                [(ngModel)]="supplierForm.name"
                name="supName"
                required
                placeholder="e.g. Sony Electronics Global"
                class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-700 font-medium mb-1">Contact Person</label>
              <input
                type="text"
                [(ngModel)]="supplierForm.contactPerson"
                name="supContact"
                placeholder="e.g. Robert Vance"
                class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>
            <div>
              <label class="block text-slate-700 font-medium mb-1">Email *</label>
              <input
                type="email"
                [(ngModel)]="supplierForm.email"
                name="supEmail"
                required
                placeholder="procurement@sony.com"
                class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="block text-slate-700 font-medium mb-1">Payment Terms</label>
              <input
                type="text"
                [(ngModel)]="supplierForm.paymentTerms"
                name="supTerms"
                placeholder="NET_30"
                class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>
            <div>
              <label class="block text-slate-700 font-medium mb-1">Avg Lead Time (Days)</label>
              <input
                type="number"
                [(ngModel)]="supplierForm.averageLeadTimeDays"
                name="supLeadTime"
                placeholder="7"
                class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>
            <div>
              <label class="block text-slate-700 font-medium mb-1">Vendor Rating (1-5)</label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="5"
                [(ngModel)]="supplierForm.rating"
                name="supRating"
                placeholder="4.8"
                class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>
          </div>

          <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              (click)="isSupplierModalOpen.set(false)"
              class="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors shadow-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors shadow-sm"
            >
              Save Vendor
            </button>
          </div>
        </form>
      </app-modal>

      <!-- MODAL: SUPPLIER CATALOG COSTING DRAWER -->
      <app-modal
        [isOpen]="isCatalogModalOpen()"
        title="Supplier Catalog & Costing Matrix"
        icon="tag"
        (close)="isCatalogModalOpen.set(false)"
      >
        @if (selectedSupplierForCatalog()) {
          <div class="space-y-4 text-xs">
            <div class="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
              <span class="text-slate-900 font-semibold">{{ selectedSupplierForCatalog()!.name }}</span> &bull;
              <span>Cost agreement matrix with negotiated unit costs and minimum order quantities.</span>
            </div>

            <!-- Existing linked products -->
            <div class="rounded-lg bg-white border border-slate-200 overflow-hidden">
              <table class="w-full text-left text-xs">
                <thead class="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold">
                  <tr>
                    <th class="py-2 px-3">Product Name</th>
                    <th class="py-2 px-3">Supplier SKU</th>
                    <th class="py-2 px-3 text-right">Agreed Cost</th>
                    <th class="py-2 px-3 text-center">Min Order Qty</th>
                    <th class="py-2 px-3 text-center">Lead Days</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-slate-700">
                  @for (sp of supplierProducts(); track sp.id) {
                    <tr class="hover:bg-slate-50/75">
                      <td class="py-2 px-3 font-medium text-slate-900">{{ sp.product?.name }}</td>
                      <td class="py-2 px-3 font-mono text-slate-700">{{ sp.supplierSku || '-' }}</td>
                      <td class="py-2 px-3 text-right font-mono font-semibold text-emerald-700">\${{ sp.agreedCost | number:'1.2-2' }}</td>
                      <td class="py-2 px-3 text-center font-mono">{{ sp.minOrderQuantity }}</td>
                      <td class="py-2 px-3 text-center font-mono">{{ sp.leadTimeDays }}d</td>
                    </tr>
                  }
                  @if (supplierProducts().length === 0) {
                    <tr>
                      <td colspan="5" class="text-center py-6 text-slate-500">
                        No product cost agreements linked yet.
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <!-- Add new link form -->
            <div class="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
              <h5 class="font-medium text-slate-900">Map New Product Agreement</h5>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block text-slate-600 mb-1">Product SKU</label>
                  <select
                    [(ngModel)]="linkProductForm.productId"
                    name="linkProd"
                    class="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-slate-900"
                  >
                    @for (p of products(); track p.id) {
                      <option [value]="p.id">{{ p.name }} ({{ p.sku }})</option>
                    }
                  </select>
                </div>
                <div>
                  <label class="block text-slate-600 mb-1">Agreed Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    [(ngModel)]="linkProductForm.agreedCost"
                    name="linkCost"
                    class="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-900 font-mono focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div class="grid grid-cols-3 gap-2">
                <div>
                  <label class="block text-slate-600 mb-1">Vendor SKU</label>
                  <input
                    type="text"
                    [(ngModel)]="linkProductForm.supplierSku"
                    name="linkSku"
                    placeholder="VND-SKU-99"
                    class="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-900 font-mono focus:outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label class="block text-slate-600 mb-1">MOQ</label>
                  <input
                    type="number"
                    [(ngModel)]="linkProductForm.minOrderQty"
                    name="linkMoq"
                    class="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-900 font-mono focus:outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label class="block text-slate-600 mb-1">Lead Days</label>
                  <input
                    type="number"
                    [(ngModel)]="linkProductForm.leadTimeDays"
                    name="linkDays"
                    class="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-900 font-mono focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div class="flex justify-end pt-1">
                <button
                  type="button"
                  (click)="saveProductAgreement()"
                  class="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-colors shadow-sm"
                >
                  Save Agreement
                </button>
              </div>
            </div>
          </div>
        }
      </app-modal>
    </div>
  `
})
export class ProcurementComponent implements OnInit {
  private readonly procurementService = inject(ProcurementService);
  private readonly warehouseService = inject(WarehouseService);
  private readonly productService = inject(ProductService);
  private readonly toast = inject(ToastService);

  readonly activeTab = signal<'orders' | 'suppliers'>('orders');
  readonly filterPoStatus = signal<PurchaseOrderStatus | null>(null);

  readonly purchaseOrders = signal<PurchaseOrderResponse[]>([]);
  readonly suppliers = signal<Supplier[]>([]);
  readonly warehouses = signal<Warehouse[]>([]);
  readonly products = signal<Product[]>([]);

  // Modals
  readonly isPoModalOpen = signal(false);
  readonly isGrnModalOpen = signal(false);
  readonly isSupplierModalOpen = signal(false);
  readonly isCatalogModalOpen = signal(false);

  // Active items for modals
  readonly selectedPoForGrn = signal<PurchaseOrderResponse | null>(null);
  readonly selectedSupplierForCatalog = signal<Supplier | null>(null);
  readonly supplierProducts = signal<SupplierProduct[]>([]);

  editingSupplierId: number | null = null;

  // Forms
  poForm: PurchaseOrderRequest = {
    supplierId: 1,
    destinationWarehouseId: 1,
    createdBy: 'alex.proc',
    notes: '',
    items: [{ productId: 1, quantityOrdered: 25, unitCost: 240 }]
  };

  grnReceipt: GoodsReceipt = {
    receivedBy: 'elena.wh',
    notes: 'GRN dock inspection passed.',
    items: []
  };

  supplierForm: Partial<Supplier> = {
    code: '',
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    paymentTerms: 'NET_30',
    averageLeadTimeDays: 7,
    rating: 4.8,
    active: true
  };

  linkProductForm = {
    productId: 1,
    supplierSku: '',
    agreedCost: 200,
    minOrderQty: 10,
    leadTimeDays: 7
  };

  ngOnInit(): void {
    this.loadPurchaseOrders();
    this.loadSuppliers();
    this.loadMetadata();
  }

  loadPurchaseOrders(): void {
    const status = this.filterPoStatus() || undefined;
    this.procurementService.getAllPurchaseOrders(status).subscribe({
      next: (pos) => this.purchaseOrders.set(pos),
      error: () => this.toast.error('Error', 'Failed to load purchase orders.')
    });
  }

  loadSuppliers(): void {
    this.procurementService.getAllSuppliers().subscribe({
      next: (sups) => this.suppliers.set(sups),
      error: () => this.toast.error('Error', 'Failed to load suppliers.')
    });
  }

  loadMetadata(): void {
    this.warehouseService.getWarehouses().subscribe({
      next: (whs) => {
        this.warehouses.set(whs);
        if (whs.length > 0) this.poForm.destinationWarehouseId = whs[0].id!;
      },
      error: () => {}
    });

    this.productService.getProducts().subscribe({
      next: (prods) => {
        this.products.set(prods);
        if (prods.length > 0) {
          this.poForm.items[0].productId = prods[0].id!;
          this.poForm.items[0].unitCost = prods[0].costPrice;
          this.linkProductForm.productId = prods[0].id!;
          this.linkProductForm.agreedCost = prods[0].costPrice;
        }
      },
      error: () => {}
    });
  }

  openPoModal(): void {
    this.poForm = {
      supplierId: this.suppliers()[0]?.id || 1,
      destinationWarehouseId: this.warehouses()[0]?.id || 1,
      createdBy: 'alex.proc',
      notes: '',
      items: [{
        productId: this.products()[0]?.id || 1,
        quantityOrdered: 20,
        unitCost: this.products()[0]?.costPrice || 100
      }]
    };
    this.isPoModalOpen.set(true);
  }

  addPoItemLine(): void {
    const p = this.products()[0];
    this.poForm.items.push({
      productId: p?.id || 1,
      quantityOrdered: 10,
      unitCost: p?.costPrice || 50
    });
  }

  removePoItemLine(index: number): void {
    this.poForm.items.splice(index, 1);
  }

  onPoProductSelected(index: number): void {
    const prodId = this.poForm.items[index].productId;
    const match = this.products().find(p => p.id === Number(prodId));
    if (match) {
      this.poForm.items[index].unitCost = match.costPrice;
    }
  }

  createPurchaseOrder(): void {
    this.procurementService.createPurchaseOrder(this.poForm).subscribe({
      next: (po) => {
        this.toast.success('PO Issued', `Purchase Order ${po.poNumber} created in DRAFT status!`);
        this.isPoModalOpen.set(false);
        this.loadPurchaseOrders();
      },
      error: (err) => this.toast.error('PO Creation Failed', err?.error?.message || 'Check PO details.')
    });
  }

  submitPo(id: number): void {
    this.procurementService.submitPurchaseOrder(id).subscribe({
      next: (po) => {
        this.toast.success('PO Submitted', `PO ${po.poNumber} submitted to vendor.`);
        this.loadPurchaseOrders();
      },
      error: () => this.toast.error('Error', 'Failed to submit PO.')
    });
  }

  approvePo(id: number): void {
    this.procurementService.approvePurchaseOrder(id).subscribe({
      next: (po) => {
        this.toast.success('PO Approved', `PO ${po.poNumber} approved for shipment.`);
        this.loadPurchaseOrders();
      },
      error: () => this.toast.error('Error', 'Failed to approve PO.')
    });
  }

  openGrnModal(po: PurchaseOrderResponse): void {
    this.selectedPoForGrn.set(po);
    this.grnReceipt = {
      receivedBy: 'elena.wh',
      notes: 'Dock verification passed. Items inspected.',
      items: po.items.map(item => ({
        poItemId: item.id,
        quantityReceived: item.quantityOrdered - (item.quantityReceived || 0)
      }))
    };
    this.isGrnModalOpen.set(true);
  }

  submitGrnReceipt(): void {
    const po = this.selectedPoForGrn();
    if (!po) return;

    this.procurementService.receiveGoods(po.id, this.grnReceipt).subscribe({
      next: () => {
        this.toast.success('GRN Confirmed', `Goods received! Stock replenished at ${po.destinationWarehouseName} and moving average cost updated.`);
        this.isGrnModalOpen.set(false);
        this.loadPurchaseOrders();
      },
      error: (err) => this.toast.error('GRN Failed', err?.error?.message || 'Receipt validation error.')
    });
  }

  cancelPo(id: number): void {
    if (confirm('Cancel this purchase order?')) {
      this.procurementService.cancelPurchaseOrder(id).subscribe({
        next: () => {
          this.toast.info('Cancelled', 'Purchase order cancelled.');
          this.loadPurchaseOrders();
        },
        error: () => this.toast.error('Error', 'Failed to cancel PO.')
      });
    }
  }

  // Suppliers actions
  openSupplierModal(): void {
    this.editingSupplierId = null;
    this.supplierForm = {
      code: '',
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      paymentTerms: 'NET_30',
      averageLeadTimeDays: 7,
      rating: 4.8,
      active: true
    };
    this.isSupplierModalOpen.set(true);
  }

  editSupplier(sup: Supplier): void {
    this.editingSupplierId = sup.id || null;
    this.supplierForm = { ...sup };
    this.isSupplierModalOpen.set(true);
  }

  saveSupplier(): void {
    if (this.editingSupplierId) {
      this.procurementService.updateSupplier(this.editingSupplierId, this.supplierForm).subscribe({
        next: () => {
          this.toast.success('Supplier Saved', 'Vendor profile updated.');
          this.isSupplierModalOpen.set(false);
          this.loadSuppliers();
        },
        error: () => this.toast.error('Error', 'Failed to update supplier.')
      });
    } else {
      this.procurementService.createSupplier(this.supplierForm).subscribe({
        next: () => {
          this.toast.success('Supplier Registered', 'Vendor profile created.');
          this.isSupplierModalOpen.set(false);
          this.loadSuppliers();
        },
        error: () => this.toast.error('Error', 'Failed to register supplier.')
      });
    }
  }

  deleteSupplier(sup: Supplier): void {
    if (!sup.id) return;
    if (confirm(`Remove supplier "${sup.name}"?`)) {
      this.procurementService.deleteSupplier(sup.id).subscribe({
        next: () => {
          this.toast.success('Removed', 'Supplier removed.');
          this.loadSuppliers();
        },
        error: () => this.toast.error('Error', 'Cannot remove supplier with active POs.')
      });
    }
  }

  viewSupplierCatalog(sup: Supplier): void {
    this.selectedSupplierForCatalog.set(sup);
    if (sup.id) {
      this.procurementService.getSupplierProducts(sup.id).subscribe({
        next: (sps) => this.supplierProducts.set(sps),
        error: () => {}
      });
    }
    this.isCatalogModalOpen.set(true);
  }

  saveProductAgreement(): void {
    const sup = this.selectedSupplierForCatalog();
    if (!sup || !sup.id) return;

    this.procurementService.linkProductToSupplier(sup.id, this.linkProductForm).subscribe({
      next: () => {
        this.toast.success('Agreement Mapped', 'Product linked with agreed unit cost!');
        this.viewSupplierCatalog(sup);
      },
      error: () => this.toast.error('Error', 'Failed to link product agreement.')
    });
  }
}
