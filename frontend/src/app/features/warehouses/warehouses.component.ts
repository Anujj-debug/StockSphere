import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WarehouseService } from '../../core/services/warehouse.service';
import { ToastService } from '../../core/services/toast.service';
import { Warehouse, WarehouseLocation, WarehouseType } from '../../core/models/warehouse.model';
import { IconComponent } from '../../shared/components/icons.component';
import { ModalComponent } from '../../shared/components/modal.component';

@Component({
  selector: 'app-warehouses',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, ModalComponent],
  template: `
    <div class="space-y-6 animate-fade-in">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            Multi-Warehouse Network & Bin Storage
          </h2>
          <p class="text-xs text-slate-500 mt-0.5">
            Central distribution centers, regional hubs, retail backrooms, and precise bin-level storage coordinates.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            (click)="openWarehouseModal()"
            class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium shadow-sm transition-colors"
          >
            <app-icon name="plus" class="w-3.5 h-3.5"></app-icon>
            <span>Add Facility</span>
          </button>
        </div>
      </div>

      <!-- Facility Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        @for (wh of warehouses(); track wh.id) {
          <div
            (click)="selectWarehouse(wh)"
            class="p-4 rounded-xl bg-white border transition-all cursor-pointer flex flex-col justify-between shadow-sm"
            [ngClass]="selectedWarehouse()?.id === wh.id ? 'border-slate-900 ring-2 ring-slate-900/10 bg-slate-50/50' : 'border-slate-200 hover:border-slate-300'"
          >
            <div>
              <div class="flex items-center justify-between">
                <span class="font-mono text-xs font-semibold text-slate-900">{{ wh.code }}</span>
                <span
                  class="px-2 py-0.5 rounded text-[10px] font-medium uppercase border"
                  [ngClass]="{
                    'bg-purple-50 text-purple-700 border-purple-200': wh.type === 'CENTRAL_DC',
                    'bg-blue-50 text-blue-700 border-blue-200': wh.type === 'REGIONAL_HUB',
                    'bg-emerald-50 text-emerald-700 border-emerald-200': wh.type === 'RETAIL_BACKROOM'
                  }"
                >
                  {{ formatType(wh.type) }}
                </span>
              </div>

              <h4 class="text-sm font-semibold text-slate-900 mt-2">{{ wh.name }}</h4>

              <div class="mt-2 text-xs text-slate-500 space-y-1">
                <div class="text-slate-700 font-medium">{{ wh.city }}, {{ wh.state }} {{ wh.postalCode }}</div>
                <div class="text-slate-500 text-[11px]">{{ wh.addressLine || 'Address not listed' }}</div>
                <div class="text-[11px] text-slate-400">Phone: {{ wh.contactPhone || 'N/A' }}</div>
              </div>
            </div>

            <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span class="text-xs text-slate-500">
                Cap: <strong class="text-slate-900">{{ wh.capacityUnits ? (wh.capacityUnits | number) : '50,000' }}</strong> units
              </span>
              <div class="flex items-center gap-1.5">
                <button
                  type="button"
                  (click)="editWarehouse(wh, $event)"
                  class="p-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors shadow-xs"
                  title="Edit Facility"
                >
                  <app-icon name="edit" class="w-3.5 h-3.5"></app-icon>
                </button>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Storage Bin Topology Explorer for Selected Warehouse -->
      @if (selectedWarehouse()) {
        <div class="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-xs font-semibold border border-slate-200">
                  {{ selectedWarehouse()!.code }}
                </span>
                <h3 class="text-base font-bold text-slate-900">{{ selectedWarehouse()!.name }} &mdash; Bin Locations</h3>
              </div>
              <p class="text-xs text-slate-500 mt-1">
                Bin-level storage indexing (Zone, Aisle, Rack, Shelf, Bin) with barcode scanning verification.
              </p>
            </div>

            <button
              type="button"
              (click)="openLocationModal()"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors shadow-sm shrink-0"
            >
              <app-icon name="plus" class="w-3.5 h-3.5"></app-icon>
              <span>Add Bin Coordinate</span>
            </button>
          </div>

          <!-- Locations Table -->
          <div class="overflow-x-auto rounded-lg border border-slate-200">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th class="py-2.5 px-4">Zone</th>
                  <th class="py-2.5 px-4">Aisle</th>
                  <th class="py-2.5 px-4">Rack</th>
                  <th class="py-2.5 px-4">Shelf</th>
                  <th class="py-2.5 px-4">Bin Coordinate</th>
                  <th class="py-2.5 px-4">Barcode Tag</th>
                  <th class="py-2.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-slate-700">
                @for (loc of locations(); track loc.id) {
                  <tr class="hover:bg-slate-50/75 transition-colors">
                    <td class="py-2.5 px-4 font-semibold text-slate-900">{{ loc.zone }}</td>
                    <td class="py-2.5 px-4 font-mono text-slate-700">{{ loc.aisle || '-' }}</td>
                    <td class="py-2.5 px-4 font-mono">{{ loc.rack || '-' }}</td>
                    <td class="py-2.5 px-4 font-mono">{{ loc.shelf || '-' }}</td>
                    <td class="py-2.5 px-4 font-mono font-semibold text-slate-900">{{ loc.bin || '-' }}</td>
                    <td class="py-2.5 px-4 font-mono text-slate-500">{{ loc.barcode || 'N/A' }}</td>
                    <td class="py-2.5 px-4 text-center">
                      <span class="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Operational
                      </span>
                    </td>
                  </tr>
                }
                @if (locations().length === 0) {
                  <tr>
                    <td colspan="7" class="text-center py-8 text-slate-500">
                      No bin locations defined for this warehouse yet. Click "Add Bin Coordinate" to register storage racks.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- MODAL: ADD / EDIT WAREHOUSE -->
      <app-modal
        [isOpen]="isWarehouseModalOpen()"
        [title]="editingWarehouseId ? 'Edit Facility' : 'Register New Facility'"
        icon="warehouse"
        (close)="isWarehouseModalOpen.set(false)"
      >
        <form (ngSubmit)="saveWarehouse()" class="space-y-4 text-xs">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-700 font-medium mb-1">Facility Code *</label>
              <input
                type="text"
                [(ngModel)]="warehouseForm.code"
                name="whCode"
                required
                placeholder="e.g. WH-SOUTH-01"
                class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>
            <div>
              <label class="block text-slate-700 font-medium mb-1">Facility Name *</label>
              <input
                type="text"
                [(ngModel)]="warehouseForm.name"
                name="whName"
                required
                placeholder="e.g. Dallas Southern Hub"
                class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-700 font-medium mb-1">Facility Topology *</label>
              <select
                [(ngModel)]="warehouseForm.type"
                name="whType"
                required
                class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
              >
                <option value="CENTRAL_DC">Central DC</option>
                <option value="REGIONAL_HUB">Regional Hub</option>
                <option value="RETAIL_BACKROOM">Retail Backroom</option>
              </select>
            </div>
            <div>
              <label class="block text-slate-700 font-medium mb-1">Capacity Units</label>
              <input
                type="number"
                [(ngModel)]="warehouseForm.capacityUnits"
                name="whCapacity"
                class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label class="block text-slate-700 font-medium mb-1">Street Address</label>
            <input
              type="text"
              [(ngModel)]="warehouseForm.addressLine"
              name="whAddress"
              placeholder="e.g. 450 Logistics Blvd"
              class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
            />
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="block text-slate-700 font-medium mb-1">City</label>
              <input
                type="text"
                [(ngModel)]="warehouseForm.city"
                name="whCity"
                placeholder="Dallas"
                class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>
            <div>
              <label class="block text-slate-700 font-medium mb-1">State / Province</label>
              <input
                type="text"
                [(ngModel)]="warehouseForm.state"
                name="whState"
                placeholder="TX"
                class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>
            <div>
              <label class="block text-slate-700 font-medium mb-1">Postal Code</label>
              <input
                type="text"
                [(ngModel)]="warehouseForm.postalCode"
                name="whZip"
                placeholder="75001"
                class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-700 font-medium mb-1">Country</label>
              <input
                type="text"
                [(ngModel)]="warehouseForm.country"
                name="whCountry"
                placeholder="USA"
                class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>
            <div>
              <label class="block text-slate-700 font-medium mb-1">Contact Phone</label>
              <input
                type="text"
                [(ngModel)]="warehouseForm.contactPhone"
                name="whPhone"
                placeholder="+1 214-555-0199"
                class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>
          </div>

          <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              (click)="isWarehouseModalOpen.set(false)"
              class="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors shadow-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors shadow-sm"
            >
              Save Facility
            </button>
          </div>
        </form>
      </app-modal>

      <!-- MODAL: ADD BIN LOCATION -->
      <app-modal
        [isOpen]="isLocationModalOpen()"
        title="Add Storage Bin Coordinate"
        icon="building"
        (close)="isLocationModalOpen.set(false)"
      >
        <form (ngSubmit)="saveLocation()" class="space-y-4 text-xs">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-700 font-medium mb-1">Zone *</label>
              <input
                type="text"
                [(ngModel)]="locationForm.zone"
                name="locZone"
                required
                placeholder="e.g. Zone A"
                class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>
            <div>
              <label class="block text-slate-700 font-medium mb-1">Aisle</label>
              <input
                type="text"
                [(ngModel)]="locationForm.aisle"
                name="locAisle"
                placeholder="e.g. Aisle 03"
                class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="block text-slate-700 font-medium mb-1">Rack</label>
              <input
                type="text"
                [(ngModel)]="locationForm.rack"
                name="locRack"
                placeholder="e.g. Rack 02"
                class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>
            <div>
              <label class="block text-slate-700 font-medium mb-1">Shelf</label>
              <input
                type="text"
                [(ngModel)]="locationForm.shelf"
                name="locShelf"
                placeholder="e.g. Level 04"
                class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>
            <div>
              <label class="block text-slate-700 font-medium mb-1">Bin Coordinate</label>
              <input
                type="text"
                [(ngModel)]="locationForm.bin"
                name="locBin"
                placeholder="e.g. Bin B-08"
                class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label class="block text-slate-700 font-medium mb-1">Barcode Tag</label>
            <input
              type="text"
              [(ngModel)]="locationForm.barcode"
              name="locBarcode"
              placeholder="e.g. LOC-WH1-Z-A-03-02-04-08"
              class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-slate-900 focus:bg-white"
            />
          </div>

          <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              (click)="isLocationModalOpen.set(false)"
              class="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors shadow-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors shadow-sm"
            >
              Register Bin
            </button>
          </div>
        </form>
      </app-modal>
    </div>
  `
})
export class WarehousesComponent implements OnInit {
  private readonly warehouseService = inject(WarehouseService);
  private readonly toast = inject(ToastService);

