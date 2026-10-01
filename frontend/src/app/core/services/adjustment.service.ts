import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StockAdjustmentRequest, StockAdjustmentResponse } from '../models/adjustment.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AdjustmentService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(ApiService);

  getAllAdjustments(): Observable<StockAdjustmentResponse[]> {
    return this.http.get<StockAdjustmentResponse[]>(this.api.url('/adjustments'));
  }

  getAdjustmentById(id: number): Observable<StockAdjustmentResponse> {
    return this.http.get<StockAdjustmentResponse>(this.api.url(`/adjustments/${id}`));
  }

  getAdjustmentsByWarehouse(warehouseId: number): Observable<StockAdjustmentResponse[]> {
    return this.http.get<StockAdjustmentResponse[]>(this.api.url(`/adjustments/warehouse/${warehouseId}`));
  }

  createAdjustment(dto: StockAdjustmentRequest): Observable<StockAdjustmentResponse> {
    return this.http.post<StockAdjustmentResponse>(this.api.url('/adjustments'), dto);
  }
}
