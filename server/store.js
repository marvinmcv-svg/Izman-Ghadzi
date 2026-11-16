// Private storage on this computer only.
// Keys live in ~/.product-suite/keys.json with mode 0600 (owner read and write only).
// Settings (caps, sender details, model choice) live in settings.json next to it. No secrets there.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export const DIR = process.env.SUITE_HOME || path.join(os.homedir(), '.product-suite');
const KEYS = path.join(DIR, 'keys.json');
const SETTINGS = path.join(DIR, 'settings.json');

function ensureDir() {
  if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true, mode: 0o700 });
  try { fs.chmodSync(DIR, 0o700); } catch { /* Windows */ }
}

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}

function writePrivate(file, data) {
  ensureDir();
  const tmp = file + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), { mode: 0o600 });
  fs.renameSync(tmp, file);
  try { fs.chmodSync(file, 0o600); } catch { /* Windows */ }
}

// ---------- keys ----------
// shape: { [tool]: { values: {field: secret}, status: 'saved'|'ok'|'bad', testedAt } }
let keys = readJson(KEYS, {});

export function getSecret(tool, field = 'key') {
  return keys[tool]?.values?.[field] || '';
}
export function hasKey(tool, fields) {
  return fields.every(f => !!keys[tool]?.values?.[f]);
}
export function saveKey(tool, values) {
  const prev = keys[tool]?.values || {};
  const merged = { ...prev };
  for (const [k, v] of Object.entries(values || {})) {
    const s = String(v || '').trim();
    if (s) merged[k] = s;
  }
  keys[tool] = { values: merged, status: 'saved', testedAt: null };
  writePrivate(KEYS, keys);
}
export function removeKey(tool) {
  delete keys[tool];
  writePrivate(KEYS, keys);
}
export function setKeyStatus(tool, status) {
  if (!keys[tool]) return;
  keys[tool].status = status;
  keys[tool].testedAt = new Date().toISOString();
  writePrivate(KEYS, keys);
}
export function keyStatus(tool) {
  return keys[tool]?.status || 'none';
}

// Masked view: first 4 and last 4 characters only, like "sk-a........9f2c".
export function mask(secret) {
  if (!secret) return '';
  if (secret.length <= 10) return secret.slice(0, 2) + '........';
  return secret.slice(0, 4) + '........' + secret.slice(-4);
}
export function maskedValues(tool) {
  const out = {};
  for (const [k, v] of Object.entries(keys[tool]?.values || {})) out[k] = mask(v);
  return out;
}

// ---------- settings (not secret) ----------
export const DEFAULT_SETTINGS = {
  sessionCap: 10,
  apifyRunCap: 1,
  defaultModel: 'claude-opus-5-5',
  fableAddress: '',
  whopAccountId: '',
  scaledmailWorkspace: '',
  spaceshipContact: '',
  senderName: '',
  businessName: '',
  mailingAddress: '',
  dailyCapPerInbox: 25,
  robots: null, // null means use built in list
};
let settings = { ...DEFAULT_SETTINGS, ...readJson(SETTINGS, {}) };

export function getSettings() { return { ...settings }; }
export function saveSettings(patch) {
  const allowed = Object.keys(DEFAULT_SETTINGS);
  for (const [k, v] of Object.entries(patch || {})) {
    if (!allowed.includes(k)) continue;
    if (['sessionCap', 'apifyRunCap', 'dailyCapPerInbox'].includes(k)) {
      const n = Number(v);
      if (!Number.isFinite(n) || n < 0) continue;
      settings[k] = n;
    } else {
      settings[k] = v;
    }
  }
  writePrivate(SETTINGS, settings);
  return getSettings();
}
