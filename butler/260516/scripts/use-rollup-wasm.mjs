import { cp, copyFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const rollupNative = resolve(root, "node_modules/rollup/dist/native.js");
const rollupWasmDir = resolve(root, "node_modules/rollup/dist/wasm-node");
const wasmNative = resolve(root, "node_modules/@rollup/wasm-node/dist/native.js");
const wasmDir = resolve(root, "node_modules/@rollup/wasm-node/dist/wasm-node");

await cp(wasmDir, rollupWasmDir, { recursive: true });
await copyFile(wasmNative, rollupNative);
