import { QueryClient } from '@tanstack/react-query';

const queryClientConfig = {
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
};

export function makeQueryClient() {
  return new QueryClient(queryClientConfig);
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (typeof window === 'undefined') {
    return makeQueryClient();
  }
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}
