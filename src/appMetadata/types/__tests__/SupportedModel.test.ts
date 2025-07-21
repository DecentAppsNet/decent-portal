import { describe, it, expect, beforeEach } from "vitest";

import { duplicateSupportedModel, isSupportedModelFormat } from "../SupportedModel";

describe('SupportedModel', () => {
  describe('isSupportedModelFormat()', () => {
    let maybeModel:any = null;

    beforeEach(() => {
      maybeModel = {
        id:'MODEL_ID',
        appBehaviorSummary:'I love this model. So good.',
        beta:true
      }
    });

    it('returns true for a minimally correct object', () => {
      delete maybeModel.beta;
      expect(isSupportedModelFormat(maybeModel)).toBe(true);
    });

    it('return true for beta model', () => {
      expect(isSupportedModelFormat(maybeModel)).toBe(true);
    });

    it('returns false for missing ID', () => {
      delete maybeModel.id;
      expect(isSupportedModelFormat(maybeModel)).toBe(false);
    });

    it('returns false for missing appBehaviorSummary', () => {
      delete maybeModel.appBehaviorSummary;
      expect(isSupportedModelFormat(maybeModel)).toBe(false);
    });

    it('returns false for ID that is not a string', () => {
      maybeModel.id = 12345;
      expect(isSupportedModelFormat(maybeModel)).toBe(false);
    });

    it('returns false for appBehaviorSummary that is not a string', () => {
      maybeModel.appBehaviorSummary = 12345;
      expect(isSupportedModelFormat(maybeModel)).toBe(false);
    });

    it('returns false for beta that is not a boolean', () => {
      maybeModel.beta = 'not a boolean';
      expect(isSupportedModelFormat(maybeModel)).toBe(false);
    });

    it('returns false for null', () => {
      expect(isSupportedModelFormat(null)).toBe(false);
    });

    it('returns false for undefined', () => {
      expect(isSupportedModelFormat(undefined)).toBe(false);
    });

    it('returns false for non-object', () => {
      expect(isSupportedModelFormat(12345)).toBe(false);
      expect(isSupportedModelFormat('string')).toBe(false);
      expect(isSupportedModelFormat(true)).toBe(false);
      expect(isSupportedModelFormat([])).toBe(false);
    });
  });

  describe('duplicateSupportedModel()', () => {
    it('creates a copy of the model', () => {
      const originalModel = {
        id: 'MODEL_ID',
        appBehaviorSummary: 'I love this model. So good.',
        beta: true
      };
      const duplicatedModel = duplicateSupportedModel(originalModel);
      expect(duplicatedModel).toEqual(originalModel);
      expect(duplicatedModel).not.toBe(originalModel);
    });
  });
});