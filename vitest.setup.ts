import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// jsdom in this setup does not expose Web Storage (its localStorage getter
// yields undefined), so provide a minimal, spec-shaped in-memory localStorage
// for the client modules under test.
function storageMissing(): boolean {
  try {
    return typeof window === "undefined" || window.localStorage == null;
  } catch {
    return true;
  }
}

if (typeof window !== "undefined" && storageMissing()) {
  class MemoryStorage implements Storage {
    private store = new Map<string, string>();
    get length(): number {
      return this.store.size;
    }
    clear(): void {
      this.store.clear();
    }
    getItem(key: string): string | null {
      return this.store.has(key) ? this.store.get(key)! : null;
    }
    key(index: number): string | null {
      return Array.from(this.store.keys())[index] ?? null;
    }
    removeItem(key: string): void {
      this.store.delete(key);
    }
    setItem(key: string, value: string): void {
      this.store.set(key, String(value));
    }
  }
  const storage = new MemoryStorage();
  Object.defineProperty(window, "localStorage", { value: storage, configurable: true });
  Object.defineProperty(globalThis, "localStorage", { value: storage, configurable: true });
}

afterEach(() => {
  cleanup();
});
