'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FilePlus, LockIcon } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { useProjectContext } from '@/features/projects/ProjectContext';
import { useDocumentList } from '@/features/documents/hooks/useDocument';
import { createDocument } from '@/api/documents';
import { formatRelative } from '@/lib/formatDate';

export function DocumentsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const project = useProjectContext();

  const { data: documents = [], isLoading } = useDocumentList(project.id);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const createMutation = useMutation({
    mutationFn: (title: string) => createDocument(project.id, { title }),
    onSuccess: (doc) => {
      queryClient.invalidateQueries({ queryKey: ['documents', project.id] });
      setDialogOpen(false);
      setNewTitle('');
      router.push(`/projects/${project.id}/documents/${doc.id}`);
    },
  });

  const handleCreate = () => {
    const title = newTitle.trim();
    if (!title) return;
    createMutation.mutate(title);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Documents</h1>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <FilePlus className="h-4 w-4 mr-1.5" />
          New Document
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 rounded-lg border bg-muted animate-pulse" />
          ))}
        </div>
      ) : documents.length === 0 ? (
        <EmptyState
          title="No documents yet"
          description="Create your first document to share notes and specifications with your team."
          action={
            <Button size="sm" onClick={() => setDialogOpen(true)}>
              <FilePlus className="h-4 w-4 mr-1.5" />
              New Document
            </Button>
          }
        />
      ) : (
        <ul className="space-y-2">
          {documents.map((doc) => (
            <li key={doc.id}>
              <button
                onClick={() => router.push(`/projects/${project.id}/documents/${doc.id}`)}
                className="w-full flex items-center gap-3 rounded-lg border bg-card px-4 py-3 text-left hover:bg-accent/50 transition-colors"
              >
                <span className="flex-1 font-medium truncate">{doc.title}</span>
                {doc.isLocked && doc.lockedBy && (
                  <span className="flex items-center gap-1 text-xs text-yellow-600 bg-yellow-50 border border-yellow-200 rounded px-2 py-0.5 shrink-0">
                    <LockIcon className="h-3 w-3" />
                    {doc.lockedBy.name}
                  </span>
                )}
                <span className="text-xs text-muted-foreground shrink-0">
                  {formatRelative(doc.updatedAt)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>New Document</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 pt-2">
            <Input
              placeholder="Document title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate();
              }}
              autoFocus
            />
            <Button onClick={handleCreate} disabled={!newTitle.trim() || createMutation.isPending}>
              {createMutation.isPending ? 'Creating…' : 'Create'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
