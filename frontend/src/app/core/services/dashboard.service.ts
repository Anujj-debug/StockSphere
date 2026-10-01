import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardSummary } from '../models/dashboard.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(ApiService);

  getSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(this.api.url('/dashboard/summary'));
  }
}
