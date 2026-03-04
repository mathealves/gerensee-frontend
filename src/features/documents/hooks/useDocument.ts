import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDocument, listDocuments, lockDocument, unlockDocument } from '@/api/documents';

export function useDocument(documentId: string) {
  return useQuery({
    queryKey: ['document', documentId],
    queryFn: () => getDocument(documentId),
    enabled: !!documentId,
    refetchInterval: 10_000, // Poll every 10s to detect external lock changes
  });
}

export function useDocumentList(projectId: string) {
  return useQuery({
    queryKey: ['documents', projectId],
    queryFn: () => listDocuments(projectId),
    enabled: !!projectId,
  });
}

export function useDocumentLock(documentId: string) {
  const queryClient = useQueryClient();

  const acquire = useMutation({
    mutationFn: () => lockDocument(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document', documentId] });
    },
  });

  const release = useMutation({
    mutationFn: () => unlockDocument(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document', documentId] });
    },
  });

  return { acquire, release };
}
