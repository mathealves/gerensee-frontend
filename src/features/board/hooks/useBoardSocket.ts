'use client';

import { useEffect, useRef } from 'react';
import type { Socket } from 'socket.io-client';
import { createBoardSocket } from '@/lib/socket';
import { getAuthToken } from '@/hooks/useAuthStore';
import type { Task } from '@/types';

export interface BoardSocketCallbacks {
  onTaskCreated?: (task: Task) => void;
  onTaskUpdated?: (task: Task) => void;
  onTaskDeleted?: (taskId: string) => void;
}

export function useBoardSocket(projectId: string, callbacks: BoardSocketCallbacks) {
  const socketRef = useRef<Socket | null>(null);
  const callbacksRef = useRef(callbacks);

  // Keep callbacks ref current without re-running the effect
  useEffect(() => {
    callbacksRef.current = callbacks;
  });

  useEffect(() => {
    const token = getAuthToken();
    const socket = createBoardSocket(projectId, token ?? undefined);
    socketRef.current = socket;

    socket.on('taskCreated', ({ task }: { task: Task }) => {
      callbacksRef.current.onTaskCreated?.(task);
    });

    socket.on('taskUpdated', ({ task }: { task: Task }) => {
      callbacksRef.current.onTaskUpdated?.(task);
    });

    socket.on('taskDeleted', ({ taskId }: { taskId: string }) => {
      callbacksRef.current.onTaskDeleted?.(taskId);
    });

    return () => {
      socket.emit('leaveBoard', { projectId });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [projectId]);
}
