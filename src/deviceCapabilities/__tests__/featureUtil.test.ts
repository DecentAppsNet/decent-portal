import { describe, it, expect } from 'vitest';

import {hasWebGpuSupport, hasWasmSupport, hasStorageSupport} from '../featureUtil';

describe('featureUtil', () => {
  it('hasWebGpuSupport() returns false in test runner environment', () => {
    expect(hasWebGpuSupport()).toBe(false);
  });

  it('hasWasmSupport() returns true in test runner environment', () => {
    expect(hasWasmSupport()).toBe(true);
  });

  it('hasStorageSupport() returns false in test runner environment', () => {
    expect(hasStorageSupport()).toBe(false);
  });
});