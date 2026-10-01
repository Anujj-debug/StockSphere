import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, Category, Brand, ProductStatus } from '../models/product.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(ApiService);

  // Products
  getProducts(filters?: { categoryId?: number; brandId?: number; status?: ProductStatus; search?: string }): Observable<Product[]> {
    let params = new HttpParams();
    if (filters?.categoryId) params = params.set('categoryId', filters.categoryId.toString());
    if (filters?.brandId) params = params.set('brandId', filters.brandId.toString());
    if (filters?.status) params = params.set('status', filters.status);
    if (filters?.search) params = params.set('search', filters.search);

    return this.http.get<Product[]>(this.api.url('/products'), { params });
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(this.api.url(`/products/${id}`));
  }

  getProductBySku(sku: string): Observable<Product> {
    return this.http.get<Product>(this.api.url(`/products/sku/${sku}`));
  }

  createProduct(product: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(this.api.url('/products'), product);
  }

  updateProduct(id: number, product: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(this.api.url(`/products/${id}`), product);
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(this.api.url(`/products/${id}`));
  }

  // Categories
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.api.url('/categories'));
  }

  getCategoryById(id: number): Observable<Category> {
    return this.http.get<Category>(this.api.url(`/categories/${id}`));
  }

  createCategory(category: Partial<Category>): Observable<Category> {
    return this.http.post<Category>(this.api.url('/categories'), category);
  }

  updateCategory(id: number, category: Partial<Category>): Observable<Category> {
    return this.http.put<Category>(this.api.url(`/categories/${id}`), category);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(this.api.url(`/categories/${id}`));
  }

  // Brands
  getBrands(): Observable<Brand[]> {
    return this.http.get<Brand[]>(this.api.url('/brands'));
  }

  getBrandById(id: number): Observable<Brand> {
    return this.http.get<Brand>(this.api.url(`/brands/${id}`));
  }

  createBrand(brand: Partial<Brand>): Observable<Brand> {
    return this.http.post<Brand>(this.api.url('/brands'), brand);
  }

  updateBrand(id: number, brand: Partial<Brand>): Observable<Brand> {
    return this.http.put<Brand>(this.api.url(`/brands/${id}`), brand);
  }

  deleteBrand(id: number): Observable<void> {
    return this.http.delete<void>(this.api.url(`/brands/${id}`));
  }
}
