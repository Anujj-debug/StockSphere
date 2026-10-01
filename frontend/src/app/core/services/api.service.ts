import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly platformId = inject(PLATFORM_ID);

  getBaseUrl(): string {
    if (typeof window !== 'undefined' && isPlatformBrowser(this.platformId)) {
      // In dev running on Angular port 4200, talk to backend port 8080
      if (window.location.port === '4200') {
        return 'http://localhost:8080/api';
      }
      // If deployed or in Docker behind Nginx
      return '/api';
    }
    return environment.apiUrl || 'http://localhost:8080/api';
  }

  url(endpoint: string): string {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${this.getBaseUrl()}${cleanEndpoint}`;
  }
}
