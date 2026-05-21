type ShimmedProcess = {
  env?: {
    NODE_ENV?: string;
  };
  nextTick?: (callback: (...args: unknown[]) => void, ...args: unknown[]) => void;
};

type ProcessTarget = {
  process?: ShimmedProcess;
};

function getShimmedNodeEnv(): string {
  return import.meta.env.MODE;
}

function getProcessShim(): Required<ShimmedProcess> {
  return {
    env: {
      NODE_ENV: getShimmedNodeEnv(),
    },
    nextTick: (callback: (...args: unknown[]) => void, ...args: unknown[]) => {
      queueMicrotask(() => callback(...args));
    },
  };
}

export function ensureProcessShim(target: object): void {
  const processTarget = target as ProcessTarget;
  const currentProcess = processTarget.process;

  if (!currentProcess || typeof currentProcess !== "object") {
    Object.defineProperty(processTarget, "process", {
      configurable: true,
      writable: true,
      value: getProcessShim(),
    });

    return;
  }

  const shimmedProcess = getProcessShim();

  currentProcess.env ??= shimmedProcess.env;
  currentProcess.env.NODE_ENV ??= shimmedProcess.env.NODE_ENV;
  currentProcess.nextTick ??= shimmedProcess.nextTick;
}
