import assert from "node:assert/strict";
import test from "node:test";
import { createJiti } from "jiti";

function createImporter() {
  return createJiti(import.meta.url, {
    alias: { "@": process.cwd() },
    interopDefault: true,
    moduleCache: false,
  });
}

async function importRoute(env = {}) {
  const previous = {
    SCMO_PRODUCT_MODE: process.env.SCMO_PRODUCT_MODE,
    NEXT_PUBLIC_SCMO_PRODUCT_MODE: process.env.NEXT_PUBLIC_SCMO_PRODUCT_MODE,
    SCMO_STT_OPENAI_API_KEY: process.env.SCMO_STT_OPENAI_API_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    SCMO_STT_MODEL: process.env.SCMO_STT_MODEL,
  };
  Object.assign(process.env, env);
  const route = await createImporter().import("./route.ts");
  return {
    POST: route.POST,
    restore() {
      for (const [key, value] of Object.entries(previous)) {
        if (value === undefined) delete process.env[key];
        else process.env[key] = value;
      }
    },
  };
}

function audioRequest() {
  const formData = new FormData();
  formData.set("audio", new File([new Uint8Array([1, 2, 3])], "voice.webm", { type: "audio/webm" }));
  return new Request("http://localhost/api/scmo/transcribe", {
    method: "POST",
    body: formData,
  });
}

test("requires SCMO product mode", async () => {
  const { POST, restore } = await importRoute({
    SCMO_PRODUCT_MODE: "0",
    NEXT_PUBLIC_SCMO_PRODUCT_MODE: "0",
    SCMO_STT_OPENAI_API_KEY: "sk-test",
  });
  try {
    const response = await POST(audioRequest());
    assert.equal(response.status, 404);
  } finally {
    restore();
  }
});

test("requires STT credentials without exposing secrets", async () => {
  const { POST, restore } = await importRoute({
    SCMO_PRODUCT_MODE: "1",
    NEXT_PUBLIC_SCMO_PRODUCT_MODE: "1",
    SCMO_STT_OPENAI_API_KEY: "",
    OPENAI_API_KEY: "",
  });
  try {
    const response = await POST(audioRequest());
    assert.equal(response.status, 503);
    const body = await response.json();
    assert.match(body.error, /speech-to-text is not configured/);
    assert.doesNotMatch(JSON.stringify(body), /sk-/);
  } finally {
    restore();
  }
});

test("posts audio to OpenAI transcription and returns raw transcript", async () => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url, init });
    return new Response(JSON.stringify({ text: "This is the clean transcript." }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };

  const { POST, restore } = await importRoute({
    SCMO_PRODUCT_MODE: "1",
    NEXT_PUBLIC_SCMO_PRODUCT_MODE: "1",
    SCMO_STT_OPENAI_API_KEY: "sk-test-redacted",
    SCMO_STT_MODEL: "gpt-4o-mini-transcribe",
  });
  try {
    const response = await POST(audioRequest());
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      transcript: "This is the clean transcript.",
      model: "gpt-4o-mini-transcribe",
    });
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, "https://api.openai.com/v1/audio/transcriptions");
    assert.equal(calls[0].init.method, "POST");
    assert.equal(calls[0].init.headers.Authorization, "Bearer sk-test-redacted");
    assert.equal(calls[0].init.body.get("model"), "gpt-4o-mini-transcribe");
    assert.equal(calls[0].init.body.get("response_format"), "json");
  } finally {
    globalThis.fetch = originalFetch;
    restore();
  }
});
