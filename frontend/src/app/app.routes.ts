import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ProductsComponent } from './features/products/products.component';
import { WarehousesComponent } from './features/warehouses/warehouses.component';
import { InventoryComponent } from './features/inventory/inventory.component';
import { TransfersComponent } from './features/transfers/transfers.component';
import { AdjustmentsComponent } from './features/adjustments/adjustments.component';
import { ProcurementComponent } from './features/procurement/procurement.component';
import { SalesOrdersComponent } from './features/sales-orders/sales-orders.component';
import { AgileHubComponent } from './features/agile-hub/agile-hub.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent, title: 'StockSphere — Executive Dashboard' },
  { path: 'products', component: ProductsComponent, title: 'StockSphere — Products & Taxonomy' },
  { path: 'warehouses', component: WarehousesComponent, title: 'StockSphere — Multi-Warehouse Network' },
  { path: 'inventory', component: InventoryComponent, title: 'StockSphere — Real-Time Stock & Ledger' },
  { path: 'transfers', component: TransfersComponent, title: 'StockSphere — Inter-Warehouse Transfers' },
  { path: 'adjustments', component: AdjustmentsComponent, title: 'StockSphere — Cycle Counts & Audits' },
  { path: 'procurement', component: ProcurementComponent, title: 'StockSphere — Procurement (PO & GRN)' },
  { path: 'sales-orders', component: SalesOrdersComponent, title: 'StockSphere — Retail Sales Orders' },
  { path: 'agile', component: AgileHubComponent, title: 'StockSphere — Agile Traceability Matrix' },
  { path: '**', redirectTo: 'dashboard' }
];
