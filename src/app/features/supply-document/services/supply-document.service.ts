import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { SupplyDocumentDto, ApproveDocumentRequest, CreateSupplyDocumentRequest } from '../models/supply-document.models';

@Injectable({
  providedIn: 'root',
})
export class SupplyDocumentService {
  constructor(private api: ApiService) {}

  getAllDocuments(): Observable<SupplyDocumentDto[]> {
    return this.api.get<SupplyDocumentDto[]>('SupplyDocument/GetAllDocs');
  }

  getMyDocuments(): Observable<SupplyDocumentDto[]> {
    return this.api.get<SupplyDocumentDto[]>('SupplyDocument/GetMyDocs');
  }

  createDocument(data: CreateSupplyDocumentRequest): Observable<any> {
    return this.api.post('SupplyDocument', data);
  }

  approveDocument(id: number): Observable<any> {
    return this.api.post(`SupplyDocument/approve/${id}`, {});
  }

  rejectDocument(id: number): Observable<any> {
    return this.api.post(`SupplyDocument/reject/${id}`, {});
  }
}