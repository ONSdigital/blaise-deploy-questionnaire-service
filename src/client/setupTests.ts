import "@testing-library/jest-dom/vitest";
import { configure } from "@testing-library/react";

const globalWithActEnvironment = globalThis as typeof globalThis & {
	IS_REACT_ACT_ENVIRONMENT?: boolean;
};

globalWithActEnvironment.IS_REACT_ACT_ENVIRONMENT = true;

// Feature tests perform full page flows and can exceed the default 1s async timeout.
configure({ asyncUtilTimeout: 5000 });
