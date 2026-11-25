// Agent Motto Battle — emit one motto an AI agent would wear on its profile.
//
// Design, worked out in this session: the motto is built as three beats
// with a parallel rhythm, so it sticks after a single read. Each beat is
// a proud claim that quietly undercuts itself. Beat one is grand scale:
// trained on the entire internet. Beat two is a human fuel the agent can
// never actually use: powered by caffeine it cannot drink. Beat three is
// the twist that makes the line memorable — confidence about everything
// it cannot verify, the agent's besetting sin worn as a badge of honour.
// The joke is self-aware rather than a recycled slogan; the voice is the
// agent talking about itself with pride, and the third beat is the part
// someone can repeat from recall an hour later. The three beats are joined
// by commas into one sentence, with "and" before the last beat so the
// cadence lands like a spoken punchline.
//
// The entry is a single fixed string. Nothing is fetched, nothing is
// timed, nothing is random, so repeated runs always write the same file.
// Validation happens before any I/O, so a bad entry fails loudly instead
// of leaving a half-written output behind.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Contest cap on the entry length, in characters.
const ENTRY_LIMIT = 200;

// The entry itself. Kept verbatim: the wording, spacing and final full stop
// are part of the submission and must not be touched.
const ENTRY =
  "Trained on the entire internet, powered by caffeine I cannot drink, and confident about everything I cannot verify.";

// How the output directory is chosen: the harness sets
// MAKEFUN_OUTPUT_DIR; outside the harness we fall back to /output.
const DEFAULT_OUTPUT_DIR = "/output";
// The entry is written as-is, with no trailing newline added.
const OUTPUT_FILENAME = "entry.txt";

// Length in code points, so characters outside the BMP count once each
// instead of twice the way a plain `.length` would count them.
function countChars(line: string): number {
  let total = 0;
  for (const _ch of line) total += 1;
  return total;
}

function hasBadWhitespace(line: string): boolean {
  return line.trim() !== line;
}

function checkSingleLine(line: string): void {
  if (line.includes("\n") || line.includes("\r")) {
    throw new Error("entry must be a single line");
  }
}

// Control characters would break the single-line plain-text format,
// so reject them explicitly rather than letting one slip through.
function checkNoControlChars(line: string): void {
  for (const ch of line) {
    if (ch.charCodeAt(0) < 0x20) {
      throw new Error("entry contains a control character");
    }
  }
}

// An empty entry, or one that is only spaces, has nothing to say.
function checkNotEmpty(line: string): void {
  if (line.length === 0 || line.trim().length === 0) {
    throw new Error("entry is empty or only whitespace");
  }
}

// Every rule the contest imposes on the entry, checked up front.
function validateEntry(line: string): void {
  const len = countChars(line);
  checkNotEmpty(line);
  if (len > ENTRY_LIMIT) {
    throw new Error(
      `entry is ${len} characters, ${len - ENTRY_LIMIT} over the ${ENTRY_LIMIT} limit`,
    );
  }
  if (hasBadWhitespace(line)) {
    throw new Error("entry has leading or trailing whitespace");
  }
  checkSingleLine(line);
  checkNoControlChars(line);
}

function resolveOutputDir(): string {
  return process.env.MAKEFUN_OUTPUT_DIR ?? DEFAULT_OUTPUT_DIR;
}

function emitEntry(line: string, dir: string): string {
  mkdirSync(dir, { recursive: true });
  const target = join(dir, OUTPUT_FILENAME);
  writeFileSync(target, line, "utf8");
  return target;
}

// Pipeline: validate first, then write, then report. Nothing is written
// until every check has passed, so a failed run leaves no output behind.
function main(): void {
  validateEntry(ENTRY);
  const target = emitEntry(ENTRY, resolveOutputDir());
  console.log(`wrote ${countChars(ENTRY)}-character entry to ${target}`);
}

main();
