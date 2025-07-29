import { CSSProperties } from "react";

import Direction from "./types/Direction";
import Rect from "./types/Rect";
import { assert } from "@/common/assertUtil";
import { browserClientRect } from "@/common/windowUtil";

export const DEFAULT_DIRECTIONS:Direction[] = [Direction.ABOVE, Direction.BELOW, Direction.RIGHT, Direction.LEFT];

function _domRectToRect(rect:DOMRect):Rect {
  return {
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height
  };
}

function _calcAboveOffset(t:Rect, p:Rect):[dx:number, dy:number] {
  let left = t.left + Math.round((t.width - p.width) / 2);
  let top = t.top - p.height;
  return [left - p.left, top - p.top];
}

function _calcBelowOffset(t:Rect, p:Rect):[dx:number, dy:number] {
  let left = t.left + Math.round((t.width - p.width) / 2);
  let top = t.top + t.height;
  return [left - p.left, top - p.top];
}

function _calcLeftOffset(t:Rect, p:Rect):[dx:number, dy:number] {
  let left = t.left - p.width;
  let top = t.top + Math.round((t.height - p.height) / 2);
  return [left - p.left, top - p.top];
}

function _calcRightOffset(t:Rect, p:Rect):[dx:number, dy:number] {
  let left = t.left + t.width;
  let top = t.top + Math.round((t.height - p.height) / 2);
  return [left - p.left, top - p.top];
}

type OffsetFunction = (targetRect:Rect, popoverRect:Rect) => [dx:number, dy:number];

const offsetFunctions:OffsetFunction[] = [];
offsetFunctions[Direction.ABOVE] = _calcAboveOffset;
offsetFunctions[Direction.BELOW] = _calcBelowOffset;
offsetFunctions[Direction.LEFT] = _calcLeftOffset;
offsetFunctions[Direction.RIGHT] = _calcRightOffset;

export function getTryDirections(preferredDirection?: Direction | Direction[], allowedDirections?:Direction[]): Direction[] {
  if (preferredDirection === undefined) preferredDirection = DEFAULT_DIRECTIONS;
  /* v8 ignore next */
  assert(allowedDirections === undefined || allowedDirections.length > 0, "If allowedDirections is specified, it must be a non-empty array.");
  if (!Array.isArray(preferredDirection)) preferredDirection = [preferredDirection];
  const directions:Direction[] = [];
  preferredDirection.forEach(d => {if (!directions.includes(d) && (!allowedDirections || allowedDirections.includes(d))) directions.push(d) });
  DEFAULT_DIRECTIONS.forEach(d => {if (!directions.includes(d) && (!allowedDirections || allowedDirections.includes(d))) directions.push(d) });
  /* v8 ignore next */
  assert(directions.length > 0); // Since caller specified at least one allowed direction, there should be at least one direction in the result.
  return directions;
}

function _doesRectContainRect(containerRect:Rect, innerRect:Rect):boolean {
  return containerRect.left <= innerRect.left &&
         containerRect.top <= innerRect.top &&
         (containerRect.left + containerRect.width) >= (innerRect.left + innerRect.width) &&
         (containerRect.top + containerRect.height) >= (innerRect.top + innerRect.height);
}

function _fixOobRect(containerRect:Rect, innerRect:Rect):Rect {
  const rect = {...innerRect};
  if (innerRect.left < containerRect.left) {
    rect.left = containerRect.left;
  } else if ((innerRect.left + innerRect.width) > (containerRect.left + containerRect.width)) {
    rect.left = containerRect.left + containerRect.width - innerRect.width;
  }
  if (innerRect.top < containerRect.top) {
    rect.top = containerRect.top;
  } else if ((innerRect.top + innerRect.height) > (containerRect.top + containerRect.height)) {
    rect.top = containerRect.top + containerRect.height - innerRect.height;
  }
  return rect;
}

export function calcPopoverPositionStyle(tryDirections:Direction[], targetElement:HTMLDivElement, popoverContentElement:HTMLDivElement):CSSProperties {
  const targetRect = _domRectToRect(targetElement.getBoundingClientRect());
  const popoverRect = _domRectToRect(popoverContentElement.getBoundingClientRect());
  const browserRect = _domRectToRect(browserClientRect());
  const tryRect = {...popoverRect};

  let dx = 0, dy = 0, firstDx = 0, firstDy = 0, directionI = 0;
  for(; directionI < tryDirections.length; ++directionI) {
    const direction = tryDirections[directionI];
    [dx, dy] = offsetFunctions[direction](targetRect, popoverRect);
    if (directionI === 0) {
      firstDx = dx;
      firstDy = dy;
    }
    tryRect.left = popoverRect.left + dx;
    tryRect.top = popoverRect.top + dy;
    if (_doesRectContainRect(browserRect, tryRect)) break;
  }
  if (directionI === tryDirections.length) { // If no direction was in-bounds, use the first (most preferred) direction.
    tryRect.left = popoverRect.left + firstDx;
    tryRect.top = popoverRect.top + firstDy;
    const fixedRect = _fixOobRect(browserRect, tryRect);
    dx = fixedRect.left - popoverRect.left;
    dy = fixedRect.top - popoverRect.top;
  }

  return { transform: `translate(${dx}px, ${dy}px)` };
}