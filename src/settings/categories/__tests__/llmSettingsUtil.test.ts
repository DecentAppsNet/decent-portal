// Mocks first.

vi.mock("@/persistence/pathStore", async () => ({
  ...(await vi.importActual("@/persistence/pathStore")),
  getText: vi.fn(async (key:string) => Promise.resolve(theFakeStore[key] ?? null)),
  setText: vi.fn(async (key:string, value:string) => {
    theFakeStore[key] = value;
    return Promise.resolve();
  })
}));

// Imports after mocks.
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Setting from '../../types/Setting';
import { applyLlmSettings, getMaxLlmSize, LLM_SETTING_MAX_SIZE, LLM_CATEGORY_ID, LLM_SETTING_AUTO_INC_MAX_SIZE, incrementMaxLlmSizeAfterSuccessfulLoad } from '../llmSettingsUtil';
import SettingType from '@/settings/types/SettingType';

const LLM_CATEGORY_KEY = `/settings/${LLM_CATEGORY_ID}.json`;
const MAX_LLM_SIZE_16:Setting = {
  type: SettingType.NUMERIC,
  id: LLM_SETTING_MAX_SIZE,
  label: "Max LLM size (GB)",
  value: 16, // Default value for testing.
  minValue: 1,
  maxValue: 256
};
const AUTO_INC_ENABLED:Setting = {
  type: SettingType.BOOLEAN_TOGGLE,
  id: LLM_SETTING_AUTO_INC_MAX_SIZE,
  label: "Auto-increase max LLM",
  value: true
};
const AUTO_INC_DISABLED:Setting = {
  ...AUTO_INC_ENABLED,
  value: false
};

let theFakeStore:Record<string, any> = {};

describe('llmSettingsUtil', () => {
  beforeEach(() => {
    theFakeStore = {};
  });

  describe('applyLlmSettings()', () => {
    it('can be called without error', async () => {
      const settings:Setting[] = []
      await expect(applyLlmSettings(settings)).resolves.toBeUndefined();
    });
  });

  describe('getMaxLlmSize()', () => {
    it('returns default memory value if no previous setting', () => {
      return expect(getMaxLlmSize()).resolves.toBe(8);
    });

    it('returns previously set value', async () => {
      theFakeStore[LLM_CATEGORY_KEY] = JSON.stringify([ MAX_LLM_SIZE_16 ]);
      return expect(getMaxLlmSize()).resolves.toBe(16);
    });

    it('returns default value if setting is not found', async () => {
      theFakeStore[LLM_CATEGORY_KEY] = JSON.stringify([AUTO_INC_ENABLED]);
      return expect(getMaxLlmSize()).resolves.toBe(8);
    });
  });

  describe('incrementMaxLlmSizeAfterSuccessfulLoad()', () => {
    it('does not change max size if auto-increment is off', async () => {
      theFakeStore[LLM_CATEGORY_KEY] = JSON.stringify([MAX_LLM_SIZE_16, AUTO_INC_DISABLED]);
      await incrementMaxLlmSizeAfterSuccessfulLoad(30);
      await expect(getMaxLlmSize()).resolves.toBe(16);    
    });

    it('does not change max size if new size is less than current', async () => {
      theFakeStore[LLM_CATEGORY_KEY] = JSON.stringify([MAX_LLM_SIZE_16, AUTO_INC_ENABLED]);
      await incrementMaxLlmSizeAfterSuccessfulLoad(8);
      await expect(getMaxLlmSize()).resolves.toBe(16);    
    });

    it('increments max size if new size is greater than current', async () => {
      theFakeStore[LLM_CATEGORY_KEY] = JSON.stringify([MAX_LLM_SIZE_16, AUTO_INC_ENABLED]);
      await incrementMaxLlmSizeAfterSuccessfulLoad(20);
      await expect(getMaxLlmSize()).resolves.toBe(20);    
    });

    it('increments max size to at least 1 if new size is less than 1', async () => {
      theFakeStore[LLM_CATEGORY_KEY] = JSON.stringify([{...MAX_LLM_SIZE_16, value:0}, AUTO_INC_ENABLED]);
      await incrementMaxLlmSizeAfterSuccessfulLoad(.7);
      await expect(getMaxLlmSize()).resolves.toBe(1);    
    });

  });
});