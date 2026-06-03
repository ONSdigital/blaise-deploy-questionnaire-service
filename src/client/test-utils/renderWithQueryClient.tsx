import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

import type { ComponentType, ReactNode } from "react";

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

/**
 * Creates a React Testing Library `wrapper` option that wraps with QueryClientProvider.
 * Optionally composes an additional wrapper (e.g. BrowserRouter, MemoryRouter).
 *
 * Usage:
 *   render(<Component />, { wrapper: createWrapper() });
 *   render(<Component />, { wrapper: createWrapper(BrowserRouter) });
 */
export function createWrapper(
  Inner?: ComponentType<{ children: ReactNode }>,
): ComponentType<{ children: ReactNode }> {
  const client = createTestQueryClient();

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>
        {Inner ? <Inner>{children}</Inner> : children}
      </QueryClientProvider>
    );
  };
}
