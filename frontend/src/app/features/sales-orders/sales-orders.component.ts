import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SalesOrderService } from '../../core/services/sales-order.service';
import { WarehouseService } from '../../core/services/warehouse.service';
import { ProductService } from '../../core/services/product.service';
import { ToastService } from '../../core/services/toast.service';
import {
  SalesOrderRequest,
  SalesOrderResponse,
  SalesOrderStatus
} from '../../core/models/sales-order.model';
import { Warehouse } from '../../core/models/warehouse.model';
import { Product } from '../../core/models/product.model';
import { IconComponent } from '../../shared/components/icons.component';
import { ModalComponent } from '../../shared/components/modal.component';

@Component({
  selector: 'app-sales-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, ModalComponent],
  template: `
    <div class="space-y-6 animate-fade-in">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            Retail Order Fulfillment Pipeline
          </h2>
          <p class="text-xs text-slate-500 mt-0.5">
            Real-time stock reservation, picking verification, packing confirmation, courier shipping, and delivery dispatch.
          </p>
        </div>

        <button
          type="button"
          (click)="openOrderModal()"
          class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium shadow-sm transition-colors"
        >
          <app-icon name="cart" class="w-3.5 h-3.5"></app-icon>
          <span>Create Customer Order</span>
        </button>
      </div>

      <!-- Filter Pills -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <button
          type="button"
          (click)="filterStatus.set(null); loadOrders()"
          class="px-3 py-1.5 rounded-lg border transition-all text-xs font-medium"
          [ngClass]="filterStatus() === null ? 'bg-slate-900 border-slate-900 text-white shadow-xs' : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'"
        >
          All Orders ({{ orders().length }})
        </button>
        <button
          type="button"
          (click)="filterStatus.set('PENDING'); loadOrders()"
          class="px-3 py-1.5 rounded-lg border transition-all text-xs font-medium"
          [ngClass]="filterStatus() === 'PENDING' ? 'bg-amber-600 border-amber-600 text-white shadow-xs' : 'bg-white border-slate-200 text-slate-600 hover:text-amber-700 hover:bg-slate-50'"
        >
          Pending Reservation
        </button>
        <button
          type="button"
          (click)="filterStatus.set('ALLOCATED'); loadOrders()"
          class="px-3 py-1.5 rounded-lg border transition-all text-xs font-medium"
          [ngClass]="filterStatus() === 'ALLOCATED' ? 'bg-blue-600 border-blue-600 text-white shadow-xs' : 'bg-white border-slate-200 text-slate-600 hover:text-blue-700 hover:bg-slate-50'"
        >
          Allocated
        </button>
        <button
          type="button"
          (click)="filterStatus.set('PICKED'); loadOrders()"
          class="px-3 py-1.5 rounded-lg border transition-all text-xs font-medium"
          [ngClass]="filterStatus() === 'PICKED' ? 'bg-cyan-600 border-cyan-600 text-white shadow-xs' : 'bg-white border-slate-200 text-slate-600 hover:text-cyan-700 hover:bg-slate-50'"
        >
          Picked
        </button>
        <button
          type="button"
          (click)="filterStatus.set('PACKED'); loadOrders()"
          class="px-3 py-1.5 rounded-lg border transition-all text-xs font-medium"
          [ngClass]="filterStatus() === 'PACKED' ? 'bg-purple-600 border-purple-600 text-white shadow-xs' : 'bg-white border-slate-200 text-slate-600 hover:text-purple-700 hover:bg-slate-50'"
        >
          Packed
        </button>
        <button
          type="button"
          (click)="filterStatus.set('SHIPPED'); loadOrders()"
          class="px-3 py-1.5 rounded-lg border transition-all text-xs font-medium"
          [ngClass]="filterStatus() === 'SHIPPED' ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs' : 'bg-white border-slate-200 text-slate-600 hover:text-indigo-700 hover:bg-slate-50'"
        >
          Shipped
        </button>
        <button
          type="button"
          (click)="filterStatus.set('DELIVERED'); loadOrders()"
          class="px-3 py-1.5 rounded-lg border transition-all text-xs font-medium"
          [ngClass]="filterStatus() === 'DELIVERED' ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs' : 'bg-white border-slate-200 text-slate-600 hover:text-emerald-700 hover:bg-slate-50'"
        >
          Delivered
        </button>
      </div>

      <!-- Orders List -->
      <div class="space-y-4">
        @for (order of orders(); track order.id) {
          <div class="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 shadow-sm transition-all space-y-4">
            <!-- Header Row -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div class="flex items-center gap-2.5">
                <span class="font-mono text-xs font-semibold text-slate-900">{{ order.orderNumber }}</span>
                <span
                  class="px-2 py-0.5 rounded text-[10px] font-medium border uppercase"
                  [ngClass]="{
                    'bg-amber-50 text-amber-700 border-amber-200': order.status === 'PENDING',
                    'bg-blue-50 text-blue-700 border-blue-200': order.status === 'ALLOCATED',
                    'bg-cyan-50 text-cyan-700 border-cyan-200': order.status === 'PICKED',
                    'bg-purple-50 text-purple-700 border-purple-200': order.status === 'PACKED',
                    'bg-indigo-50 text-indigo-700 border-indigo-200': order.status === 'SHIPPED',
                    'bg-emerald-50 text-emerald-700 border-emerald-200': order.status === 'DELIVERED',
                    'bg-rose-50 text-rose-700 border-rose-200': order.status === 'CANCELLED'
                  }"
                >
                  {{ order.status }}
                </span>
                <span class="text-xs text-slate-400 font-mono">Date: {{ order.orderDate | date:'mediumDate' }}</span>
              </div>

              <!-- Pipeline Action Stepper Buttons -->
              <div class="flex items-center gap-1.5">
                @if (order.status === 'PENDING') {
                  <button
                    type="button"
                    (click)="allocate(order.id)"
                    class="px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors shadow-xs"
                  >
                    Allocate Stock
                  </button>
                }

                @if (order.status === 'ALLOCATED') {
                  <button
                    type="button"
                    (click)="pick(order.id)"
                    class="px-2.5 py-1 rounded-md bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-medium transition-colors flex items-center gap-1 shadow-xs"
                  >
                    <app-icon name="check" class="w-3.5 h-3.5"></app-icon>
                    <span>Mark Picked</span>
                  </button>
                }

                @if (order.status === 'PICKED') {
                  <button
                    type="button"
                    (click)="pack(order.id)"
                    class="px-2.5 py-1 rounded-md bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium transition-colors flex items-center gap-1 shadow-xs"
                  >
                    <app-icon name="box" class="w-3.5 h-3.5"></app-icon>
                    <span>Mark Packed</span>
                  </button>
                }

                @if (order.status === 'PACKED') {
                  <button
                    type="button"
                    (click)="ship(order.id)"
                    class="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors flex items-center gap-1 shadow-xs"
                  >
                    <app-icon name="truck" class="w-3.5 h-3.5"></app-icon>
                    <span>Dispatch & Ship (Deduct Stock)</span>
                  </button>
                }

                @if (order.status === 'SHIPPED') {
                  <button
                    type="button"
                    (click)="deliver(order.id)"
                    class="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors flex items-center gap-1 shadow-xs"
                  >
                    <app-icon name="check" class="w-3.5 h-3.5"></app-icon>
                    <span>Mark Delivered</span>
                  </button>
                }

                @if (order.status !== 'DELIVERED' && order.status !== 'CANCELLED') {
                  <button
                    type="button"
                    (click)="cancel(order.id)"
                    class="px-2.5 py-1 rounded-md border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 text-xs font-medium transition-colors shadow-xs"
                  >
                    Cancel
                  </button>
                }
              </div>
            </div>

            <!-- Visual 6-Step Fulfillment Timeline Indicator -->
            <div class="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div class="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                <span [ngClass]="getStepClass(order.status, 'PENDING')">1. Pending</span>
                <span class="text-slate-300">&rarr;</span>
                <span [ngClass]="getStepClass(order.status, 'ALLOCATED')">2. Allocated</span>
                <span class="text-slate-300">&rarr;</span>
                <span [ngClass]="getStepClass(order.status, 'PICKED')">3. Picked</span>
                <span class="text-slate-300">&rarr;</span>
                <span [ngClass]="getStepClass(order.status, 'PACKED')">4. Packed</span>
                <span class="text-slate-300">&rarr;</span>
                <span [ngClass]="getStepClass(order.status, 'SHIPPED')">5. Shipped</span>
                <span class="text-slate-300">&rarr;</span>
                <span [ngClass]="getStepClass(order.status, 'DELIVERED')">6. Delivered</span>
              </div>
            </div>

            <!-- Customer & Warehouse Summary -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div class="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span class="text-slate-500 block mb-0.5">Customer Info</span>
                <strong class="text-slate-900 text-xs font-semibold">{{ order.customerName }}</strong>
                <div class="text-[11px] text-slate-600">{{ order.customerEmail || 'No email' }}</div>
                <div class="text-[11px] text-slate-500">{{ order.customerPhone || 'No phone' }}</div>
              </div>

              <div class="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span class="text-slate-500 block mb-0.5">Fulfillment Origin Hub</span>
                <strong class="text-slate-900 text-xs font-semibold">{{ order.warehouseName }}</strong>
                <div class="text-[11px] text-slate-500 mt-0.5 line-clamp-1">Ship to: {{ order.shippingAddress }}</div>
              </div>

              <div class="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span class="text-slate-500 block mb-0.5">Order Financial Total</span>
                <strong class="text-emerald-700 text-sm font-mono font-semibold">\${{ order.totalAmount | number:'1.2-2' }}</strong>
                <div class="text-[11px] text-slate-500 mt-0.5">Agent: {{ order.createdBy || 'maya.sales' }}</div>
              </div>
            </div>

            <!-- Order Line Items -->
            <div class="rounded-lg bg-white border border-slate-200 overflow-hidden">
              <table class="w-full text-left text-xs">
                <thead class="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th class="py-2 px-3">SKU</th>
                    <th class="py-2 px-3">Product Name</th>
                    <th class="py-2 px-3 text-right">Retail Price</th>
                    <th class="py-2 px-3 text-center">Ordered</th>
                    <th class="py-2 px-3 text-center">Allocated</th>
                    <th class="py-2 px-3 text-center">Shipped</th>
                    <th class="py-2 px-3 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-slate-700">
                  @for (item of order.items; track item.id) {
                    <tr class="hover:bg-slate-50/75">
                      <td class="py-2 px-3 font-mono font-semibold text-slate-900">{{ item.productSku }}</td>
                      <td class="py-2 px-3 font-medium text-slate-900">{{ item.productName }}</td>
                      <td class="py-2 px-3 text-right font-mono text-slate-600">\${{ item.unitPrice | number:'1.2-2' }}</td>
                      <td class="py-2 px-3 text-center font-mono font-semibold text-slate-900">{{ item.quantityOrdered }}</td>
                      <td class="py-2 px-3 text-center font-mono text-blue-700 font-semibold">{{ item.quantityAllocated || 0 }}</td>
                      <td class="py-2 px-3 text-center font-mono text-emerald-700 font-semibold">{{ item.quantityShipped || 0 }}</td>
                      <td class="py-2 px-3 text-right font-mono font-semibold text-slate-900">\${{ item.lineTotal | number:'1.2-2' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

        @if (orders().length === 0) {
          <div class="p-10 text-center rounded-xl bg-white border border-slate-200 text-slate-500 text-xs">
            No sales orders matching this view.
          </div>
        }
      </div>

      <!-- MODAL: CREATE SALES ORDER -->
      <app-modal
        [isOpen]="isOrderModalOpen()"
        title="Create Retail Sales Order"
        icon="cart"
        (close)="isOrderModalOpen.set(false)"
      >
        <form (ngSubmit)="submitSalesOrder()" class="space-y-4 text-xs">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-700 font-medium mb-1">Customer Name *</label>
              <input
                type="text"
                [(ngModel)]="orderForm.customerName"
                name="custName"
                required
                placeholder="e.g. Acme Retail Corp"
                class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>
            <div>
              <label class="block text-slate-700 font-medium mb-1">Customer Email</label>
              <input
                type="email"
                [(ngModel)]="orderForm.customerEmail"
                name="custEmail"
                placeholder="buyer@acme.com"
                class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-700 font-medium mb-1">Phone Number</label>
              <input
                type="text"
                [(ngModel)]="orderForm.customerPhone"
                name="custPhone"
                placeholder="+1 555-019-2834"
                class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>
            <div>
              <label class="block text-slate-700 font-medium mb-1">Fulfillment Origin Warehouse *</label>
              <select
                [(ngModel)]="orderForm.sourceWarehouseId"
                name="orderSourceWh"
                required
                class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
              >
                @for (wh of warehouses(); track wh.id) {
                  <option [value]="wh.id">{{ wh.name }}</option>
                }
              </select>
            </div>
          </div>

          <div>
            <label class="block text-slate-700 font-medium mb-1">Shipping Address *</label>
            <textarea
              [(ngModel)]="orderForm.shippingAddress"
              name="shipAddress"
              rows="2"
              required
              placeholder="742 Evergreen Terrace, Springfield, OR"
              class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
            ></textarea>
          </div>

          <!-- Items selector -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="text-slate-700 font-medium">Order Items *</label>
              <button
                type="button"
                (click)="addOrderItemLine()"
                class="text-slate-900 hover:underline font-semibold"
              >
                + Add Item
              </button>
            </div>

            @for (item of orderForm.items; track $index) {
              <div class="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200">
                <select
                  [(ngModel)]="item.productId"
                  name="so_prod_{{$index}}"
                  (ngModelChange)="onProductChange($index)"
                  required
                  class="flex-1 bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-slate-900"
                >
                  @for (prod of products(); track prod.id) {
                    <option [value]="prod.id">{{ prod.name }} ({{ prod.sku }}) - \${{ prod.unitPrice }}</option>
                  }
                </select>

                <div class="w-24 flex items-center gap-1">
                  <span class="text-slate-500 text-[10px]">Qty:</span>
                  <input
                    type="number"
                    min="1"
                    [(ngModel)]="item.quantity"
                    name="so_qty_{{$index}}"
                    required
                    class="w-full bg-white border border-slate-300 rounded-md px-2 py-1.5 text-slate-900 font-mono focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div class="w-28 flex items-center gap-1">
                  <span class="text-slate-500 text-[10px]">Price:</span>
                  <input
                    type="number"
                    step="0.01"
                    [(ngModel)]="item.unitPrice"
                    name="so_price_{{$index}}"
                    class="w-full bg-white border border-slate-300 rounded-md px-2 py-1.5 text-slate-900 font-mono focus:outline-none focus:border-slate-900"
                  />
                </div>

                @if (orderForm.items.length > 1) {
                  <button
                    type="button"
                    (click)="removeOrderItemLine($index)"
                    class="p-1 rounded text-rose-600 hover:bg-rose-50"
                  >
                    <app-icon name="trash" class="w-3.5 h-3.5"></app-icon>
                  </button>
                }
              </div>
            }
          </div>

          <div>
            <label class="block text-slate-700 font-medium mb-1">Customer / Delivery Notes</label>
            <input
              type="text"
              [(ngModel)]="orderForm.notes"
              name="orderNotes"
              placeholder="Leave package at loading dock B."
              class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
            />
          </div>

          <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              (click)="isOrderModalOpen.set(false)"
              class="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors shadow-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors shadow-sm"
            >
              Place Order & Reserve Stock
            </button>
          </div>
        </form>
      </app-modal>
    </div>
  `
})
export class SalesOrdersComponent implements OnInit {
  private readonly salesOrderService = inject(SalesOrderService);
  private readonly warehouseService = inject(WarehouseService);
  private readonly productService = inject(ProductService);
  private readonly toast = inject(ToastService);

