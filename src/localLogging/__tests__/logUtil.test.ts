// Mocks first before importing modules that may use them.

vi.mock("@/persistence/pathStore", async () => ({
  ...(await vi.importActual("@/persistence/pathStore")),
  getText: vi.fn(async (key:string) => Promise.resolve(theFakeStore[key] ?? null)),
  setText: vi.fn(async (key:string, value:string) => {
    if (theFakeStoreSetTextShouldThrow) { throw new Error(`setText() failed`); }
    theFakeStore[key] = value;
    return Promise.resolve();
  }),
  getAllKeysAtPath: vi.fn(async (_path:string) => Promise.resolve(Object.keys(theFakeStore))),
  deleteByKey: vi.fn(async (key:string) => {
    delete theFakeStore[key];
    return Promise.resolve();
  })
}));

vi.mock("@/common/dateUtil", async () => ({
  ...(await vi.importActual("@/common/dateUtil")),
  now: vi.fn(() => theFakeTimestamp)
}));

// Imports after mocks.
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getDayPath } from '@/persistence/localLog';
import { applyLoggingSettings, deleteAllLogMessages, deleteOldLogMessages, log, setAppName, setWriteDelay  } from '../logUtil';
import { LOGGING_SETTING_ENABLE, LOGGING_SETTING_MAX_RETENTION_DAYS } from '@/settings/categories/loggingSettingsUtil';
import { wait } from '@/common/waitUtil';
import SettingValues from '@/settings/types/SettingValues';

let theFakeStore:Record<string, any> = {};
let theFakeStoreSetTextShouldThrow = false;
let theFakeTimestamp = 0; // Way back in 1970.
const DAY = 24 * 60 * 60 * 1000;
const TODAY_PATH = getDayPath(0);
const TODAY_KEY = `/log/${TODAY_PATH}.txt`;
const DEFAULT_LOGGING_SETTINGS:SettingValues = {
  [LOGGING_SETTING_ENABLE]:true,
  [LOGGING_SETTING_MAX_RETENTION_DAYS]:7
};

describe('logUtil', () => {
  describe('log()', () => {
    beforeEach(() => {
      theFakeStore = {};
      theFakeStoreSetTextShouldThrow = false;
      theFakeTimestamp = 0;
      setWriteDelay(1);
    });

    it('logs nothing if settings not applied', () => {
      const originalConsoleWarn = console.warn;
      console.warn = vi.fn();
      log('something');
      console.warn = originalConsoleWarn;
      expect(theFakeStore[TODAY_KEY]).toBeUndefined();
    });

    it('logs nothing if logging disabled', async () => {
      const settingValues:SettingValues = {...DEFAULT_LOGGING_SETTINGS, [LOGGING_SETTING_ENABLE]:false};
      await applyLoggingSettings(settingValues);
      log('something');
      expect(theFakeStore[TODAY_KEY]).toBeUndefined();
    });

    it('logs text with immediate flush', async () => {
      await applyLoggingSettings(DEFAULT_LOGGING_SETTINGS);
      await log('something', true);
      const logText = theFakeStore[TODAY_KEY];
      expect(logText).toBeDefined();
      expect(logText).toContain('something');
    });

    it('logs text with delayed flush', async () => {
      await applyLoggingSettings(DEFAULT_LOGGING_SETTINGS);
      await log('something');
      expect(theFakeStore[TODAY_KEY]).toBeUndefined(); // Not flushed yet.
      await wait(100);
      const logText = theFakeStore[TODAY_KEY];
      expect(logText).toBeDefined();
      expect(logText).toContain('something');
    });

    it('handles writes across days', async () => {
      await applyLoggingSettings(DEFAULT_LOGGING_SETTINGS);
      await log('something');
      theFakeTimestamp += DAY;
      await log('something else');
      const nextDayKey = `/log/${getDayPath(theFakeTimestamp)}.txt`;
      await wait(100); // Allow time for the delayed write to complete.
      
      expect(theFakeStore[TODAY_KEY]).toBeDefined();
      expect(theFakeStore[TODAY_KEY]).toContain('something');
      expect(theFakeStore[nextDayKey]).toBeDefined();
      expect(theFakeStore[nextDayKey]).toContain('something else');
    });
  });

  describe('setAppName()', () => {
    beforeEach(() => {
      theFakeStore = {};
      theFakeStoreSetTextShouldThrow = false;
      theFakeTimestamp = 0;
      setWriteDelay(1);
    });

    it('logs a day separator when app name is set', async () => {
      await applyLoggingSettings(DEFAULT_LOGGING_SETTINGS);
      setAppName('StupidApp');
      await wait(100);
      const logText = theFakeStore[TODAY_KEY];
      expect(logText).toBeDefined();
      expect(logText).toContain('StupidApp');
    });
  });

  describe('deleteAllLogMessages()', () => {
    beforeEach(() => {
      theFakeStore = {};
      theFakeStoreSetTextShouldThrow = false;
      theFakeTimestamp = 0;
      setWriteDelay(1);
    });

    it('deletes all log messages', async () => {
      await applyLoggingSettings(DEFAULT_LOGGING_SETTINGS);
      await log('something', true);
      expect(theFakeStore[TODAY_KEY]).toBeDefined();
      await deleteAllLogMessages();
      expect(theFakeStore[TODAY_KEY]).toBeUndefined();
    });

    it('handles deletion when no logs exist', async () => {
      await applyLoggingSettings(DEFAULT_LOGGING_SETTINGS);
      await deleteAllLogMessages();
      expect(theFakeStore[TODAY_KEY]).toBeUndefined();
    });
  });

  describe('deleteOldLogMessages()', () => {
    beforeEach(() => {
      theFakeStore = {};
      theFakeStoreSetTextShouldThrow = false;
      theFakeTimestamp = 0;
      setWriteDelay(1);
    });

    it('deletes logs older than max retention days', async () => {
      const settings:SettingValues = {...DEFAULT_LOGGING_SETTINGS, [LOGGING_SETTING_MAX_RETENTION_DAYS]:1};
      await applyLoggingSettings(settings);
      await log('something', true);
      expect(theFakeStore[TODAY_KEY]).toBeDefined();
      
      theFakeTimestamp += DAY;
      await log('something else', true);
      const nextDayKey = `/log/${getDayPath(theFakeTimestamp)}.txt`;
      expect(theFakeStore[nextDayKey]).toBeDefined();
      
      await deleteOldLogMessages();
      
      expect(theFakeStore[TODAY_KEY]).toBeUndefined();
      expect(theFakeStore[nextDayKey]).toBeDefined();
    });
  });

  describe('applyLoggingSettings()', () => {
    beforeEach(() => {
      theFakeStore = {};
      theFakeStoreSetTextShouldThrow = false;
      theFakeTimestamp = 0;
      setWriteDelay(1);
    });

    it('applies logging settings and deletes old logs', async () => {
      const settings:SettingValues = {...DEFAULT_LOGGING_SETTINGS, [LOGGING_SETTING_MAX_RETENTION_DAYS]:1};
      await applyLoggingSettings(settings);
      await log('something', true);
      expect(theFakeStore[TODAY_KEY]).toBeDefined();
      
      theFakeTimestamp += DAY * 2; // Move to two days later.
      await applyLoggingSettings(settings);
      
      expect(theFakeStore[TODAY_KEY]).toBeUndefined(); // Should have deleted the first day.
    });
  });
});