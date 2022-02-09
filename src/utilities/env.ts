export function isProduction(hostname: string): boolean {
    return hostname.endsWith(".blaise.gcp.onsdigital.uk");
}