  readonly orders = signal<SalesOrderResponse[]>([]);
  readonly warehouses = signal<Warehouse[]>([]);
  readonly products = signal<Product[]>([]);
  readonly filterStatus = signal<SalesOrderStatus | null>(null);

  readonly isOrderModalOpen = signal(false);

  orderForm: SalesOrderRequest = {
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    shippingAddress: '',
    sourceWarehouseId: 1,
    notes: '',
    createdBy: 'maya.sales',
    items: [{ productId: 1, quantity: 2, unitPrice: 399.99 }]
  };

  ngOnInit(): void {
    this.loadOrders();
    this.loadMetadata();
  }

  loadOrders(): void {
    const status = this.filterStatus() || undefined;
    this.salesOrderService.getAllSalesOrders(status).subscribe({
      next: (orders) => this.orders.set(orders),
      error: () => this.toast.error('Error', 'Failed to load sales orders.')
    });
  }

  loadMetadata(): void {
    this.warehouseService.getWarehouses().subscribe({
      next: (whs) => {
        this.warehouses.set(whs);
        if (whs.length > 0) this.orderForm.sourceWarehouseId = whs[0].id!;
      },
      error: () => {}
    });

    this.productService.getProducts().subscribe({
      next: (prods) => {
        this.products.set(prods);
        if (prods.length > 0) {
          this.orderForm.items[0].productId = prods[0].id!;
          this.orderForm.items[0].unitPrice = prods[0].unitPrice;
        }
      },
      error: () => {}
    });
  }

