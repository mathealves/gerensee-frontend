import apiClient from '@/api/client';
import type { Document, DocumentSummary, DocumentLock, TiptapDocument } from '@/types';

export interface CreateDocumentPayload {
  title: string;
  content?: TiptapDocument;
}

export interface UpdateDocumentPayload {
  title?: string;
  content?: TiptapDocument;
}

// ── Document CRUD ─────────────────────────────────────────────────────────────

export async function listDocuments(projectId: string): Promise<DocumentSummary[]> {
  const { data } = await apiClient.get<DocumentSummary[]>(`/projects/${projectId}/documents`);
  return data;
}

export async function createDocument(
  projectId: string,
  payload: CreateDocumentPayload,
): Promise<Document> {
  const { data } = await apiClient.post<Document>(`/projects/${projectId}/documents`, payload);
  return data;
}

export async function getDocument(documentId: string): Promise<Document> {
  const { data } = await apiClient.get<Document>(`/documents/${documentId}`);
  return data;
}

export async function updateDocument(
  documentId: string,
  payload: UpdateDocumentPayload,
): Promise<Document> {
  const { data } = await apiClient.patch<Document>(`/documents/${documentId}`, payload);
  return data;
}

export async function deleteDocument(documentId: string): Promise<void> {
  await apiClient.delete(`/documents/${documentId}`);
}

// ── Document Locking ──────────────────────────────────────────────────────────

export async function lockDocument(documentId: string): Promise<DocumentLock> {
  const { data } = await apiClient.post<DocumentLock>(`/documents/${documentId}/lock`);
  return data;
}

export async function unlockDocument(documentId: string): Promise<void> {
  await apiClient.delete(`/documents/${documentId}/lock`);
}

export async function extendLock(documentId: string): Promise<DocumentLock> {
  const { data } = await apiClient.patch<DocumentLock>(`/documents/${documentId}/lock`);
  return data;
}
