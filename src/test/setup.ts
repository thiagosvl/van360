import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Executa limpeza após cada teste para evitar leak de memória e conflitos
afterEach(() => {
  cleanup();
});