  openOrderModal(): void {
    this.orderForm = {
      customerName: 'Global Retail Outlets',
      customerEmail: 'orders@globalretail.com',
      customerPhone: '+1 555-012-8822',
      shippingAddress: '100 Fifth Avenue, Suite 400, New York, NY 10011',
      sourceWarehouseId: this.warehouses()[0]?.id || 1,
      notes: 'Priority express dispatch requested.',
      createdBy: 'maya.sales',
      items: [{
        productId: this.products()[0]?.id || 1,
        quantity: 2,
        unitPrice: this.products()[0]?.unitPrice || 399.99
      }]
    };
    this.isOrderModalOpen.set(true);
  }

  addOrderItemLine(): void {
    const p = this.products()[0];
    this.orderForm.items.push({
      productId: p?.id || 1,
      quantity: 1,
      unitPrice: p?.unitPrice || 100
    });
  }

  removeOrderItemLine(index: number): void {
    this.orderForm.items.splice(index, 1);
  }

  onProductChange(index: number): void {
    const prodId = this.orderForm.items[index].productId;
    const match = this.products().find(p => p.id === Number(prodId));
    if (match) {
      this.orderForm.items[index].unitPrice = match.unitPrice;
    }
  }

  submitSalesOrder(): void {
    this.salesOrderService.createSalesOrder(this.orderForm).subscribe({
      next: (created) => {
        this.toast.success('Order Created', `Order ${created.orderNumber} ingested and inventory reserved atomically!`);
        this.isOrderModalOpen.set(false);
        this.loadOrders();
      },
      error: (err) => this.toast.error('Order Placement Failed', err?.error?.message || 'Check warehouse available stock.')
    });
  }

