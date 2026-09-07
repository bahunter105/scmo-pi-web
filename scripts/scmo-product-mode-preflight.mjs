#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const provider = process.env.SCMO_DEFAULT_PROVIDER || 'openai-codex';
const model = process.env.SCMO_DEFAULT_MODEL || 'gpt-5.4-mini';
const agentDir = process.env.PI_CODING_AGENT_DIR || join(process.env.HOME || '', '.pi', 'agent');
const authPath = join(agentDir, 'auth.json');
const modelsPath = join(agentDir, 'models.json');

console.log('SCMO product-mode preflight');
console.log(`provider/model: ${provider} / ${model}`);
console.log(`PI_CODING_AGENT_DIR: ${agentDir}`);
console.log(`auth.json present: ${existsSync(authPath) ? 'yes' : 'no'}`);
console.log(`models.json present: ${existsSync(modelsPath) ? 'yes' : 'no'}`);

if (existsSync(authPath)) {
  try {
    const auth = JSON.parse(readFileSync(authPath, 'utf8'));
    const keys = Object.keys(auth);
    console.log(`configured auth providers: ${keys.length ? keys.join(', ') : '(none)'}`);
  } catch {
    console.log('configured auth providers: unreadable auth.json');
  }
}

if (!existsSync(authPath)) {
  console.log('warning: no auth.json found; in Docker Sandboxes use `sbx secret set openai --oauth` for Codex subscription auth.');
}
