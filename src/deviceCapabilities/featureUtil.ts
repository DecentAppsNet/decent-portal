export function hasWebGpuSupport():boolean {
  return !!globalThis.navigator.gpu;
}

export function hasWasmSupport():boolean {
  return !!globalThis.WebAssembly
}

export function hasStorageSupport():boolean {
  /* v8 ignore next */
  return (!!globalThis.navigator.storage && !!globalThis.navigator.storage.estimate);
}