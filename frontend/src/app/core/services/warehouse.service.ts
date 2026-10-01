import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Warehouse, WarehouseLocation } from '../models/warehouse.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class WarehouseService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(ApiService);

  getWarehouses(): Observable<Warehouse[]> {
    return this.http.get<Warehouse[]>(this.api.url('/warehouses'));
  }

  getWarehouseById(id: number): Observable<Warehouse> {
    return this.http.get<Warehouse>(this.api.url(`/warehouses/${id}`));
  }

  createWarehouse(warehouse: Partial<Warehouse>): Observable<Warehouse> {
    return this.http.post<Warehouse>(this.api.url('/warehouses'), warehouse);
  }

  updateWarehouse(id: number, warehouse: Partial<Warehouse>): Observable<Warehouse> {
    return this.http.put<Warehouse>(this.api.url(`/warehouses/${id}`), warehouse);
  }

  deleteWarehouse(id: number): Observable<void> {
    return this.http.delete<void>(this.api.url(`/warehouses/${id}`));
  }

  getLocations(warehouseId: number): Observable<WarehouseLocation[]> {
    return this.http.get<WarehouseLocation[]>(this.api.url(`/warehouses/${warehouseId}/locations`));
  }

  createLocation(warehouseId: number, location: Partial<WarehouseLocation>): Observable<WarehouseLocation> {
    return this.http.post<WarehouseLocation>(this.api.url(`/warehouses/${warehouseId}/locations`), location);
  }
}
