import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  SalesOrderRequest,
  SalesOrderResponse,
  SalesOrderStatus
} from '../models/sales-order.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class SalesOrderService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(ApiService);

  getAllSalesOrders(status?: SalesOrderStatus): Observable<SalesOrderResponse[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<SalesOrderResponse[]>(this.api.url('/sales-orders'), { params });
  }

  getSalesOrderById(id: number): Observable<SalesOrderResponse> {
    return this.http.get<SalesOrderResponse>(this.api.url(`/sales-orders/${id}`));
  }

  createSalesOrder(dto: SalesOrderRequest): Observable<SalesOrderResponse> {
    return this.http.post<SalesOrderResponse>(this.api.url('/sales-orders'), dto);
  }

  allocateOrder(id: number): Observable<SalesOrderResponse> {
    return this.http.put<SalesOrderResponse>(this.api.url(`/sales-orders/${id}/allocate`), null);
  }

  pickOrder(id: number): Observable<SalesOrderResponse> {
    return this.http.put<SalesOrderResponse>(this.api.url(`/sales-orders/${id}/pick`), null);
  }

  packOrder(id: number): Observable<SalesOrderResponse> {
    return this.http.put<SalesOrderResponse>(this.api.url(`/sales-orders/${id}/pack`), null);
  }

  shipOrder(id: number): Observable<SalesOrderResponse> {
    return this.http.put<SalesOrderResponse>(this.api.url(`/sales-orders/${id}/ship`), null);
  }

  deliverOrder(id: number): Observable<SalesOrderResponse> {
    return this.http.put<SalesOrderResponse>(this.api.url(`/sales-orders/${id}/deliver`), null);
  }

  cancelOrder(id: number): Observable<SalesOrderResponse> {
    return this.http.put<SalesOrderResponse>(this.api.url(`/sales-orders/${id}/cancel`), null);
  }
}
