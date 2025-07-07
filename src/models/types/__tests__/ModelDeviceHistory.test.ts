import { describe, expect, it } from "vitest";

import { isModelDeviceHistoryFormat } from "../ModelDeviceHistory";

describe("ModelDeviceHistory", () => {
  describe("isModelDeviceHistoryFormat()", () => {
    it("returns true for valid ModelDeviceHistory format", () => {
      const validHistory = {
        loadSuccessRate: { series: [0.9, 0.95], seriesMax: 10, lastAverage: 0.925 },
        loadTime: { series: [100, 200], seriesMax: 10, lastAverage: 150 },
        inputTokensPerSec: { series: [1000, 1500], seriesMax: 10, lastAverage: 1250 },
        outputTokensPerSec: { series: [800, 1200], seriesMax: 10, lastAverage: 1000 }
      };
      expect(isModelDeviceHistoryFormat(validHistory)).toBe(true);
    });

    it("returns false for invalid ModelDeviceHistory format", () => {
      const invalidHistory = {
        loadSuccessRate: { series: [0.9, "invalid"], seriesMax: 10, lastAverage: 0.925 },
        loadTime: { series: [100, 200], seriesMax: 10, lastAverage: 150 },
        inputTokensPerSec: { series: [1000, 1500], seriesMax: 10, lastAverage: 1250 }
      };
      expect(isModelDeviceHistoryFormat(invalidHistory)).toBe(false);
    });
  });
});