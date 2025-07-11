import { describe, expect, it } from "vitest";
import { isMovingAverageDataFormat } from "../MovingAverageData";

describe('MovingAverageData', () => {
  describe('isMovingAverageDataFormat()', () => {
    it('returns true for valid MovingAverageData format', () => {
      const data = {
        series: [1, 2, 3],
        seriesMax: 3,
        lastAverage: 2
      };
      expect(isMovingAverageDataFormat(data)).toBe(true);
    });

    it('returns false for invalid format (missing properties)', () => {
      const data = { series: [1, 2, 3] };
      expect(isMovingAverageDataFormat(data)).toBe(false);
    });

    it('returns false for invalid format (wrong types)', () => {
      const data = {
        series: [1, '2', 3],
        seriesMax: '3',
        lastAverage: 2
      };
      expect(isMovingAverageDataFormat(data)).toBe(false);
    });
  });
});