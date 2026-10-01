export type WarehouseType = 'CENTRAL_DC' | 'REGIONAL_HUB' | 'RETAIL_BACKROOM';

export interface Warehouse {
  id?: number;
  code: string;
  name: string;
  type?: WarehouseType;
  addressLine?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  contactPhone?: string;
  capacityUnits?: number;
  active: boolean;
}

export interface WarehouseLocation {
  id?: number;
  warehouseId: number;
  warehouseName?: string;
  zone: string;
  aisle?: string;
  rack?: string;
  shelf?: string;
  bin?: string;
  barcode?: string;
  active: boolean;
}
