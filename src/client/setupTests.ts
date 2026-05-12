import "@testing-library/jest-dom";
import { configure } from "@testing-library/react";

// Feature tests perform full page flows and can exceed the default 1s async timeout.
configure({ asyncUtilTimeout: 5000 });
