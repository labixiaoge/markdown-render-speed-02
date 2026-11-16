// main.ts — driver for the markdown-render-speed-02 entry.
// Reads /input/cases.json (a JSON array of markdown strings), renders each
// case on its own with the hand-written parser, and writes the HTML strings
// as a JSON array, in case order, to /output/html.json.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { parse } from './parse.js';

const cases: string[] = JSON.parse(readFileSync('/input/cases.json', 'utf8'));
const out: string[] = new Array(cases.length);
for (let i = 0; i < cases.length; i++) out[i] = parse(cases[i]);
mkdirSync('/output', { recursive: true });
writeFileSync('/output/html.json', JSON.stringify(out));