  readonly warehouses = signal<Warehouse[]>([]);
  readonly selectedWarehouse = signal<Warehouse | null>(null);
  readonly locations = signal<WarehouseLocation[]>([]);

  readonly isWarehouseModalOpen = signal(false);
  readonly isLocationModalOpen = signal(false);
  editingWarehouseId: number | null = null;

  warehouseForm: Partial<Warehouse> = {
    code: '',
    name: '',
    type: 'REGIONAL_HUB',
    addressLine: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'USA',
    contactPhone: '',
    capacityUnits: 40000,
    active: true
  };

  locationForm: Partial<WarehouseLocation> = {
    zone: '',
    aisle: '',
    rack: '',
    shelf: '',
    bin: '',
    barcode: '',
    active: true
  };

  ngOnInit(): void {
    this.loadWarehouses();
  }

  loadWarehouses(): void {
    this.warehouseService.getWarehouses().subscribe({
      next: (whs) => {
        this.warehouses.set(whs);
        if (whs.length > 0 && !this.selectedWarehouse()) {
          this.selectWarehouse(whs[0]);
        }
      },
      error: () => this.toast.error('Error', 'Failed to load warehouses.')
    });
  }

  selectWarehouse(wh: Warehouse): void {
    this.selectedWarehouse.set(wh);
    if (wh.id) {
      this.warehouseService.getLocations(wh.id).subscribe({
        next: (locs) => this.locations.set(locs),
        error: () => {}
      });
    }
  }

