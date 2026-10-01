import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { ToastService } from '../../core/services/toast.service';
import { Product, Category, Brand, ProductStatus } from '../../core/models/product.model';
import { IconComponent } from '../../shared/components/icons.component';
import { ModalComponent } from '../../shared/components/modal.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, ModalComponent],
  template: `
    <div class="space-y-6 animate-fade-in">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            Product Catalog & Taxonomy
          </h2>
          <p class="text-xs text-slate-500 mt-0.5">
            Master SKU inventory, retail pricing, hierarchical categories, and manufacturer brands.
          </p>
        </div>

        <div class="flex items-center gap-2">
          @if (activeTab() === 'products') {
            <button
              type="button"
              (click)="openProductModal()"
              class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium shadow-sm transition-colors"
            >
              <app-icon name="plus" class="w-3.5 h-3.5"></app-icon>
              <span>Add Product SKU</span>
            </button>
          } @else if (activeTab() === 'categories') {
            <button
              type="button"
              (click)="openCategoryModal()"
              class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium shadow-sm transition-colors"
            >
              <app-icon name="plus" class="w-3.5 h-3.5"></app-icon>
              <span>New Category</span>
            </button>
          } @else {
            <button
              type="button"
              (click)="openBrandModal()"
              class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium shadow-sm transition-colors"
            >
              <app-icon name="plus" class="w-3.5 h-3.5"></app-icon>
              <span>New Brand</span>
            </button>
          }
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="flex items-center gap-1 border-b border-slate-200">
        <button
          type="button"
          (click)="activeTab.set('products')"
          class="flex items-center gap-2 px-3.5 py-2 text-xs font-medium border-b-2 -mb-px transition-colors"
          [ngClass]="activeTab() === 'products' ? 'border-slate-900 text-slate-900 font-semibold' : 'border-transparent text-slate-500 hover:text-slate-900'"
        >
          <app-icon name="box" class="w-3.5 h-3.5"></app-icon>
          <span>Products ({{ products().length }})</span>
        </button>

        <button
          type="button"
          (click)="activeTab.set('categories')"
          class="flex items-center gap-2 px-3.5 py-2 text-xs font-medium border-b-2 -mb-px transition-colors"
          [ngClass]="activeTab() === 'categories' ? 'border-slate-900 text-slate-900 font-semibold' : 'border-transparent text-slate-500 hover:text-slate-900'"
        >
          <app-icon name="tag" class="w-3.5 h-3.5"></app-icon>
          <span>Categories ({{ categories().length }})</span>
        </button>

        <button
          type="button"
          (click)="activeTab.set('brands')"
          class="flex items-center gap-2 px-3.5 py-2 text-xs font-medium border-b-2 -mb-px transition-colors"
          [ngClass]="activeTab() === 'brands' ? 'border-slate-900 text-slate-900 font-semibold' : 'border-transparent text-slate-500 hover:text-slate-900'"
        >
          <app-icon name="building" class="w-3.5 h-3.5"></app-icon>
          <span>Brands ({{ brands().length }})</span>
        </button>
      </div>

      <!-- TAB 1: PRODUCTS MASTER -->
      @if (activeTab() === 'products') {
        <div class="space-y-4">
          <!-- Filters & Search Bar -->
          <div class="p-3 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-wrap items-center gap-3">
            <div class="flex-1 min-w-[220px] relative">
              <app-icon name="search" class="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"></app-icon>
              <input
                type="text"
                [(ngModel)]="searchQuery"
                (ngModelChange)="applyProductFilters()"
                placeholder="Search products by SKU, name, or description..."
                class="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
              />
            </div>

            <!-- Category Filter -->
            <select
              [(ngModel)]="filterCategory"
              (ngModelChange)="applyProductFilters()"
              class="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-slate-400 focus:bg-white"
            >
              <option [ngValue]="null">All Categories</option>
              @for (cat of categories(); track cat.id) {
                <option [ngValue]="cat.id">{{ cat.name }}</option>
              }
            </select>

            <!-- Brand Filter -->
            <select
              [(ngModel)]="filterBrand"
              (ngModelChange)="applyProductFilters()"
              class="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-slate-400 focus:bg-white"
            >
              <option [ngValue]="null">All Brands</option>
              @for (brand of brands(); track brand.id) {
                <option [ngValue]="brand.id">{{ brand.name }}</option>
              }
            </select>

            <!-- Status Filter -->
            <select
              [(ngModel)]="filterStatus"
              (ngModelChange)="applyProductFilters()"
              class="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-slate-400 focus:bg-white"
            >
              <option [ngValue]="null">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="OUT_OF_STOCK">OUT_OF_STOCK</option>
              <option value="DISCONTINUED">DISCONTINUED</option>
            </select>
          </div>

          <!-- Product Table -->
          <div class="rounded-xl bg-white border border-slate-200 overflow-hidden shadow-sm">
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead class="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th class="py-2.5 px-4">SKU / Barcode</th>
                    <th class="py-2.5 px-4">Product Name</th>
                    <th class="py-2.5 px-4">Category & Brand</th>
                    <th class="py-2.5 px-4 text-right">Retail Price</th>
                    <th class="py-2.5 px-4 text-right">Unit Cost</th>
                    <th class="py-2.5 px-4 text-center">Safety Stock</th>
                    <th class="py-2.5 px-4 text-center">Status</th>
                    <th class="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-slate-700">
                  @for (prod of filteredProducts(); track prod.id) {
                    <tr class="hover:bg-slate-50/75 transition-colors">
                      <td class="py-2.5 px-4">
                        <div class="font-mono font-semibold text-slate-900">{{ prod.sku }}</div>
                        <div class="text-[10px] text-slate-400 font-mono">{{ prod.barcode || 'NO_BARCODE' }}</div>
                      </td>
                      <td class="py-2.5 px-4">
                        <div class="font-medium text-slate-900">{{ prod.name }}</div>
                        <div class="text-[11px] text-slate-500 line-clamp-1">{{ prod.description }}</div>
                      </td>
                      <td class="py-2.5 px-4">
                        <div class="text-slate-800 font-medium">{{ prod.categoryName || 'General' }}</div>
                        <div class="text-[10px] text-slate-500">{{ prod.brandName || 'Brand' }}</div>
                      </td>
                      <td class="py-2.5 px-4 text-right font-mono font-semibold text-emerald-700">
                        \${{ prod.unitPrice | number:'1.2-2' }}
                      </td>
                      <td class="py-2.5 px-4 text-right font-mono text-slate-600">
                        \${{ prod.costPrice | number:'1.2-2' }}
                      </td>
                      <td class="py-2.5 px-4 text-center font-mono">
                        <span class="text-slate-700">{{ prod.minSafetyStock || 0 }}</span>
                        <span class="text-slate-400 text-[10px] ml-1">(R: {{ prod.reorderPoint || 0 }})</span>
                      </td>
                      <td class="py-2.5 px-4 text-center">
                        <span
                          class="px-2 py-0.5 rounded text-[10px] font-medium border"
                          [ngClass]="{
                            'bg-emerald-50 text-emerald-700 border-emerald-200': prod.status === 'ACTIVE',
                            'bg-amber-50 text-amber-700 border-amber-200': prod.status === 'OUT_OF_STOCK',
                            'bg-rose-50 text-rose-700 border-rose-200': prod.status === 'DISCONTINUED'
                          }"
                        >
                          {{ prod.status }}
                        </span>
                      </td>
                      <td class="py-2.5 px-4 text-right">
                        <div class="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            (click)="editProduct(prod)"
                            title="Edit Product"
                            class="p-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors shadow-xs"
                          >
                            <app-icon name="edit" class="w-3.5 h-3.5"></app-icon>
                          </button>
                          <button
                            type="button"
                            (click)="deleteProduct(prod)"
                            title="Deactivate Product"
                            class="p-1 rounded-md border border-slate-200 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition-colors shadow-xs"
                          >
                            <app-icon name="trash" class="w-3.5 h-3.5"></app-icon>
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                  @if (filteredProducts().length === 0) {
                    <tr>
                      <td colspan="8" class="text-center py-10 text-slate-500">
                        No products found matching filters.
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      }

      <!-- TAB 2: CATEGORIES HIERARCHY -->
      @if (activeTab() === 'categories') {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (cat of categories(); track cat.id) {
            <div class="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 shadow-sm transition-all flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between">
                  <span class="font-mono text-xs text-slate-900 font-semibold">{{ cat.code }}</span>
                  <span class="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">Active</span>
                </div>
                <h4 class="text-sm font-semibold text-slate-900 mt-2">{{ cat.name }}</h4>
                <p class="text-xs text-slate-500 mt-1 line-clamp-2">{{ cat.description || 'No description provided.' }}</p>
                @if (cat.parentName) {
                  <div class="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                    <span class="text-slate-400">Parent:</span>
                    <span class="text-slate-700 font-medium">{{ cat.parentName }}</span>
                  </div>
                }
              </div>

              <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  (click)="editCategory(cat)"
                  class="px-2.5 py-1 text-xs text-slate-700 hover:text-slate-900 rounded-md border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-xs"
                >
                  Edit
                </button>
                <button
                  type="button"
                  (click)="deleteCategory(cat)"
                  class="px-2.5 py-1 text-xs text-rose-600 hover:text-rose-700 rounded-md border border-rose-200 bg-white hover:bg-rose-50 transition-colors shadow-xs"
                >
                  Delete
                </button>
              </div>
            </div>
          }
        </div>
      }

      <!-- TAB 3: BRANDS DIRECTORY -->
      @if (activeTab() === 'brands') {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (brand of brands(); track brand.id) {
            <div class="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 shadow-sm transition-all flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between">
                  <span class="font-mono text-xs text-slate-900 font-semibold">{{ brand.code }}</span>
                  <span class="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">Active</span>
                </div>
                <h4 class="text-sm font-semibold text-slate-900 mt-2">{{ brand.name }}</h4>
                <div class="mt-2 text-xs text-slate-500 space-y-1">
                  <div>Country: <span class="text-slate-700 font-medium">{{ brand.country || 'N/A' }}</span></div>
                  <div>Website: <span class="text-slate-600 font-mono text-[11px]">{{ brand.website || 'N/A' }}</span></div>
                </div>
              </div>

              <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  (click)="editBrand(brand)"
                  class="px-2.5 py-1 text-xs text-slate-700 hover:text-slate-900 rounded-md border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-xs"
                >
                  Edit
                </button>
                <button
                  type="button"
                  (click)="deleteBrand(brand)"
                  class="px-2.5 py-1 text-xs text-rose-600 hover:text-rose-700 rounded-md border border-rose-200 bg-white hover:bg-rose-50 transition-colors shadow-xs"
                >
                  Delete
                </button>
              </div>
            </div>
          }
        </div>
      }

      <!-- MODAL: ADD / EDIT PRODUCT -->
      <app-modal
        [isOpen]="isProductModalOpen()"
        [title]="editingProductId ? 'Edit Product SKU' : 'Create New Product SKU'"
        icon="box"
        (close)="isProductModalOpen.set(false)"
      >
        <form (ngSubmit)="saveProduct()" class="space-y-4 text-xs">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-700 font-medium mb-1">SKU Code *</label>
              <input
                type="text"
                [(ngModel)]="productForm.sku"
                name="sku"
                required
                placeholder="e.g. ELEC-PRO-100"
                class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>
            <div>
              <label class="block text-slate-700 font-medium mb-1">Barcode (UPC/EAN)</label>
              <input
                type="text"
                [(ngModel)]="productForm.barcode"
                name="barcode"
                placeholder="e.g. 880912345699"
                class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label class="block text-slate-700 font-medium mb-1">Product Name *</label>
            <input
              type="text"
              [(ngModel)]="productForm.name"
              name="name"
              required
              placeholder="e.g. Ultra Wireless Earbuds Gen 2"
              class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
            />
          </div>

          <div>
            <label class="block text-slate-700 font-medium mb-1">Description</label>
            <textarea
              [(ngModel)]="productForm.description"
              name="description"
              rows="2"
              placeholder="Product technical specifications and catalog description..."
              class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
            ></textarea>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-700 font-medium mb-1">Category *</label>
              <select
                [(ngModel)]="productForm.categoryId"
                name="categoryId"
                required
                class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
              >
                @for (cat of categories(); track cat.id) {
                  <option [value]="cat.id">{{ cat.name }}</option>
                }
              </select>
            </div>
            <div>
              <label class="block text-slate-700 font-medium mb-1">Brand</label>
              <select
                [(ngModel)]="productForm.brandId"
                name="brandId"
                class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
              >
                <option [ngValue]="null">Select Brand</option>
                @for (b of brands(); track b.id) {
                  <option [value]="b.id">{{ b.name }}</option>
                }
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label class="block text-slate-700 font-medium mb-1">Retail Price ($) *</label>
              <input
                type="number"
                step="0.01"
                [(ngModel)]="productForm.unitPrice"
                name="unitPrice"
                required
                class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>
            <div>
              <label class="block text-slate-700 font-medium mb-1">Cost Price ($) *</label>
              <input
                type="number"
                step="0.01"
                [(ngModel)]="productForm.costPrice"
                name="costPrice"
                required
                class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>
            <div>
              <label class="block text-slate-700 font-medium mb-1">Tax Percent (%)</label>
              <input
                type="number"
                step="0.1"
                [(ngModel)]="productForm.taxPercent"
                name="taxPercent"
                class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>
            <div>
              <label class="block text-slate-700 font-medium mb-1">Weight (kg)</label>
              <input
                type="number"
                step="0.01"
                [(ngModel)]="productForm.weightKg"
                name="weightKg"
                class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="block text-slate-700 font-medium mb-1">Min Safety Stock</label>
              <input
                type="number"
                [(ngModel)]="productForm.minSafetyStock"
                name="minSafetyStock"
                class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>
            <div>
              <label class="block text-slate-700 font-medium mb-1">Reorder Point</label>
              <input
                type="number"
                [(ngModel)]="productForm.reorderPoint"
                name="reorderPoint"
                class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>
            <div>
              <label class="block text-slate-700 font-medium mb-1">Status</label>
              <select
                [(ngModel)]="productForm.status"
                name="status"
                class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="OUT_OF_STOCK">OUT_OF_STOCK</option>
                <option value="DISCONTINUED">DISCONTINUED</option>
              </select>
            </div>
          </div>

          <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              (click)="isProductModalOpen.set(false)"
              class="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors shadow-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors shadow-sm"
            >
              {{ editingProductId ? 'Update Product' : 'Create Product (Auto-Init Stock)' }}
            </button>
          </div>
        </form>
      </app-modal>

      <!-- MODAL: ADD / EDIT CATEGORY -->
      <app-modal
        [isOpen]="isCategoryModalOpen()"
        [title]="editingCategoryId ? 'Edit Category' : 'Create Category'"
        icon="tag"
        (close)="isCategoryModalOpen.set(false)"
      >
        <form (ngSubmit)="saveCategory()" class="space-y-4 text-xs">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-700 font-medium mb-1">Category Code *</label>
              <input
                type="text"
                [(ngModel)]="categoryForm.code"
                name="catCode"
                required
                placeholder="e.g. ELEC-AUDIO"
                class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>
            <div>
              <label class="block text-slate-700 font-medium mb-1">Category Name *</label>
              <input
                type="text"
                [(ngModel)]="categoryForm.name"
                name="catName"
                required
                placeholder="e.g. Audio & Headphones"
                class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label class="block text-slate-700 font-medium mb-1">Parent Category</label>
            <select
              [(ngModel)]="categoryForm.parentId"
              name="catParentId"
              class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
            >
              <option [ngValue]="null">None (Top-Level Category)</option>
              @for (cat of categories(); track cat.id) {
                <option [value]="cat.id">{{ cat.name }}</option>
              }
            </select>
          </div>

          <div>
            <label class="block text-slate-700 font-medium mb-1">Description</label>
            <textarea
              [(ngModel)]="categoryForm.description"
              name="catDesc"
              rows="2"
              placeholder="Category scope and hierarchy..."
              class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
            ></textarea>
          </div>

          <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              (click)="isCategoryModalOpen.set(false)"
              class="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors shadow-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors shadow-sm"
            >
              Save Category
            </button>
          </div>
        </form>
      </app-modal>

      <!-- MODAL: ADD / EDIT BRAND -->
      <app-modal
        [isOpen]="isBrandModalOpen()"
        [title]="editingBrandId ? 'Edit Brand' : 'Create Brand'"
        icon="building"
        (close)="isBrandModalOpen.set(false)"
      >
        <form (ngSubmit)="saveBrand()" class="space-y-4 text-xs">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-700 font-medium mb-1">Brand Code *</label>
              <input
                type="text"
                [(ngModel)]="brandForm.code"
                name="brandCode"
                required
                placeholder="e.g. SONY"
                class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>
            <div>
              <label class="block text-slate-700 font-medium mb-1">Brand Name *</label>
              <input
                type="text"
                [(ngModel)]="brandForm.name"
                name="brandName"
                required
                placeholder="e.g. Sony Corporation"
                class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-700 font-medium mb-1">Country</label>
              <input
                type="text"
                [(ngModel)]="brandForm.country"
                name="brandCountry"
                placeholder="e.g. Japan"
                class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>
            <div>
              <label class="block text-slate-700 font-medium mb-1">Website</label>
              <input
                type="text"
                [(ngModel)]="brandForm.website"
                name="brandWebsite"
                placeholder="e.g. https://www.sony.com"
                class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>
          </div>

          <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              (click)="isBrandModalOpen.set(false)"
              class="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors shadow-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors shadow-sm"
            >
              Save Brand
            </button>
          </div>
        </form>
      </app-modal>
    </div>
  `
})
export class ProductsComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly toast = inject(ToastService);

  readonly activeTab = signal<'products' | 'categories' | 'brands'>('products');
  readonly products = signal<Product[]>([]);
  readonly filteredProducts = signal<Product[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly brands = signal<Brand[]>([]);

  // Filters
  searchQuery = '';
  filterCategory: number | null = null;
  filterBrand: number | null = null;
  filterStatus: ProductStatus | null = null;

  // Modals state
  readonly isProductModalOpen = signal(false);
  readonly isCategoryModalOpen = signal(false);
  readonly isBrandModalOpen = signal(false);

  editingProductId: number | null = null;
  editingCategoryId: number | null = null;
  editingBrandId: number | null = null;

  // Forms
  productForm: Partial<Product> = {
    sku: '',
    barcode: '',
    name: '',
    description: '',
    categoryId: 1,
    unitPrice: 0,
    costPrice: 0,
    taxPercent: 5.0,
    weightKg: 0.5,
    minSafetyStock: 10,
    reorderPoint: 20,
    maxStock: 500,
    status: 'ACTIVE'
  };

  categoryForm: Partial<Category> = {
    code: '',
    name: '',
    description: '',
    parentId: null,
    active: true
  };

  brandForm: Partial<Brand> = {
    code: '',
    name: '',
    country: '',
    website: '',
    active: true
  };

  ngOnInit(): void {
    this.loadCatalog();
  }

  loadCatalog(): void {
    this.productService.getProducts().subscribe({
      next: (prods) => {
        this.products.set(prods);
        this.applyProductFilters();
      },
      error: () => this.toast.error('Catalog Error', 'Failed to load products list.')
    });

    this.productService.getCategories().subscribe({
      next: (cats) => this.categories.set(cats),
      error: () => {}
    });

    this.productService.getBrands().subscribe({
      next: (brands) => this.brands.set(brands),
      error: () => {}
    });
  }

  applyProductFilters(): void {
    let result = this.products();
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    }
    if (this.filterCategory) {
      result = result.filter(p => p.categoryId === this.filterCategory);
    }
    if (this.filterBrand) {
      result = result.filter(p => p.brandId === this.filterBrand);
    }
    if (this.filterStatus) {
      result = result.filter(p => p.status === this.filterStatus);
    }
    this.filteredProducts.set(result);
  }

  // Product actions
  openProductModal(): void {
    this.editingProductId = null;
    this.productForm = {
      sku: '',
      barcode: '',
      name: '',
      description: '',
      categoryId: this.categories()[0]?.id || 1,
      brandId: this.brands()[0]?.id,
      unitPrice: 0,
      costPrice: 0,
      taxPercent: 5.0,
      weightKg: 0.5,
      minSafetyStock: 10,
      reorderPoint: 20,
      maxStock: 500,
      status: 'ACTIVE'
    };
    this.isProductModalOpen.set(true);
  }

  editProduct(prod: Product): void {
    this.editingProductId = prod.id || null;
    this.productForm = { ...prod };
    this.isProductModalOpen.set(true);
  }

  saveProduct(): void {
    if (this.editingProductId) {
      this.productService.updateProduct(this.editingProductId, this.productForm).subscribe({
        next: (updated) => {
          this.toast.success('Product Updated', `SKU ${updated.sku} was saved.`);
          this.isProductModalOpen.set(false);
          this.loadCatalog();
        },
        error: (err) => this.toast.error('Update Failed', err?.error?.message || 'Check validation fields.')
      });
    } else {
      this.productService.createProduct(this.productForm).subscribe({
        next: (created) => {
          this.toast.success('Product Created', `SKU ${created.sku} created and auto-initialized across warehouses!`);
          this.isProductModalOpen.set(false);
          this.loadCatalog();
        },
        error: (err) => this.toast.error('Creation Failed', err?.error?.message || 'Check validation fields.')
      });
    }
  }

  deleteProduct(prod: Product): void {
    if (!prod.id) return;
    if (confirm(`Deactivate product SKU "${prod.sku}" (${prod.name})?`)) {
      this.productService.deleteProduct(prod.id).subscribe({
        next: () => {
          this.toast.success('Product Deactivated', `SKU ${prod.sku} discontinued.`);
          this.loadCatalog();
        },
        error: () => this.toast.error('Error', 'Could not delete product.')
      });
    }
  }

  // Category actions
  openCategoryModal(): void {
    this.editingCategoryId = null;
    this.categoryForm = { code: '', name: '', description: '', parentId: null, active: true };
    this.isCategoryModalOpen.set(true);
  }

  editCategory(cat: Category): void {
    this.editingCategoryId = cat.id || null;
    this.categoryForm = { ...cat };
    this.isCategoryModalOpen.set(true);
  }

  saveCategory(): void {
    if (this.editingCategoryId) {
      this.productService.updateCategory(this.editingCategoryId, this.categoryForm).subscribe({
        next: () => {
          this.toast.success('Category Updated', 'Changes saved.');
          this.isCategoryModalOpen.set(false);
          this.loadCatalog();
        },
        error: () => this.toast.error('Error', 'Failed to update category.')
      });
    } else {
      this.productService.createCategory(this.categoryForm).subscribe({
        next: () => {
          this.toast.success('Category Created', 'New category added.');
          this.isCategoryModalOpen.set(false);
          this.loadCatalog();
        },
        error: () => this.toast.error('Error', 'Failed to create category.')
      });
    }
  }

  deleteCategory(cat: Category): void {
    if (!cat.id) return;
    if (confirm(`Delete category "${cat.name}"?`)) {
      this.productService.deleteCategory(cat.id).subscribe({
        next: () => {
          this.toast.success('Category Removed', 'Category deleted.');
          this.loadCatalog();
        },
        error: () => this.toast.error('Error', 'Cannot delete category with linked products.')
      });
    }
  }

  // Brand actions
  openBrandModal(): void {
    this.editingBrandId = null;
    this.brandForm = { code: '', name: '', country: '', website: '', active: true };
    this.isBrandModalOpen.set(true);
  }

  editBrand(brand: Brand): void {
    this.editingBrandId = brand.id || null;
    this.brandForm = { ...brand };
    this.isBrandModalOpen.set(true);
  }

  saveBrand(): void {
    if (this.editingBrandId) {
      this.productService.updateBrand(this.editingBrandId, this.brandForm).subscribe({
        next: () => {
          this.toast.success('Brand Updated', 'Brand updated.');
          this.isBrandModalOpen.set(false);
          this.loadCatalog();
        },
        error: () => this.toast.error('Error', 'Failed to update brand.')
      });
    } else {
      this.productService.createBrand(this.brandForm).subscribe({
        next: () => {
          this.toast.success('Brand Created', 'Brand registered.');
          this.isBrandModalOpen.set(false);
          this.loadCatalog();
        },
        error: () => this.toast.error('Error', 'Failed to create brand.')
      });
    }
  }

  deleteBrand(brand: Brand): void {
    if (!brand.id) return;
    if (confirm(`Delete brand "${brand.name}"?`)) {
      this.productService.deleteBrand(brand.id).subscribe({
        next: () => {
          this.toast.success('Brand Removed', 'Brand deleted.');
          this.loadCatalog();
        },
        error: () => this.toast.error('Error', 'Cannot delete brand with linked products.')
      });
    }
  }
}
