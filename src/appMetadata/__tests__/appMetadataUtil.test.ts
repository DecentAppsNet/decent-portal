// Mocking first.

vi.mock('../fetchAppMetaData', async () => ({
  ...(await vi.importActual('../fetchAppMetaData')),
  fetchAppMetadataText: vi.fn(() => theAppMetaDataText),
}));

// Imports after mocking.
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { getAppMetaData, clearAppMetaDataCache, getAppName, initAppMetaData, getAppId } from '../appMetadataUtil';

let theAppMetaDataText:string = '';

describe('appMetadataUtil', () => {
  describe('getAppMetaData()', () => {
    beforeEach(() => {
      clearAppMetaDataCache();
    });

    it('returns app metadata from cache', async () => {
      theAppMetaDataText = JSON.stringify({
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
      });
      const metaData = await getAppMetaData();
      expect(metaData.id).toBe("APP_ID");
      expect(metaData.name).toBe("Test App");
      expect(metaData.description).toBe("This is a test app.");
      expect(metaData.supportedModels.length).toBe(1);
      expect(metaData.supportedModels[0].id).toBe("MODEL_ID");
      expect(metaData.supportedModels[0].appBehaviorSummary).toBe("I love this model. So good.");
      expect(metaData.supportedModels[0].beta).toBe(true);
    });

    it('returns cached app metadata even if file changed', async () => {
      theAppMetaDataText = JSON.stringify({
        id: "APP_ID",
        name: "Test App",
        description: "This is a test app.",
        supportedModels: []
      });
      const metaData1 = await getAppMetaData();
      expect(metaData1.id).toBe("APP_ID");
      theAppMetaDataText = 'something else';
      const metaData2 = await getAppMetaData();
      expect(metaData2.id).toBe("APP_ID");
    });

    it('throws if metadata JSON is invalid', async () => {
      theAppMetaDataText = '{ invalid json }';
      await expect(getAppMetaData()).rejects.toThrow();
    });

    it('throws if metadata format is invalid', async () => {
      theAppMetaDataText = JSON.stringify({
        id: "APP_ID",
        name: "Test App",
        description: "This is a test app.",
        supportedModels: "not an array", // Invalid format
      });
      await expect(getAppMetaData()).rejects.toThrow('Invalid app metadata format.');
    });
  });

  describe('getAppName()', () => {
    beforeEach(() => {
      clearAppMetaDataCache();
    });

    it('throws if metadata not loaded', async () => {
      expect(() => getAppName()).toThrow();
    });

    it('returns app name from metadata', async () => {
      theAppMetaDataText = JSON.stringify({
        id: "APP_ID",
        name: "Test App",
        description: "This is a test app.",
        supportedModels: []
      });
      await initAppMetaData();
      const appName = getAppName();
      expect(appName).toBe("Test App");
    });
  });

  describe('getAppId()', () => {
    beforeEach(() => {
      clearAppMetaDataCache();
    });

    it('throws if metadata not loaded', async () => {
      expect(() => getAppId()).toThrow();
    });

    it('returns app ID from metadata', async () => {
      theAppMetaDataText = JSON.stringify({
        id: "APP_ID",
        name: "Test App",
        description: "This is a test app.",
        supportedModels: []
      });
      await initAppMetaData();
      const appId = getAppId();
      expect(appId).toBe("APP_ID");
    });

    it('calling initAppMetaData() twice is idempotent', async () => {
      theAppMetaDataText = JSON.stringify({
        id: "APP_ID",
        name: "Test App",
        description: "This is a test app.",
        supportedModels: []
      });
      await initAppMetaData();
      await initAppMetaData(); // Call again to check idempotency
      const appId = getAppId();
      expect(appId).toBe("APP_ID");
    });
  });
});