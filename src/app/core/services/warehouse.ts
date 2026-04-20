import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Warehouse, CreateWarehouseRequest } from '../../features/warehouse/models/warehouse.models';

@Injectable({
  providedIn: 'root',
})
export class WarehouseService {
    constructor(private api: ApiService) {}

  getMyWarehouses(): Observable<Warehouse[]> {
    return this.api.get<Warehouse[]>('warehouse/GetMyWarehouses');
  }

  addWarehouse(data: CreateWarehouseRequest): Observable<any> {
    return this.api.post('warehouse', data);
  }
  deleteWarehouses(ids: number[]): Observable<string> {
    return this.api.deleteText('warehouse', ids);
  }
    getAllWarehouses(): Observable<Warehouse[]> {
    return this.api.get<Warehouse[]>('warehouse/GetAllWarehouses');
  }

  getExportExcel(): Observable<Blob> {
    return this.api.getBlob('warehouse/export');
  }
}
