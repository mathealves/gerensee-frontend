'use client';

import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/shared/Avatar';
import { useAuthStore } from '@/hooks/useAuthStore';
import type { DocumentLock } from '@/types';

interface DocumentLockBannerProps {
  lock: DocumentLock;
  onRelease?: () => void;
  isReleasing?: boolean;
}

export function DocumentLockBanner({ lock, onRelease, isReleasing }: DocumentLockBannerProps) {
  const currentUser = useAuthStore((s) => s.user);
  const lockOwnerUserId = lock.projectMember.member.userId;
  const lockOwnerName = lock.projectMember.member.user.name;
  const isCurrentUserLockOwner = currentUser?.id === lockOwnerUserId;

  const expiresAt = new Date(lock.expiresAt);
  const expiresFormatted = expiresAt.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-yellow-50 border-yellow-200 px-4 py-2.5 text-sm">
      <Lock className="h-4 w-4 text-yellow-600 shrink-0" />
      <Avatar name={lockOwnerName} className="h-6 w-6 text-[9px] shrink-0" />
      <span className="flex-1">
        {isCurrentUserLockOwner ? (
          <>
            <span className="font-medium">You are editing this document.</span> Lock expires at{' '}
            {expiresFormatted}.
          </>
        ) : (
          <>
            <span className="font-medium">{lockOwnerName}</span> is editing this document. Lock
            expires at {expiresFormatted}.
          </>
        )}
      </span>
      {isCurrentUserLockOwner && onRelease && (
        <Button
          size="sm"
          variant="outline"
          className="border-yellow-300 hover:bg-yellow-100 text-yellow-800 shrink-0"
          onClick={onRelease}
          disabled={isReleasing}
        >
          {isReleasing ? 'Releasing…' : 'Release Lock'}
        </Button>
      )}
    </div>
  );
}
