import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Supplier, SupplierProduct } from '../models/supplier.model';
import {
  GoodsReceipt,
  PurchaseOrderRequest,
  PurchaseOrderResponse,
  PurchaseOrderStatus
} from '../models/purchase-order.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ProcurementService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(ApiService);

  // Suppliers
  getAllSuppliers(): Observable<Supplier[]> {
    return this.http.get<Supplier[]>(this.api.url('/suppliers'));
  }

  getSupplierById(id: number): Observable<Supplier> {
    return this.http.get<Supplier>(this.api.url(`/suppliers/${id}`));
  }

  createSupplier(dto: Partial<Supplier>): Observable<Supplier> {
    return this.http.post<Supplier>(this.api.url('/suppliers'), dto);
  }

  updateSupplier(id: number, dto: Partial<Supplier>): Observable<Supplier> {
    return this.http.put<Supplier>(this.api.url(`/suppliers/${id}`), dto);
  }

  deleteSupplier(id: number): Observable<void> {
    return this.http.delete<void>(this.api.url(`/suppliers/${id}`));
  }

  getSupplierProducts(supplierId: number): Observable<SupplierProduct[]> {
    return this.http.get<SupplierProduct[]>(this.api.url(`/suppliers/${supplierId}/products`));
  }

  linkProductToSupplier(
    supplierId: number,
    data: {
      productId: number;
      supplierSku?: string;
      agreedCost?: number;
      minOrderQty?: number;
      leadTimeDays?: number;
    }
  ): Observable<SupplierProduct> {
    let params = new HttpParams().set('productId', data.productId.toString());
    if (data.supplierSku) params = params.set('supplierSku', data.supplierSku);
    if (data.agreedCost !== undefined) params = params.set('agreedCost', data.agreedCost.toString());
    if (data.minOrderQty !== undefined) params = params.set('minOrderQty', data.minOrderQty.toString());
    if (data.leadTimeDays !== undefined) params = params.set('leadTimeDays', data.leadTimeDays.toString());

    return this.http.post<SupplierProduct>(this.api.url(`/suppliers/${supplierId}/products`), null, { params });
  }

  // Purchase Orders
  getAllPurchaseOrders(status?: PurchaseOrderStatus): Observable<PurchaseOrderResponse[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<PurchaseOrderResponse[]>(this.api.url('/purchase-orders'), { params });
  }

  getPurchaseOrderById(id: number): Observable<PurchaseOrderResponse> {
    return this.http.get<PurchaseOrderResponse>(this.api.url(`/purchase-orders/${id}`));
  }

  createPurchaseOrder(dto: PurchaseOrderRequest): Observable<PurchaseOrderResponse> {
    return this.http.post<PurchaseOrderResponse>(this.api.url('/purchase-orders'), dto);
  }

  submitPurchaseOrder(id: number): Observable<PurchaseOrderResponse> {
    return this.http.put<PurchaseOrderResponse>(this.api.url(`/purchase-orders/${id}/submit`), null);
  }

  approvePurchaseOrder(id: number): Observable<PurchaseOrderResponse> {
    return this.http.put<PurchaseOrderResponse>(this.api.url(`/purchase-orders/${id}/approve`), null);
  }

  receiveGoods(id: number, receipt: GoodsReceipt): Observable<PurchaseOrderResponse> {
    return this.http.post<PurchaseOrderResponse>(this.api.url(`/purchase-orders/${id}/receive-goods`), receipt);
  }

  cancelPurchaseOrder(id: number): Observable<PurchaseOrderResponse> {
    return this.http.put<PurchaseOrderResponse>(this.api.url(`/purchase-orders/${id}/cancel`), null);
  }
}
