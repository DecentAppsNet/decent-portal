import { describe, it, expect, beforeEach } from "vitest";

import { isAppMetaDataFormat } from "../AppMetaData";

describe("AppMetaData", () => {
  describe("isAppMetaDataFormat()", () => {
    let maybeAppMetaData: any = null;

    beforeEach(() => {
      maybeAppMetaData = {
        id: "APP_ID",
        name: "Test App",
        description: "This is a test app.",
        supportedModels: [
          {
            id: "MODEL_ID",
            appBehaviorSummary: "I love this model. So good.",
            beta: true,
          },
        ],
      };
    });

    it("returns true for a minimally correct object", () => {
      maybeAppMetaData.supportedModels = [];
      expect(isAppMetaDataFormat(maybeAppMetaData)).toBe(true);
    });

    it("returns true for a correct object with models", () => {
      expect(isAppMetaDataFormat(maybeAppMetaData)).toBe(true);
    });

    it("returns false for missing ID", () => {
      delete maybeAppMetaData.id;
      expect(isAppMetaDataFormat(maybeAppMetaData)).toBe(false);
    });

    it("returns false for missing name", () => {
      delete maybeAppMetaData.name;
      expect(isAppMetaDataFormat(maybeAppMetaData)).toBe(false);
    });

    it("returns false for missing description", () => {
      delete maybeAppMetaData.description;
      expect(isAppMetaDataFormat(maybeAppMetaData)).toBe(false);
    });

    it("returns false for missing supportedModels", () => {
      delete maybeAppMetaData.supportedModels;
      expect(isAppMetaDataFormat(maybeAppMetaData)).toBe(false);
    });

    it("returns false for supportedModels that is not an array", () => {
      maybeAppMetaData.supportedModels = "not an array";
      expect(isAppMetaDataFormat(maybeAppMetaData)).toBe(false);
    });

    it("returns false for supportedModels with invalid entries", () => {
      maybeAppMetaData.supportedModels = [{ id: 12345 }];
      expect(isAppMetaDataFormat(maybeAppMetaData)).toBe(false);
    });

    it("returns false for null", () => {
      expect(isAppMetaDataFormat(null)).toBe(false);
    });

    it("returns false for undefined", () => {
      expect(isAppMetaDataFormat(undefined)).toBe(false);
    });

    it("returns false for non-object", () => {
      expect(isAppMetaDataFormat(12345)).toBe(false);
      expect(isAppMetaDataFormat("string")).toBe(false);
      expect(isAppMetaDataFormat(true)).toBe(false);
      expect(isAppMetaDataFormat([])).toBe(false);
    });
  });
});