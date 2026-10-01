import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  StockTransferRequest,
  StockTransferResponse,
  StockTransferStatus
} from '../models/transfer.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class TransferService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(ApiService);

  getAllTransfers(status?: StockTransferStatus): Observable<StockTransferResponse[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<StockTransferResponse[]>(this.api.url('/transfers'), { params });
  }

  getTransferById(id: number): Observable<StockTransferResponse> {
    return this.http.get<StockTransferResponse>(this.api.url(`/transfers/${id}`));
  }

  requestTransfer(dto: StockTransferRequest): Observable<StockTransferResponse> {
    return this.http.post<StockTransferResponse>(this.api.url('/transfers'), dto);
  }

  approveTransfer(id: number, approvedBy?: string): Observable<StockTransferResponse> {
    let params = new HttpParams();
    if (approvedBy) params = params.set('approvedBy', approvedBy);
    return this.http.put<StockTransferResponse>(this.api.url(`/transfers/${id}/approve`), null, { params });
  }

  dispatchTransfer(id: number): Observable<StockTransferResponse> {
    return this.http.put<StockTransferResponse>(this.api.url(`/transfers/${id}/dispatch`), null);
  }

  receiveTransfer(id: number): Observable<StockTransferResponse> {
    return this.http.put<StockTransferResponse>(this.api.url(`/transfers/${id}/receive`), null);
  }

  cancelTransfer(id: number): Observable<StockTransferResponse> {
    return this.http.put<StockTransferResponse>(this.api.url(`/transfers/${id}/cancel`), null);
  }
}
