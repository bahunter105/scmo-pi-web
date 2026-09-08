import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { createJiti } from "jiti";

const jiti = createJiti(import.meta.url, {
  alias: { "@": process.cwd() },
  interopDefault: true,
  moduleCache: false,
});

const { PUT } = await jiti.import("./[...path]/route.ts");
const { allowFileRoot } = await jiti.import("../../../lib/file-access.ts");

function routeContext(filePath) {
  return { params: Promise.resolve({ path: filePath.split("/").filter(Boolean) }) };
}

function saveRequest(content, extra = {}) {
  return new Request("http://localhost/api/files/save-target.md", {
    method: "PUT",
    headers: { "Content-Type": "application/json", Host: "localhost", ...extra.headers },
    body: JSON.stringify({ content, ...extra.body }),
  });
}

test("PUT saves safe text content under an allowed root", async (t) => {
  const cwd = await mkdtemp(join(tmpdir(), "pi-web-file-save-"));
  allowFileRoot(cwd);
  t.after(() => rm(cwd, { recursive: true, force: true }));
  const target = join(cwd, "marketing-context.md");
  await writeFile(target, "before\n", "utf8");

  const response = await PUT(saveRequest("after\n"), routeContext(target));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true, size: 6 });
  assert.equal(await readFile(target, "utf8"), "after\n");
});

test("PUT rejects non-json save requests", async (t) => {
  const cwd = await mkdtemp(join(tmpdir(), "pi-web-file-save-"));
  allowFileRoot(cwd);
  t.after(() => rm(cwd, { recursive: true, force: true }));
  const target = join(cwd, "notes.md");
  await writeFile(target, "before\n", "utf8");

  const response = await PUT(new Request("http://localhost/api/files/notes.md", {
    method: "PUT",
    headers: { "Content-Type": "text/plain", Host: "localhost" },
    body: "after\n",
  }), routeContext(target));

  assert.equal(response.status, 415);
  assert.equal(await readFile(target, "utf8"), "before\n");
});

test("PUT rejects binary files instead of overwriting them as text", async (t) => {
  const cwd = await mkdtemp(join(tmpdir(), "pi-web-file-save-"));
  allowFileRoot(cwd);
  t.after(() => rm(cwd, { recursive: true, force: true }));
  const target = join(cwd, "photo.png");
  const original = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
  await writeFile(target, original);

  const response = await PUT(saveRequest("not an image\n"), routeContext(target));
  assert.equal(response.status, 415);
  assert.deepEqual(Buffer.from(await readFile(target)), original);
});