  allocate(id: number): void {
    this.salesOrderService.allocateOrder(id).subscribe({
      next: () => {
        this.toast.success('Allocated', 'Stock allocated for warehouse pick list.');
        this.loadOrders();
      },
      error: (err) => this.toast.error('Error', err?.error?.message || 'Failed to allocate order.')
    });
  }

  pick(id: number): void {
    this.salesOrderService.pickOrder(id).subscribe({
      next: () => {
        this.toast.success('Picked', 'Items verified and marked picked.');
        this.loadOrders();
      },
      error: (err) => this.toast.error('Error', err?.error?.message || 'Failed to pick order.')
    });
  }

  pack(id: number): void {
    this.salesOrderService.packOrder(id).subscribe({
      next: () => {
        this.toast.success('Packed', 'Packing slip generated and carton sealed.');
        this.loadOrders();
      },
      error: (err) => this.toast.error('Error', err?.error?.message || 'Failed to pack order.')
    });
  }

  ship(id: number): void {
    this.salesOrderService.shipOrder(id).subscribe({
      next: () => {
        this.toast.success('Shipped', 'Carrier dispatched, inventory deducted, and SALES_FULFILLMENT logged!');
        this.loadOrders();
      },
      error: (err) => this.toast.error('Error', err?.error?.message || 'Failed to ship order.')
    });
  }

