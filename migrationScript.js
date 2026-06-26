#!/usr/bin/env node
/**
 * Migration script: sailpoint golang-sdk v2 → v3
 *
 * Run from any directory:
 *   node migrationScript.js [target-directory]
 *
 * If no target directory is supplied the script processes the current
 * working directory recursively.
 *
 * What this script changes
 * ────────────────────────
 *  go.mod
 *    • Updates the golang-sdk require path from v2 to v3
 *
 *  *.go files
 *    • Updates all import paths from golang-sdk/v2 to golang-sdk/v3
 *    • Removes the .V3. and .Beta. intermediate namespace qualifiers
 *      (e.g. apiClient.V3.AccountsAPI → apiClient.AccountsAPI)
 *    • Adds the V1 version suffix to API service method calls that are
 *      not yet versioned (e.g. AccountsAPI.ListAccounts( → AccountsAPI.ListAccountsV1()
 *
 * After running, review the manual items printed at the end, then run
 *   go mod tidy
 * to regenerate go.sum.
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT      = path.resolve(process.argv[2] || '.');
const SKIP_DIRS = new Set(['.git', 'node_modules', 'vendor', 'dist', 'build']);

let scanned = 0;
let changed = 0;
const changeLog = [];

// ─── helpers ─────────────────────────────────────────────────────────────────

function walk(dir) {
    let entries;
    try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
        return;
    }
    for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (!SKIP_DIRS.has(entry.name)) walk(full);
        } else if (entry.isFile()) {
            const ext = path.extname(entry.name);
            if (ext === '.go' || entry.name === 'go.mod') {
                processFile(full);
            }
        }
    }
}

function applyReplacements(text, file) {
    const isGoMod = path.basename(file) === 'go.mod';
    let out = text;

    if (isGoMod) {
        // Bump the module path
        out = out.replace(
            /github\.com\/sailpoint-oss\/golang-sdk\/v2\b/g,
            'github.com/sailpoint-oss/golang-sdk/v3'
        );
    } else {
        // 1. Update import paths (including sub-packages like /api_v3, /api_beta, etc.)
        out = out.replace(
            /"github\.com\/sailpoint-oss\/golang-sdk\/v2(\/[^"]*)"/g,
            (_, sub) => `"github.com/sailpoint-oss/golang-sdk/v3${sub}"`
        );

        // 2. Remove .V3. and .Beta. namespace qualifiers
        //    e.g. apiClient.V3.AccountsAPI → apiClient.AccountsAPI
        out = out.replace(/\.(V3|Beta)\./g, '.');

        // 3. Add V1 suffix to unversioned API service method calls.
        //    Targets the pattern: SomethingAPI.PascalCaseMethod(
        //    Skips methods that already end with a version indicator (V1, V2 …).
        out = out.replace(
            /(\b[A-Z][a-zA-Z]+API\.)([A-Z][a-zA-Z]*)(\()/g,
            (match, service, method, paren) => {
                if (/[Vv]\d+$/.test(method)) return match;
                return `${service}${method}V1${paren}`;
            }
        );
    }

    return out;
}

function processFile(file) {
    scanned++;
    let original;
    try {
        original = fs.readFileSync(file, 'utf8');
    } catch {
        return;
    }

    const updated = applyReplacements(original, file);

    if (updated !== original) {
        fs.writeFileSync(file, updated, 'utf8');
        const rel = path.relative(ROOT, file);
        console.log(`  updated  ${rel}`);
        changeLog.push(rel);
        changed++;
    }
}

// ─── main ────────────────────────────────────────────────────────────────────

console.log(`\nSailPoint golang-sdk v2 → v3 migration`);
console.log(`Target: ${ROOT}\n`);

walk(ROOT);

console.log(`\n${changed} file(s) changed out of ${scanned} scanned.\n`);

console.log(`Manual review required
══════════════════════
1. Type parameters for generic pagination helpers
   Old: sailpoint.PaginateWithDefaults[v3.Account](...)
   New: sailpoint.PaginateWithDefaults[api_accounts.Account](...)
   → Update type arguments to use the per-partition package (api_<resource>.TypeName).

2. Leftover import aliases pointing at api_v3 / api_beta sub-packages
   These packages no longer exist in v3.  Replace them with the appropriate
   per-partition import, e.g.
     api_accounts "github.com/sailpoint-oss/golang-sdk/v3/api_accounts"

3. PaginateSearchApi – the signature changed in v3.
   Refer to the updated SDK documentation for the new call pattern.

4. Run \`go mod tidy\` to update go.sum after applying this migration.
`);
