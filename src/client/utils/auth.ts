import { type AuthManagerOptions, createSessionKey } from "blaise-login-react-client";

export type RuntimeAppConfig = {
  projectId: string;
  urlDomain: string;
};

const unresolvedTemplatePattern = /^<%[-=]?[\s\S]*%>$/;
let cachedRuntimeAppConfig: RuntimeAppConfig | undefined;

export function getRuntimeAppConfig(): RuntimeAppConfig {
  if (cachedRuntimeAppConfig) {
    return cachedRuntimeAppConfig;
  }

  const browserConfig = getInjectedRuntimeAppConfig();

  cachedRuntimeAppConfig = {
    projectId: getRequiredRuntimeValue(
      "projectId",
      browserConfig?.projectId,
      import.meta.env.VITE_PROJECT_ID,
    ),
    urlDomain: getRequiredRuntimeValue(
      "urlDomain",
      browserConfig?.urlDomain,
      import.meta.env.VITE_URL_DOMAIN,
    ),
  };

  return cachedRuntimeAppConfig;
}

export function getSharedAuthOptions(): AuthManagerOptions {
  const { projectId, urlDomain } = getRuntimeAppConfig();

  return {
    sessionKey: createSessionKey(projectId),
    cookieDomain: urlDomain,
  };
}

function getRequiredRuntimeValue(
  key: keyof RuntimeAppConfig,
  browserValue: string | undefined,
  viteValue: string | undefined,
): string {
  const value = normaliseRuntimeValue(browserValue) ?? normaliseRuntimeValue(viteValue);

  if (!value) {
    throw new Error(
      `Missing runtime config for ${key}. Provide app-config ${key} or ${toViteEnvName(key)}.`,
    );
  }

  return value;
}

function getInjectedRuntimeAppConfig(): Partial<RuntimeAppConfig> | undefined {
  const configElement = document.getElementById("app-config");
  const rawConfig = configElement?.textContent?.trim();

  if (!rawConfig || unresolvedTemplatePattern.test(rawConfig)) {
    return undefined;
  }

  try {
    return JSON.parse(rawConfig) as Partial<RuntimeAppConfig>;
  } catch {
    throw new Error("Failed to parse runtime app config JSON.");
  }
}

function normaliseRuntimeValue(value: string | undefined): string | undefined {
  const trimmedValue = value?.trim();

  if (!trimmedValue || unresolvedTemplatePattern.test(trimmedValue)) {
    return undefined;
  }

  return trimmedValue;
}

function toViteEnvName(key: keyof RuntimeAppConfig): string {
  return `VITE_${key.replace(/([A-Z])/g, "_$1").toUpperCase()}`;
}
