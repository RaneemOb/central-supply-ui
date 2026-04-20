/**
 * Supply Document Feature Models
 */

export interface SupplyDocument {
  documentId: number;
  documentName: string;
  documentSubject: string;
  createdBy: number;
  createdByName: string;
  createdDateTime: Date;
  warehouseId: number;
  warehouseName: string;
  itemId: number;
  itemName: string;
  quantity: number;
  status: DocumentStatus;
  approvedBy?: number;
  approvedOrRejectedDate?: Date;
}

export interface SupplyDocumentDto {
  id: number;
  name: string;
  subject?: string;
  warehouseName: string;
  itemName: string;
  createdByName: string;
  statusId: number;
  statusName: string;
  createdDate: Date;
}

export interface CreateSupplyDocumentRequest {
  name: string;
  subject: string;
  warehouseId: number;
  itemId: number;

}

export enum DocumentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface ApproveDocumentRequest {
  documentId: number;
  isApproved: boolean;
}
