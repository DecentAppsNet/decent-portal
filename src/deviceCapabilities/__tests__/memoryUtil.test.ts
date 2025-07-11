import { describe, it, expect } from 'vitest';
import { KILOBYTE, MEGABYTE, GIGABYTE, estimateSystemMemory, byteCountToKb, byteCountToGb, byteCountToMb, formatByteCount, bytesPerMsecToGbPerSec, mbToGb } from '../memoryUtil';

describe('memoryUtil', () => {
  describe('constants', () => {
    it('we got them', () => {
      expect(KILOBYTE).toBe(1024);
      expect(MEGABYTE).toBe(1024 * KILOBYTE);
      expect(GIGABYTE).toBe(1024 * MEGABYTE);
    });
  });

  describe('estimateSystemMemory()', () => {
    it('returns a number > 0 in test runner environment', () => {
      const memory = estimateSystemMemory();
      expect(typeof memory).toBe('number');
      expect(memory).toBeGreaterThanOrEqual(0);
    });
  });

  describe('byteCountToKb()', () => {
    it('converts bytes to kilobytes', () => {
      expect(byteCountToKb(1024)).toBe(1);
      expect(byteCountToKb(2048)).toBe(2);
      expect(byteCountToKb(1536, 2)).toBe(1.50);
    });
  });

  describe('byteCountToMb()', () => {
    it('converts bytes to megabytes', () => {
      expect(byteCountToMb(1024 * 1024)).toBe(1);
      expect(byteCountToMb(2048 * 1024)).toBe(2);
      expect(byteCountToMb(1536 * 1024, 1)).toBe(1.5);
    });
  });

  describe('byteCountToGb()', () => {
    it('converts bytes to gigabytes', () => {
      expect(byteCountToGb(1024 * 1024 * 1024)).toBe(1);
      expect(byteCountToGb(2048 * 1024 * 1024)).toBe(2);
      expect(byteCountToGb(1536 * 1024 * 1024, 1)).toBe(1.5);
    });
  });

  describe('formatByteCount()', () => {
    it('formats byte counts correctly', () => {
      expect(formatByteCount(0)).toBe('0 B');
      expect(formatByteCount(500)).toBe('500 B');
      expect(formatByteCount(1500)).toBe('1.5 KB');
      expect(formatByteCount(1500000)).toBe('1.4 MB');
      expect(formatByteCount(1500000000)).toBe('1.4 GB');
      expect(formatByteCount(1500000000000)).toBe('1397 GB');
    });
  });

  describe('bytesPerMsecToGbPerSec()', () => {
    it('converts bytes per millisecond to gigabytes per second', () => {
      expect(bytesPerMsecToGbPerSec(1024 * 1024)).toBe(1);
      expect(bytesPerMsecToGbPerSec(1024 * 1024 * 1024)).toBe(1000);
      expect(bytesPerMsecToGbPerSec(2048 * 1024 * 1024 + 1024, 4)).toBe(2000.001);
    });
  });

  describe('mbToGb()', () => {
    it('converts megabytes to gigabytes', () => {
      expect(mbToGb(1024)).toBe(1);
      expect(mbToGb(2048)).toBe(2);
      expect(mbToGb(1536, 1)).toBe(1.5);
    });
  });
});