// Mocking first.

vi.mock('../../../common/windowUtil', async () => ({
  ...(await vi.importActual('../../../common/windowUtil')),
  browserClientRect: vi.fn(() => theBrowserClientRect),
}));

// Imports after mocking.

import { describe, it, expect, vi } from 'vitest';

import { calcPopoverPositionStyle, DEFAULT_DIRECTIONS, getTryDirections } from "../popOverUtil";
import Direction from '../types/Direction';
import { CSSProperties } from 'react';

function _rectToDOMRect(left:number, top:number, width:number, height:number):DOMRect {
  return {
    left, top, width, height,
    right: left + width,
    bottom: top + height,
    x: left, y: top,
    toJSON: () => ({ left, top, width, height, right: left + width, bottom: top + height, x: left, y: top })
  } as DOMRect;
}

let theBrowserClientRect:DOMRect = _rectToDOMRect(0, 0, 1000, 1000);

describe('popOverUtil', () => {
  describe('getTryDirections()', () => {
    it('returns default directions if preferred directions undefined', () => {
      expect(getTryDirections()).toEqual(DEFAULT_DIRECTIONS);
    });

    it('returns directions with single preferred direction at beginning', () => {
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

    describe('when allowed directions are specified', () => {
      it('returns default directions filtered by allowed directions if preferred directions undefined', () => {
        const ALLOWED = [Direction.RIGHT, Direction.BELOW];
        const EXPECTED = [Direction.BELOW, Direction.RIGHT];
        expect(getTryDirections(undefined, ALLOWED)).toEqual(EXPECTED);
      });

      it('returns directions with single preferred direction at beginning, filtered by allowed', () => {
        const ALLOWED = [Direction.LEFT, Direction.ABOVE, Direction.BELOW];
        const EXPECTED = [Direction.ABOVE, Direction.BELOW, Direction.LEFT];
        expect(getTryDirections(Direction.ABOVE, ALLOWED)).toEqual(EXPECTED);
      });

      it('returns directions with two preferred directions at beginning, filtered by allowed', () => {
        const ALLOWED = [Direction.LEFT, Direction.ABOVE, Direction.BELOW];
        const EXPECTED = [Direction.ABOVE, Direction.BELOW, Direction.LEFT];
        expect(getTryDirections([Direction.ABOVE, Direction.RIGHT], ALLOWED)).toEqual(EXPECTED);
      });

      it('returns directions with all preferred directions specified, filtered by allowed.', () => {
        const PREFERRED = [Direction.ABOVE, Direction.RIGHT, Direction.LEFT, Direction.BELOW]; 
        const EXPECTED = [Direction.ABOVE, Direction.LEFT, Direction.BELOW];
        const ALLOWED = [Direction.LEFT, Direction.ABOVE, Direction.BELOW];
        expect(getTryDirections(PREFERRED, ALLOWED)).toEqual(EXPECTED);
      });
    });
  });

  describe('calcPopoverPositionStyle()', () => {
    function _getTranslateCss(dx:number, dy:number):CSSProperties {
      return { transform: `translate(${dx}px, ${dy}px)` };
    }

    function _rectToElement(left:number, top:number, width:number, height:number):HTMLDivElement {
      return {
        getBoundingClientRect:() => (_rectToDOMRect(left, top, width, height)),
      } as HTMLDivElement;
    }

    it('returns translation of 0,0 when no try directions passed', () => {
      const tryDirections:Direction[] = [];
      const targetElement = _rectToElement(100,20,200,300);
      const popoverContentElement = _rectToElement(0,0,45,55);
      const expected = _getTranslateCss(0,0);
      expect(calcPopoverPositionStyle(tryDirections, targetElement, popoverContentElement)).toEqual(expected);
    });

    it('returns translation for popover to align above the target element', () => {
      const tryDirections:Direction[] = [Direction.ABOVE];
      const targetElement = _rectToElement(100,220,200,300);
      const popoverContentElement = _rectToElement(0,0,45,55);
      const expected = _getTranslateCss(178,165);
      expect(calcPopoverPositionStyle(tryDirections, targetElement, popoverContentElement)).toEqual(expected);
    });

    it('returns translation for popover to align below the target element', () => {
      const tryDirections:Direction[] = [Direction.BELOW];
      const targetElement = _rectToElement(100,220,200,300);
      const popoverContentElement = _rectToElement(0,0,45,55);
      const expected = _getTranslateCss(178,520);
      expect(calcPopoverPositionStyle(tryDirections, targetElement, popoverContentElement)).toEqual(expected);
    });

    it('returns translation for popover to align left of the target element', () => {
      const tryDirections:Direction[] = [Direction.LEFT];
      const targetElement = _rectToElement(100,220,200,300);
      const popoverContentElement = _rectToElement(0,0,45,55);
      const expected = _getTranslateCss(55,343);
      expect(calcPopoverPositionStyle(tryDirections, targetElement, popoverContentElement)).toEqual(expected);
    });

    it('returns translation for popover to align right of the target element', () => {
      const tryDirections:Direction[] = [Direction.RIGHT];
      const targetElement = _rectToElement(100,220,200,300);
      const popoverContentElement = _rectToElement(0,0,45,55);
      const expected = _getTranslateCss(300,343);
      expect(calcPopoverPositionStyle(tryDirections, targetElement, popoverContentElement)).toEqual(expected);
    });

    it('adjusts translation to fit beneath top of screen', () => {
      const tryDirections:Direction[] = [Direction.ABOVE];
      const targetElement = _rectToElement(100,20,200,300);
      const popoverContentElement = _rectToElement(0,0,45,55);
      const expected = _getTranslateCss(178,0);
      expect(calcPopoverPositionStyle(tryDirections, targetElement, popoverContentElement)).toEqual(expected);
    });

    it('adjusts translation to fit above bottom of screen', () => {
      const tryDirections:Direction[] = [Direction.BELOW];
      const targetElement = _rectToElement(100,920,200,300);
      const popoverContentElement = _rectToElement(0,0,45,55);
      const expected = _getTranslateCss(178,945);
      expect(calcPopoverPositionStyle(tryDirections, targetElement, popoverContentElement)).toEqual(expected);
    });

    it('adjusts translation to fit within left side of screen', () => {
      const tryDirections:Direction[] = [Direction.LEFT];
      const targetElement = _rectToElement(10,20,200,300);
      const popoverContentElement = _rectToElement(0,0,45,55);
      const expected = _getTranslateCss(0,143);
      expect(calcPopoverPositionStyle(tryDirections, targetElement, popoverContentElement)).toEqual(expected);
    });

    it('adjusts translation to fit within right side of screen', () => {
      const tryDirections:Direction[] = [Direction.RIGHT];
      const targetElement = _rectToElement(780,20,200,300);
      const popoverContentElement = _rectToElement(0,0,45,55);
      const expected = _getTranslateCss(955,143);
      expect(calcPopoverPositionStyle(tryDirections, targetElement, popoverContentElement)).toEqual(expected);
    });

    it('uses first of two try directions if first fits within screen dimensions', () => {
      const tryDirections:Direction[] = [Direction.RIGHT, Direction.ABOVE];
      const targetElement = _rectToElement(480,120,200,300);
      const popoverContentElement = _rectToElement(0,0,45,55);
      const expected = _getTranslateCss(480+200, 243);
      expect(calcPopoverPositionStyle(tryDirections, targetElement, popoverContentElement)).toEqual(expected);
    });

    it('uses second try direction if first would not fit within screen dimensions', () => {
      const tryDirections:Direction[] = [Direction.RIGHT, Direction.ABOVE];
      const targetElement = _rectToElement(780,120,200,300);
      const popoverContentElement = _rectToElement(0,0,45,55);
      const expected = _getTranslateCss(858, 120-55);
      expect(calcPopoverPositionStyle(tryDirections, targetElement, popoverContentElement)).toEqual(expected);
    });

    it('uses first try direction if all try directions would not fit within screen dimensions', () => {
      const tryDirections:Direction[] = [Direction.RIGHT, Direction.ABOVE, Direction.LEFT, Direction.BELOW];
      const targetElement = _rectToElement(250,250,500,500);
      const popoverContentElement = _rectToElement(0,0,500,500);
      const expected = _getTranslateCss(500, 250);
      expect(calcPopoverPositionStyle(tryDirections, targetElement, popoverContentElement)).toEqual(expected);
    });
  });
});