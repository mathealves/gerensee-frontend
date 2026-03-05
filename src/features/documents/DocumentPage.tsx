'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Save, Trash2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/hooks/useAuthStore';
import { useProjectContext } from '@/features/projects/ProjectContext';
import { useDocument, useDocumentLock } from '@/features/documents/hooks/useDocument';
import { DocumentLockBanner } from '@/features/documents/DocumentLockBanner';
import { TiptapEditor } from '@/features/documents/TiptapEditor';
import { updateDocument, deleteDocument } from '@/api/documents';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import type { TiptapDocument } from '@/types';

interface DocumentPageProps {
  documentId: string;
}

export function DocumentPage({ documentId }: DocumentPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { project } = useProjectContext();
  const currentUser = useAuthStore((s) => s.user);

  const { data: doc, isLoading } = useDocument(documentId);
  const { acquire, release } = useDocumentLock(documentId);

  const [localContent, setLocalContent] = useState<TiptapDocument | null>(null);

  const isOwner = doc?.lock?.projectMember.member.userId === currentUser?.id;
  const isLocked = !!doc?.lock;
  const canEdit = isOwner;

  const saveMutation = useMutation({
    mutationFn: (content: TiptapDocument) => updateDocument(documentId, { content }),
    onSuccess: () => {
      release.mutate();
      queryClient.invalidateQueries({ queryKey: ['document', documentId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteDocument(documentId),
    onSuccess: () => {
      router.push(`/projects/${project.id}/documents`);
    },
  });

  const handleEdit = useCallback(() => {
    acquire.mutate();
  }, [acquire]);

  const handleSave = useCallback(() => {
    const content = localContent ?? doc?.content;
    if (content) {
      saveMutation.mutate(content);
    }
  }, [localContent, doc?.content, saveMutation]);

  const handleRelease = useCallback(() => {
    release.mutate();
  }, [release]);

  const handleContentChange = useCallback((value: TiptapDocument) => {
    setLocalContent(value);
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Document not found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-semibold flex-1 truncate">{doc.title}</h1>
        <div className="flex items-center gap-2 shrink-0">
          {!isLocked && (
            <Button size="sm" onClick={handleEdit} disabled={acquire.isPending}>
              <Pencil className="h-3.5 w-3.5 mr-1.5" />
              {acquire.isPending ? 'Locking…' : 'Edit'}
            </Button>
          )}
          {canEdit && (
            <Button size="sm" onClick={handleSave} disabled={saveMutation.isPending}>
              <Save className="h-3.5 w-3.5 mr-1.5" />
              {saveMutation.isPending ? 'Saving…' : 'Save'}
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive"
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
            title="Delete document"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Lock banner */}
      {doc.lock && (
        <DocumentLockBanner
          lock={doc.lock}
          onRelease={isOwner ? handleRelease : undefined}
          isReleasing={release.isPending}
        />
      )}

      {/* Editor */}
      <TiptapEditor
        value={doc.content}
        onChange={handleContentChange}
        editable={canEdit}
        className="min-h-[400px]"
      />
    </div>
  );
}
