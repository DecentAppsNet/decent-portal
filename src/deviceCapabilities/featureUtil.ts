/* v8 ignore start */
export function hasWebGpuSupport():boolean {
  if (!globalThis.navigator || !globalThis.navigator.gpu) return false; // Test runner.
  return !!globalThis.navigator.gpu;
}

export function hasWasmSupport():boolean {
  return !!globalThis.WebAssembly
}

export function hasStorageSupport():boolean {
  if (!globalThis.navigator || !globalThis.navigator.gpu) return false; // Test runner.
  return (!!globalThis.navigator.storage && !!globalThis.navigator.storage.estimate);
}
/* v8 ignore end */