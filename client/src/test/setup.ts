import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

URL.createObjectURL = vi.fn(() => "blob:mock-url");
