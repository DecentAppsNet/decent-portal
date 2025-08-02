// Mocks first before importing modules that may use them.

vi.mock("@/deviceCapabilities/memoryUtil", async () => ({
  ...(await vi.importActual("@/deviceCapabilities/memoryUtil")),
  estimateSystemMemory: vi.fn(() => theSystemMemory)
}));

vi.mock("@/deviceCapabilities/storageUtil", async () => ({
  ...(await vi.importActual("@/deviceCapabilities/storageUtil")),
  estimateAvailableStorage: vi.fn(() => theAvailableStorage)
}));

vi.mock('@/deviceCapabilities/featureUtil', async () => ({
  ...(await vi.importActual('@/deviceCapabilities/featureUtil')),
  hasWebGpuSupport: vi.fn(() => theHasWebGpuSupport)
}));

vi.mock('@/persistence/deviceHistory', async () => ({
  ...(await vi.importActual("@/persistence/deviceHistory")),
  getModelDeviceHistory: vi.fn(() => theModelDeviceHistory),
  setModelDeviceHistory: vi.fn((_id, next) => { theModelDeviceHistory = next; })
}));

vi.mock("@/developer/devEnvUtil", async () => ({
  ...(await vi.importActual("@/developer/devEnvUtil")),
  isServingLocally: vi.fn(() => theIsServingLocally)
}));

vi.mock("@/settings/categories/llmSettingsUtil", async () => ({
  ...(await vi.importActual("@/settings/categories/llmSettingsUtil")),
  getMaxLlmSize: vi.fn(() => Promise.resolve(theSystemMemory)),
  incrementMaxLlmSizeAfterSuccessfulLoad: vi.fn(() => Promise.resolve())
}));

vi.mock('@/appMetaData/appMetaDataUtil', async () => ({
  ...(await vi.importActual('@/appMetaData/appMetaDataUtil')),
  getAppMetaData: vi.fn(() => Promise.resolve(theAppMetaData))
}));

vi.mock('@/settings/categories/appSettingsUtil', async () => ({
  ...(await vi.importActual('@/settings/categories/appSettingsUtil')),
  getAppSettings: vi.fn(() => Promise.resolve({ [APP_SETTINGS_LLM_ID]: theAppSettingsModelId }))
}));


// Import section after mocking.
import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";

import ModelDeviceHistory from "../types/ModelDeviceHistory";
import { createMovingAverage, updateMovingAverage } from "@/common/movingAverageUtil";
import ModelDeviceProblem from "../types/ModelDeviceProblem";
import ModelDeviceProblemType from "../types/ModelDeviceProblemType";
import { INPUT_TOKENS_SAMPLE_COUNT, LOAD_SUCCESS_RATE_SAMPLE_COUNT, LOAD_TIME_SAMPLE_COUNT, OUTPUT_TOKENS_SAMPLE_COUNT } from "@/persistence/deviceHistory";
import { clearCachedModelInfo, findBestModel, predictModelDeviceProblems, scoreModel, updateModelDeviceLoadHistory, updateModelDevicePerformanceHistory } from "../modelUtil";
import AppMetaData from "@/appMetadata/types/AppMetaData";
import { APP_SETTINGS_LLM_ID } from "@/settings/categories/appSettingsUtil";
import { AUTO_SELECT_ID } from "@/settings/settingsDialog/setters/interactions/models";

// These constants based on model settings found at https://github.com/mlc-ai/web-llm/blob/main/src/config.ts
const MODEL_ID = "Llama-3.1-8B-Instruct-q4f32_1-MLC-1k";
const ALT_MODEL_ID = 'Llama-3-70B-Instruct-q3f16_1-MLC';

let theSystemMemory = 0;
let theAvailableStorage = 0;
let theHasWebGpuSupport = true;
let theModelDeviceHistory:ModelDeviceHistory = _createModelDeviceHistory();
let theIsServingLocally = false;
let theAppMetaData:AppMetaData = _createAppMetaData();
let theAppSettingsModelId:string = AUTO_SELECT_ID;

