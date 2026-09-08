import assert from "node:assert/strict";
import test from "node:test";
import { createJiti } from "jiti";

const jiti = createJiti(import.meta.url, {
  tsconfigPaths: true,
});
const { buildScmoSystemPrompt } = await jiti.import("./scmo-system-prompt.ts");

test("SCMO prompt teaches Simmi to emit in-chat approval card payloads before durable writes", () => {
  const prompt = buildScmoSystemPrompt("/workspace/company");

  assert.match(prompt, /```scmo-file-change/);
  assert.match(prompt, /filePath/);
  assert.match(prompt, /proposedContent/);
  assert.match(prompt, /Do not write durable company context directly before this review card is approved/);
});
