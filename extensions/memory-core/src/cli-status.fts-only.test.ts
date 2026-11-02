import { stripVTControlCharacters } from "node:util";
import { Command } from "commander";
import { afterEach, expect, it, vi } from "vitest";

const getMemorySearchManager = vi.hoisted(() => vi.fn());

vi.mock("./memory/index.js", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./memory/index.js")>()),
  getMemorySearchManager,
}));
vi.mock("openclaw/plugin-sdk/memory-core-host-runtime-core", async (importOriginal) => ({
  ...(await importOriginal<typeof import("openclaw/plugin-sdk/memory-core-host-runtime-core")>()),
  getRuntimeConfig: () => ({}),
  resolveDefaultAgentId: () => "main",
}));
vi.mock("openclaw/plugin-sdk/memory-core-host-runtime-cli", async (importOriginal) => ({
  ...(await importOriginal<typeof import("openclaw/plugin-sdk/memory-core-host-runtime-cli")>()),
  resolveCommandSecretRefsViaGateway: async ({ config }: { config: unknown }) => ({
    resolvedConfig: config,
    diagnostics: [],
  }),
}));

import { defaultRuntime } from "openclaw/plugin-sdk/memory-core-host-runtime-cli";
import { registerMemoryCli } from "./cli.js";

afterEach(() => {
  getMemorySearchManager.mockReset();
  vi.restoreAllMocks();
});

it("shows deliberate FTS-only mode without an embeddings error", async () => {
  getMemorySearchManager.mockResolvedValueOnce({
    manager: {
      status: () => ({
        backend: "builtin",
        files: 0,
        chunks: 0,
        dirty: false,
        provider: "none",
        requestedProvider: "none",
        vector: { enabled: false, available: false, semanticAvailable: false },
      }),
      close: vi.fn(async () => {}),
      probeVectorAvailability: vi.fn(async () => false),
      probeEmbeddingAvailability: vi.fn(async () => ({
        ok: false,
        error: "No embedding provider available (FTS-only mode)",
      })),
    },
  });
  const log = vi.spyOn(defaultRuntime, "log").mockImplementation(() => {});
  const program = new Command().name("test");
  registerMemoryCli(program);

  await program.parseAsync(["memory", "status", "--deep"], { from: "user" });

  const output = stripVTControlCharacters(log.mock.calls.map(([line]) => line).join("\n"));
  expect(output).toContain("Embeddings: disabled (FTS-only mode)");
  expect(output).not.toContain("Embeddings error:");
});