function _createModelDeviceHistory():ModelDeviceHistory {
  return {
    loadSuccessRate: createMovingAverage(LOAD_SUCCESS_RATE_SAMPLE_COUNT),
    loadTime: createMovingAverage(LOAD_TIME_SAMPLE_COUNT),
    inputCharsPerSec: createMovingAverage(INPUT_TOKENS_SAMPLE_COUNT),
    outputCharsPerSec: createMovingAverage(OUTPUT_TOKENS_SAMPLE_COUNT),
  };
};

function _createAppMetaData():AppMetaData {
  return {
    id: "test-app",
    name: "Test App",
    description: "This is a test app.",
    supportedModels: [
      { id: MODEL_ID, appBehaviorSummary: "This is a test model.", beta: false },
      { id: ALT_MODEL_ID, appBehaviorSummary: "This is an alternative test model.", beta: true }
    ]
  };
}

function _findProblemFromResult(result:any, type:ModelDeviceProblemType):ModelDeviceProblem {
  expect(!!result || !Array.isArray(result));
  const problems:ModelDeviceProblem[] = result as unknown as ModelDeviceProblem[];
  const problem = problems.find(p => p.type === type);
  expect(!!problem);
  return problem as ModelDeviceProblem;
}

describe('modelUtil', () => {
  describe("predictModelDeviceProblems()", () => {
    let uniqueProblemDescriptions:string[] = [];

    beforeEach(() => { // Initialize to a good value, and let tests update it as wanted.
      theSystemMemory = 8;
      theAvailableStorage = 100;
      theHasWebGpuSupport = true;
      clearCachedModelInfo();
      theModelDeviceHistory = _createModelDeviceHistory();
    });

    it('returns null for no predicted problems', async () => {
      theSystemMemory = 8;
      theAvailableStorage = 100;
      const result = await predictModelDeviceProblems(MODEL_ID);
      expect(result).toBeNull();
    });

    it('throws if model ID is not found', async () => {
      const badModelId = "not-a-real-model";
      await expect(predictModelDeviceProblems(badModelId)).rejects.toThrow(`Model ${badModelId} not found or has no required memory.`);
    });

    it('can make predictions for same model', async () => {
      const result = await predictModelDeviceProblems(MODEL_ID);
      expect(result).toBeNull();
      const result2 = await predictModelDeviceProblems(MODEL_ID);
      expect(result2).toBeNull();
    });

    it('can make predictions for different models', async () => {
      const result = await predictModelDeviceProblems(MODEL_ID);
      expect(result).toBeNull();
      const altResult = await predictModelDeviceProblems(ALT_MODEL_ID);
      expect(altResult).not.toBeNull();
    });

    describe('when WebGPU is not available', () => {
      it('returns WEBGPU_NOT_AVAILABLE', async () => {
        theHasWebGpuSupport = false;
        const result = await predictModelDeviceProblems(MODEL_ID);
        expect(result).not.toBeNull();
        const problems:ModelDeviceProblem[] = result as unknown as ModelDeviceProblem[];
        expect(problems.length).toBe(1);
        expect(problems[0].type).toBe(ModelDeviceProblemType.WEBGPU_NOT_AVAILABLE);
      });
    });

    describe('when past load history has failures', () => {
      it('returns BAD_LOAD_SUCCESS_HISTORY', async () => {
        updateMovingAverage(0, theModelDeviceHistory.loadSuccessRate);
        const result = await predictModelDeviceProblems(MODEL_ID);
        expect(result).not.toBeNull();
        const problems:ModelDeviceProblem[] = result as unknown as ModelDeviceProblem[];
        expect(problems.length).toBe(1);
        expect(problems[0].type).toBe(ModelDeviceProblemType.BAD_LOAD_SUCCESS_HISTORY);
      });

      it('returns a unique description for one failed attempt in history', async () => {
        updateMovingAverage(0, theModelDeviceHistory.loadSuccessRate);
        const result = (await predictModelDeviceProblems(MODEL_ID));
        const problem = _findProblemFromResult(result, ModelDeviceProblemType.BAD_LOAD_SUCCESS_HISTORY);
        expect(uniqueProblemDescriptions.includes(problem.description)).toBeFalsy();
        uniqueProblemDescriptions.push(problem.description);
      });

      it('returns a unique description for 100% failed attempts less than the maximum samples', async () => {
        updateMovingAverage(0, theModelDeviceHistory.loadSuccessRate);
        updateMovingAverage(0, theModelDeviceHistory.loadSuccessRate);
        const result = (await predictModelDeviceProblems(MODEL_ID));
        const problem = _findProblemFromResult(result, ModelDeviceProblemType.BAD_LOAD_SUCCESS_HISTORY);
        expect(uniqueProblemDescriptions.includes(problem.description)).toBeFalsy();
        uniqueProblemDescriptions.push(problem.description);
      });

      it('returns a unique description for 100% failed attempts matching maximum samples', async () => {
        updateMovingAverage(0, theModelDeviceHistory.loadSuccessRate);
        updateMovingAverage(0, theModelDeviceHistory.loadSuccessRate);
        updateMovingAverage(0, theModelDeviceHistory.loadSuccessRate);
        updateMovingAverage(0, theModelDeviceHistory.loadSuccessRate);
        const result = (await predictModelDeviceProblems(MODEL_ID));
        const problem = _findProblemFromResult(result, ModelDeviceProblemType.BAD_LOAD_SUCCESS_HISTORY);
        expect(uniqueProblemDescriptions.includes(problem.description)).toBeFalsy();
        uniqueProblemDescriptions.push(problem.description);
      });

      it('returns a unique description for < 100% failed attempts where the latest attempt failed', async () => {
        updateMovingAverage(1, theModelDeviceHistory.loadSuccessRate);
        updateMovingAverage(0, theModelDeviceHistory.loadSuccessRate);
        const result = (await predictModelDeviceProblems(MODEL_ID));
        const problem = _findProblemFromResult(result, ModelDeviceProblemType.BAD_LOAD_SUCCESS_HISTORY);
        expect(uniqueProblemDescriptions.includes(problem.description)).toBeFalsy();
        uniqueProblemDescriptions.push(problem.description);
      });

      it('returns a unique description for < 100% failed attempts where the latest attempt succeeded', async () => {
        updateMovingAverage(0, theModelDeviceHistory.loadSuccessRate);
        updateMovingAverage(1, theModelDeviceHistory.loadSuccessRate);
        const result = (await predictModelDeviceProblems(MODEL_ID));
        const problem = _findProblemFromResult(result, ModelDeviceProblemType.BAD_LOAD_SUCCESS_HISTORY);
        expect(uniqueProblemDescriptions.includes(problem.description)).toBeFalsy();
        uniqueProblemDescriptions.push(problem.description);
      });
    });

    describe('when past performance history is bad', () => {
      let uniqueProblemDescriptions:string[] = [];

      it('returns BAD_PERFORMANCE_HISTORY', async () => {
        updateMovingAverage(0.1, theModelDeviceHistory.inputCharsPerSec);
        const result = await predictModelDeviceProblems(MODEL_ID);
        expect(result).not.toBeNull();
        const problems:ModelDeviceProblem[] = result as unknown as ModelDeviceProblem[];
        expect(problems.length).toBe(1);
        expect(problems[0].type).toBe(ModelDeviceProblemType.BAD_PERFORMANCE_HISTORY);
      });

      it('returns a unique description for input rate being slow', async () => {
        updateMovingAverage(0.1, theModelDeviceHistory.inputCharsPerSec);
        const result = await predictModelDeviceProblems(MODEL_ID);
        const problem = _findProblemFromResult(result, ModelDeviceProblemType.BAD_PERFORMANCE_HISTORY);
        expect(uniqueProblemDescriptions.includes(problem.description)).toBeFalsy();
        uniqueProblemDescriptions.push(problem.description);
      });

      it('returns a unique description for output rate being slow', async () => {
        updateMovingAverage(0.1, theModelDeviceHistory.outputCharsPerSec);
        const result = await predictModelDeviceProblems(MODEL_ID);
        const problem = _findProblemFromResult(result, ModelDeviceProblemType.BAD_PERFORMANCE_HISTORY);
        expect(uniqueProblemDescriptions.includes(problem.description)).toBeFalsy();
        uniqueProblemDescriptions.push(problem.description);
      });

      it('returns a unique description for input and output rate being slow', async () => {
        updateMovingAverage(0.1, theModelDeviceHistory.inputCharsPerSec);
        updateMovingAverage(0.1, theModelDeviceHistory.outputCharsPerSec);
        const result = await predictModelDeviceProblems(MODEL_ID);
        const problem = _findProblemFromResult(result, ModelDeviceProblemType.BAD_PERFORMANCE_HISTORY);
        expect(uniqueProblemDescriptions.includes(problem.description)).toBeFalsy();
        uniqueProblemDescriptions.push(problem.description);
      });
    });

    describe('when available storage may be insufficient', async () => {
      let uniqueProblemDescriptions:string[] = [];

      it('returns INSUFFICIENT_STORAGE', async () => {
        theAvailableStorage = 1;
        const result = await predictModelDeviceProblems(MODEL_ID);
        expect(result).not.toBeNull();
        const problems:ModelDeviceProblem[] = result as unknown as ModelDeviceProblem[];
        expect(problems.length).toBe(1);
        expect(problems[0].type).toBe(ModelDeviceProblemType.INSUFFICIENT_STORAGE);
      });

      it('returns a unique description when unable to detect storage and was successful loading before', async () => {
        theAvailableStorage = 0;
        updateMovingAverage(1, theModelDeviceHistory.loadSuccessRate);
        const result = await predictModelDeviceProblems(MODEL_ID);
        const problem = _findProblemFromResult(result, ModelDeviceProblemType.INSUFFICIENT_STORAGE);
        expect(uniqueProblemDescriptions.includes(problem.description)).toBeFalsy();
        uniqueProblemDescriptions.push(problem.description);
      });

      it('returns a unique description when unable to detect storage and was not successful loading before', async () => {
        theAvailableStorage = 0;
        updateMovingAverage(0, theModelDeviceHistory.loadSuccessRate);
        const result = await predictModelDeviceProblems(MODEL_ID);
        const problem = _findProblemFromResult(result, ModelDeviceProblemType.INSUFFICIENT_STORAGE);
        expect(uniqueProblemDescriptions.includes(problem.description)).toBeFalsy();
        uniqueProblemDescriptions.push(problem.description);
      });

      it('returns a unique description when insufficient storage and was successful loading before', async () => {
        theAvailableStorage = 1;
        updateMovingAverage(1, theModelDeviceHistory.loadSuccessRate);
        const result = await predictModelDeviceProblems(MODEL_ID);
        const problem = _findProblemFromResult(result, ModelDeviceProblemType.INSUFFICIENT_STORAGE);
        expect(uniqueProblemDescriptions.includes(problem.description)).toBeFalsy();
        uniqueProblemDescriptions.push(problem.description);
      });

      it('returns a unique description when insufficient storage and was not successful loading before', async () => {
        theAvailableStorage = 1;
        updateMovingAverage(0, theModelDeviceHistory.loadSuccessRate);
        const result = await predictModelDeviceProblems(MODEL_ID);
        const problem = _findProblemFromResult(result, ModelDeviceProblemType.INSUFFICIENT_STORAGE);
        expect(uniqueProblemDescriptions.includes(problem.description)).toBeFalsy();
        uniqueProblemDescriptions.push(problem.description);
      });
    });

    describe('when available VRAM is insufficient', () => {
      let uniqueProblemDescriptions:string[] = [];

      it('returns INSUFFICIENT_VRAM when VRAM is insufficient', async () => {
        theSystemMemory = 1;
        const result = await predictModelDeviceProblems(MODEL_ID);
        expect(result).not.toBeNull();
        const problems:ModelDeviceProblem[] = result as unknown as ModelDeviceProblem[];
        expect(problems.length).toBe(1);
        expect(problems[0].type).toBe(ModelDeviceProblemType.INSUFFICIENT_VRAM);
      });

      it('returns a unique description when unable to detect memory and was successful loading before', async () => {
        theSystemMemory = 0;
        updateMovingAverage(1, theModelDeviceHistory.loadSuccessRate);
        const result = await predictModelDeviceProblems(MODEL_ID);
        const problem = _findProblemFromResult(result, ModelDeviceProblemType.INSUFFICIENT_VRAM);
        expect(uniqueProblemDescriptions.includes(problem.description)).toBeFalsy();
        uniqueProblemDescriptions.push(problem.description);
      });

      it('returns a unique description when unable to detect memory and was not successful loading before', async () => {
        theSystemMemory = 0;
        updateMovingAverage(0, theModelDeviceHistory.loadSuccessRate);
        const result = await predictModelDeviceProblems(MODEL_ID);
        const problem = _findProblemFromResult(result, ModelDeviceProblemType.INSUFFICIENT_VRAM);
        expect(uniqueProblemDescriptions.includes(problem.description)).toBeFalsy();
        uniqueProblemDescriptions.push(problem.description);
      });

      it('returns a unique description when insufficient VRAM and was successful loading before', async () => {
        theSystemMemory = 1;
        updateMovingAverage(1, theModelDeviceHistory.loadSuccessRate);
        const result = await predictModelDeviceProblems(MODEL_ID);
        const problem = _findProblemFromResult(result, ModelDeviceProblemType.INSUFFICIENT_VRAM);
        expect(uniqueProblemDescriptions.includes(problem.description)).toBeFalsy();
        uniqueProblemDescriptions.push(problem.description);
      });

      it('returns a unique description when insufficient VRAM and was not successful loading before', async () => {
        theSystemMemory = 1;
        updateMovingAverage(0, theModelDeviceHistory.loadSuccessRate);
        const result = await predictModelDeviceProblems(MODEL_ID);
        const problem = _findProblemFromResult(result, ModelDeviceProblemType.INSUFFICIENT_VRAM);
        expect(uniqueProblemDescriptions.includes(problem.description)).toBeFalsy();
        uniqueProblemDescriptions.push(problem.description);
      });
    });

    describe('when serving locally', () => {
      beforeEach(() => {
        theIsServingLocally = true;
      });

      it('returns DEVELOPER_MODE', async () => {
        const result = await predictModelDeviceProblems(MODEL_ID);
        expect(result).not.toBeNull();
        const problems:ModelDeviceProblem[] = result as unknown as ModelDeviceProblem[];
        expect(problems.length).toBe(1);
        expect(problems[0].type).toBe(ModelDeviceProblemType.DEVELOPER_MODE);
      });
    });

    afterAll(() => {
      theIsServingLocally = false;
    });
  });

  describe('updateModelDevicePerformanceHistory()', () => {
    beforeEach(() => {
      clearCachedModelInfo();
      theModelDeviceHistory = _createModelDeviceHistory();
    });

    it('updates the input and output rates', async () => {
      await updateModelDevicePerformanceHistory(MODEL_ID, 0, 1000, 2000, 100, 200);
      expect(theModelDeviceHistory.inputCharsPerSec.lastAverage).toBe(100);
      expect(theModelDeviceHistory.outputCharsPerSec.lastAverage).toBe(200);
    });

    it('skips update of input rate for 0 time window on input', async () => {
      await updateModelDevicePerformanceHistory(MODEL_ID, 0, 0, 1000, 100, 200);
      expect(theModelDeviceHistory.inputCharsPerSec.lastAverage).toBe(0);
      expect(theModelDeviceHistory.outputCharsPerSec.lastAverage).toBe(200);
    });

    it('skips update of output rate for 0 time window on output', async () => {
      await updateModelDevicePerformanceHistory(MODEL_ID, 0, 1000, 1000, 100, 200);
      expect(theModelDeviceHistory.inputCharsPerSec.lastAverage).toBe(100);
      expect(theModelDeviceHistory.outputCharsPerSec.lastAverage).toBe(0);
    });

    it('skips update of both rates for 0 time window on input and output', async () => {
      await updateModelDevicePerformanceHistory(MODEL_ID, 0, 0, 0, 100, 200);
      expect(theModelDeviceHistory.inputCharsPerSec.lastAverage).toBe(0);
      expect(theModelDeviceHistory.outputCharsPerSec.lastAverage).toBe(0);
    });
  });

  describe('updateModelDeviceLoadHistory()', () => {
    beforeEach(() => {
      clearCachedModelInfo();
      theModelDeviceHistory = _createModelDeviceHistory();
    });

    it('updates the load success rate and load time', async () => {
      await updateModelDeviceLoadHistory(MODEL_ID, true, 100);
      expect(theModelDeviceHistory.loadSuccessRate.lastAverage).toBe(1);
      expect(theModelDeviceHistory.loadTime.lastAverage).toBe(100);
    });

    it('updates the load success rate for a failed load', async () => {
      await updateModelDeviceLoadHistory(MODEL_ID, false);
      expect(theModelDeviceHistory.loadSuccessRate.lastAverage).toBe(0);
      expect(theModelDeviceHistory.loadTime.lastAverage).toBe(0);
    });

    it('ignores load time for a failed load', async () => {
      await updateModelDeviceLoadHistory(MODEL_ID, false, 200);
      expect(theModelDeviceHistory.loadTime.lastAverage).toBe(0);
    });
  });

  describe('scoreModel()', () => {
    beforeEach(() => {
      clearCachedModelInfo();
      theSystemMemory = 8;
      theAvailableStorage = 100;
      theHasWebGpuSupport = true;
      theModelDeviceHistory = _createModelDeviceHistory();
    });

    describe('when model has no problems', () => {
      it('scores 50 if never been loaded before', async () => {
        const result = await scoreModel(MODEL_ID, false);
        expect(result).toEqual(50);
      });

      it('scores 60 if loaded successfully once before', async () => {
        updateMovingAverage(1, theModelDeviceHistory.loadSuccessRate);
        const result = await scoreModel(MODEL_ID, false);
        expect(result).toEqual(60);
      });

      it('scores 75 if loaded successfully twice before', async () => {
        updateMovingAverage(1, theModelDeviceHistory.loadSuccessRate);
        updateMovingAverage(1, theModelDeviceHistory.loadSuccessRate);
        const result = await scoreModel(MODEL_ID, false);
        expect(result).toEqual(75);
      });

      it('scores 100 if loaded successfully thrice beofe', async () => {
        updateMovingAverage(1, theModelDeviceHistory.loadSuccessRate);
        updateMovingAverage(1, theModelDeviceHistory.loadSuccessRate);
        updateMovingAverage(1, theModelDeviceHistory.loadSuccessRate);
        const result = await scoreModel(MODEL_ID, false);
        expect(result).toEqual(100);
      });

      it('scores 100 if loaded more than 3 times before', async () => {
        updateMovingAverage(1, theModelDeviceHistory.loadSuccessRate);
        updateMovingAverage(1, theModelDeviceHistory.loadSuccessRate);
        updateMovingAverage(1, theModelDeviceHistory.loadSuccessRate);
        updateMovingAverage(1, theModelDeviceHistory.loadSuccessRate);
        const result = await scoreModel(MODEL_ID, false);
        expect(result).toEqual(100);
      });
    });

    describe('when model has blocking problems', () => {
      it('scores 0 if no WebGPU support', async () => {
        theHasWebGpuSupport = false;
        const result = await scoreModel(MODEL_ID, false);
        expect(result).toEqual(0);
      });
    });

    it('scores 30 for beta model with no load history', async () => {
      const result = await scoreModel(MODEL_ID, true);
      expect(result).toEqual(30);
    });

    it('scores 35 for beta model with 100% successful load history', async () => {
      updateMovingAverage(1, theModelDeviceHistory.loadSuccessRate);
      const result = await scoreModel(MODEL_ID, true);
      expect(result).toEqual(35);
    });

    it('scores 30 for beta model with 50% successful load history', async () => {
      updateMovingAverage(1, theModelDeviceHistory.loadSuccessRate);
      updateMovingAverage(0, theModelDeviceHistory.loadSuccessRate);
      const result = await scoreModel(MODEL_ID, true);
      expect(result).toEqual(30);
    });

    it('scores 25 for beta model with 100% failed load history', async () => {
      updateMovingAverage(0, theModelDeviceHistory.loadSuccessRate);
      const result = await scoreModel(MODEL_ID, true);
      expect(result).toEqual(25);
    });

    it('scores 30 for model with insufficient video memory', async () => {
      updateMovingAverage(1, theModelDeviceHistory.loadSuccessRate);
      theSystemMemory = 1;
      const result = await scoreModel(MODEL_ID, false);
      expect(result).toEqual(30);
    });

    it('scores 35 for model with insufficient storage', async () => {
      updateMovingAverage(1, theModelDeviceHistory.loadSuccessRate);
      theAvailableStorage = 1;
      const result = await scoreModel(MODEL_ID, false);
      expect(result).toEqual(35);
    });

    it('scores 35 for model with performance issues', async () => {
      updateMovingAverage(1, theModelDeviceHistory.loadSuccessRate);
      updateMovingAverage(2, theModelDeviceHistory.outputCharsPerSec);
      const result = await scoreModel(MODEL_ID, false);
      expect(result).toEqual(35);
    });

    it('scores 5 for a model with everything wrong but not blocking problems', async () => {
      updateMovingAverage(0, theModelDeviceHistory.loadSuccessRate);
      updateMovingAverage(2, theModelDeviceHistory.outputCharsPerSec);
      theSystemMemory = 1;
      theAvailableStorage = 1;
      const result = await scoreModel(MODEL_ID, true);
      expect(result).toEqual(5);
    });
  });

  describe('findBestModel()', () => {
    beforeEach(() => {
      clearCachedModelInfo();
      theSystemMemory = 8;
      theAvailableStorage = 100;
      theHasWebGpuSupport = true;
      theModelDeviceHistory = _createModelDeviceHistory();
      theAppMetaData = _createAppMetaData();
      theAppSettingsModelId = AUTO_SELECT_ID;
    });

    it('throws if no supported models specified in app metadata', async () => {
      theAppMetaData.supportedModels = [];
      expect(findBestModel()).rejects.toThrow('No supported LLM models for this app.');
    });

    it('returns model ID from settings if specified and included in supported models list', async () => {
      theAppSettingsModelId = ALT_MODEL_ID;
      const result = await findBestModel();
      expect(result).toEqual(ALT_MODEL_ID);
    });

    it('returns a supported model ID instead of one from settings that is not supported', async () => {
      theAppSettingsModelId = 'not-a-real-model';
      const result = await findBestModel();
      expect(result).toEqual(MODEL_ID);
    });

    it('returns the best model of multiple available', async () => {
      const result = await findBestModel();
      expect(result).toEqual(MODEL_ID);
    });
  });
});