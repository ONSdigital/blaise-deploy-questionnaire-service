const globalWithProcess = globalThis as typeof globalThis & {
  process?: {
    env?: {
      NODE_ENV?: string;
    };
  };
};

globalWithProcess.process ??= {};
globalWithProcess.process.env ??= {};
globalWithProcess.process.env.NODE_ENV = "test";