  deliver(id: number): void {
    this.salesOrderService.deliverOrder(id).subscribe({
      next: () => {
        this.toast.success('Delivered', 'Proof of delivery confirmed.');
        this.loadOrders();
      },
      error: (err) => this.toast.error('Error', err?.error?.message || 'Failed to deliver order.')
    });
  }

  cancel(id: number): void {
    if (confirm('Cancel this sales order and release reserved stock?')) {
      this.salesOrderService.cancelOrder(id).subscribe({
        next: () => {
          this.toast.info('Cancelled', 'Order cancelled and stock reservation released.');
          this.loadOrders();
        },
        error: (err) => this.toast.error('Error', err?.error?.message || 'Failed to cancel order.')
      });
    }
  }

  getStepClass(status: SalesOrderStatus, step: SalesOrderStatus): string {
    const orderProgression: SalesOrderStatus[] = [
      'PENDING',
      'ALLOCATED',
      'PICKED',
      'PACKED',
      'SHIPPED',
      'DELIVERED'
    ];
    const currentIndex = orderProgression.indexOf(status);
    const stepIndex = orderProgression.indexOf(step);

    if (status === 'CANCELLED') return 'text-slate-400 line-through';
    if (stepIndex <= currentIndex) return 'text-emerald-700 font-semibold';
    return 'text-slate-400';
  }
}
