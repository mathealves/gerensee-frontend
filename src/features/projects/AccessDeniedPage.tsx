'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function AccessDeniedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center px-4">
      <div className="text-6xl font-bold text-muted-foreground">403</div>
      <h1 className="text-2xl font-semibold">Access Denied</h1>
      <p className="text-muted-foreground max-w-sm">
        You are not a member of this project, or the project does not exist.
      </p>
      <Button asChild>
        <Link href="/dashboard">Back to Dashboard</Link>
      </Button>
    </div>
  );
}