  formatType(type?: WarehouseType): string {
    if (!type) return 'HUB';
    switch (type) {
      case 'CENTRAL_DC': return 'Central DC';
      case 'REGIONAL_HUB': return 'Regional Hub';
      case 'RETAIL_BACKROOM': return 'Retail Backroom';
      default: return type;
    }
  }

  openWarehouseModal(): void {
    this.editingWarehouseId = null;
    this.warehouseForm = {
      code: '',
      name: '',
      type: 'REGIONAL_HUB',
      addressLine: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'USA',
      contactPhone: '',
      capacityUnits: 40000,
      active: true
    };
    this.isWarehouseModalOpen.set(true);
  }

  editWarehouse(wh: Warehouse, event: Event): void {
    event.stopPropagation();
    this.editingWarehouseId = wh.id || null;
    this.warehouseForm = { ...wh };
    this.isWarehouseModalOpen.set(true);
  }

  saveWarehouse(): void {
    if (this.editingWarehouseId) {
      this.warehouseService.updateWarehouse(this.editingWarehouseId, this.warehouseForm).subscribe({
        next: (updated) => {
          this.toast.success('Facility Updated', `Warehouse ${updated.name} saved.`);
          this.isWarehouseModalOpen.set(false);
          this.loadWarehouses();
        },
        error: () => this.toast.error('Error', 'Failed to update warehouse.')
      });
    } else {
      this.warehouseService.createWarehouse(this.warehouseForm).subscribe({
        next: (created) => {
          this.toast.success('Facility Created', `Warehouse ${created.name} registered.`);
          this.isWarehouseModalOpen.set(false);
          this.loadWarehouses();
        },
        error: () => this.toast.error('Error', 'Failed to register warehouse.')
      });
    }
  }

  openLocationModal(): void {
    this.locationForm = {
      zone: 'Zone A',
      aisle: 'Aisle 01',
      rack: 'Rack 01',
      shelf: 'Level 01',
      bin: 'Bin 01',
      barcode: `LOC-${this.selectedWarehouse()?.code}-A-01`,
      active: true
    };
    this.isLocationModalOpen.set(true);
  }

  saveLocation(): void {
    const wh = this.selectedWarehouse();
    if (!wh || !wh.id) return;

    this.warehouseService.createLocation(wh.id, this.locationForm).subscribe({
      next: () => {
        this.toast.success('Bin Created', 'Storage bin coordinate registered.');
        this.isLocationModalOpen.set(false);
        this.selectWarehouse(wh);
      },
      error: () => this.toast.error('Error', 'Failed to add bin coordinate.')
    });
  }
}
