import { describe, it, expect } from 'vitest';

import { getTryDirections } from "../popOverUtil";
import Direction from '../types/Direction';

const DEFAULT_DIRECTIONS:Direction[] = [Direction.ABOVE, Direction.BELOW, Direction.RIGHT, Direction.LEFT];

describe('popOverUtil', () => {
  describe('getTryDirections()', () => {
    it('returns default directions if preferred directions undefined', () => {
      expect(getTryDirections()).toEqual(DEFAULT_DIRECTIONS);
    });

    it.only('returns directions with single preferred direction at beginning', () => {
      const EXPECTED = [Direction.ABOVE, Direction.BELOW, Direction.RIGHT, Direction.LEFT];
      expect(getTryDirections(Direction.ABOVE)).toEqual(EXPECTED);
    });

    it('returns directions with two preferred directions at beginning', () => {
      const EXPECTED = [Direction.ABOVE, Direction.RIGHT, Direction.BELOW, Direction.LEFT];
      expect(getTryDirections([Direction.ABOVE, Direction.RIGHT])).toEqual(EXPECTED);
    });

    it('returns directions with all preferred directions specified', () => {
      const EXPECTED = [Direction.ABOVE, Direction.RIGHT, Direction.LEFT, Direction.BELOW];
      expect(getTryDirections(EXPECTED)).toEqual(EXPECTED);
    });

    it('excludes duplicates from preferred directions', () => {
      const EXPECTED = [Direction.ABOVE, Direction.RIGHT, Direction.BELOW, Direction.LEFT];
      expect(getTryDirections([Direction.ABOVE, Direction.RIGHT, Direction.ABOVE, Direction.RIGHT])).toEqual(EXPECTED);
    });
  });
});