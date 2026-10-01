import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Stock, InventoryTransaction, StockThresholdUpdate } from '../models/inventory.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(ApiService);

  getAllStocks(): Observable<Stock[]> {
    return this.http.get<Stock[]>(this.api.url('/inventory'));
  }

  getStocksByWarehouse(warehouseId: number): Observable<Stock[]> {
    return this.http.get<Stock[]>(this.api.url(`/inventory/warehouse/${warehouseId}`));
  }

  getStocksByProduct(productId: number): Observable<Stock[]> {
    return this.http.get<Stock[]>(this.api.url(`/inventory/product/${productId}`));
  }

  getStock(warehouseId: number, productId: number): Observable<Stock> {
    const params = new HttpParams()
      .set('warehouseId', warehouseId.toString())
      .set('productId', productId.toString());
    return this.http.get<Stock>(this.api.url('/inventory/stock'), { params });
  }

  getLowStockItems(warehouseId?: number): Observable<Stock[]> {
    let params = new HttpParams();
    if (warehouseId) params = params.set('warehouseId', warehouseId.toString());
    return this.http.get<Stock[]>(this.api.url('/inventory/low-stock'), { params });
  }

  getOutOfStockItems(): Observable<Stock[]> {
    return this.http.get<Stock[]>(this.api.url('/inventory/out-of-stock'));
  }

  getRecentTransactions(): Observable<InventoryTransaction[]> {
    return this.http.get<InventoryTransaction[]>(this.api.url('/inventory/transactions'));
  }

  getTransactionsByProduct(productId: number): Observable<InventoryTransaction[]> {
    return this.http.get<InventoryTransaction[]>(this.api.url(`/inventory/transactions/product/${productId}`));
  }

  getTransactionsByWarehouse(warehouseId: number): Observable<InventoryTransaction[]> {
    return this.http.get<InventoryTransaction[]>(this.api.url(`/inventory/transactions/warehouse/${warehouseId}`));
  }

  updateStockThresholds(update: StockThresholdUpdate): Observable<Stock> {
    let params = new HttpParams()
      .set('warehouseId', update.warehouseId.toString())
      .set('productId', update.productId.toString());

    if (update.minLevel !== undefined) params = params.set('minLevel', update.minLevel.toString());
    if (update.reorderPoint !== undefined) params = params.set('reorderPoint', update.reorderPoint.toString());
    if (update.maxLevel !== undefined) params = params.set('maxLevel', update.maxLevel.toString());

    return this.http.put<Stock>(this.api.url('/inventory/thresholds'), null, { params });
  }
}
