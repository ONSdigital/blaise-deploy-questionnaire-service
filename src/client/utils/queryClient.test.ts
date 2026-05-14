import { queryClient } from "./queryClient";

describe("queryClient", () => {
  it("configures the expected default retry and cache settings", () => {
    expect(queryClient.getDefaultOptions()).toEqual({
      queries: expect.objectContaining({
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
        retry: 1,
        refetchOnWindowFocus: false,
      }),
      mutations: expect.objectContaining({
        retry: 1,
      }),
      dehydrate: undefined,
      hydrate: undefined,
    });
  });
});