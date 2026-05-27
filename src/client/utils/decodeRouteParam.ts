export function decodeRouteParam(routeParam: string | undefined): string | undefined {
  if (!routeParam) {
    return undefined;
  }

  try {
    return decodeURIComponent(routeParam);
  } catch {
    return routeParam;
  }
}
