/**
 * Warehouse Feature Models
 */

export interface Warehouse {
  id: number;
 name: string;
 description: string;
  createdBy: number;
  createdByName: string;
  createdDate: Date;
  items: WarehouseItem[];
}

export interface WarehouseItem {
  id: number;
  name: string;
  description: string;
  quantity: number;
}

export interface CreateWarehouseRequest {
  Name: string;
  Description: string;
  Items: CreateWarehouseItemRequest[];
}

export interface CreateWarehouseItemRequest {
  Name: string;
  Description?: string;
  Quantity: number;
}

export interface UpdateWarehouseRequest {
  warehouseName: string;
  warehouseDescription: string;
}
