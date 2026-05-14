import "@testing-library/jest-dom/vitest";
import { configure } from "@testing-library/react";
import axios from "axios";

const globalWithActEnvironment = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT?: boolean;
};

globalWithActEnvironment.IS_REACT_ACT_ENVIRONMENT = true;
