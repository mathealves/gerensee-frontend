'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';
import { makeQueryClient } from '@/lib/queryClient';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useAuthInit } from '@/hooks/useAuthInit';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => makeQueryClient());
  const { authReady } = useAuthInit();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {authReady ? (
          children
        ) : (
          <div className="flex min-h-screen items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-foreground" />
          </div>
        )}
      </TooltipProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
