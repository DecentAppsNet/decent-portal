// Mocks first before importing modules that may use them.

vi.mock("@/deviceCapabilities/memoryUtil", async () => ({
  ...(await vi.importActual("@/deviceCapabilities/memoryUtil")),
  estimateSystemMemory: vi.fn(() => theSystemMemory)
}));

vi.mock("@/deviceCapabilities/storageUtil", async () => ({
  ...(await vi.importActual("@/deviceCapabilities/storageUtil")),
  estimateAvailableStorage: vi.fn(() => theAvailableStorage)
}));

vi.mock('@/persistence/deviceHistory', async () => ({
  ...(await vi.importActual("@/persistence/deviceHistory")),
  getModelDeviceHistory: vi.fn(() => theModelDeviceHistory),
  setModelDeviceHistory: vi.fn((_id, next) => { theModelDeviceHistory = next; })
}));

vi.mock("@/developer/devEnvUtil", async () => ({
  ...(await vi.importActual("@/developer/devEnvUtil")),
  isServingLocally: vi.fn(() => false)
}));

// Import section after mocking.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { prebuiltAppConfig } from "@mlc-ai/web-llm";

import ModelDeviceHistory from "../types/ModelDeviceHistory";
import { createMovingAverage, updateMovingAverage } from "@/common/movingAverageUtil";
import ModelDeviceProblem from "../types/ModelDeviceProblem";
import ModelDeviceProblemType from "../types/ModelDeviceProblemType";
import { INPUT_TOKENS_SAMPLE_COUNT, LOAD_SUCCESS_RATE_SAMPLE_COUNT, LOAD_TIME_SAMPLE_COUNT, OUTPUT_TOKENS_SAMPLE_COUNT } from "@/persistence/deviceHistory";
import { clearCachedModelInfo, predictModelDeviceProblems, updateModelDeviceLoadHistory, updateModelDevicePerformanceHistory } from "../modelUtil"; 

// These constants based on model settings found at https://github.com/mlc-ai/web-llm/blob/main/src/config.ts
const MODEL_ID = "Llama-3.1-8B-Instruct-q4f32_1-MLC-1k";
const MODEL_VRAM_REQUIRED_MB = 5295.7; // 5.3 GB

let theSystemMemory = 0;
let theAvailableStorage = 0;
let theModelDeviceHistory:ModelDeviceHistory = _createModelDeviceHistory();

function _createModelDeviceHistory():ModelDeviceHistory {
  return {
    loadSuccessRate: createMovingAverage(LOAD_SUCCESS_RATE_SAMPLE_COUNT),
    loadTime: createMovingAverage(LOAD_TIME_SAMPLE_COUNT),
    inputTokensPerSec: createMovingAverage(INPUT_TOKENS_SAMPLE_COUNT),
    outputTokensPerSec: createMovingAverage(OUTPUT_TOKENS_SAMPLE_COUNT),
  };
};

function _findProblemFromResult(result:any, type:ModelDeviceProblemType):ModelDeviceProblem {
  expect(!!result || !Array.isArray(result));
  const problems:ModelDeviceProblem[] = result as unknown as ModelDeviceProblem[];
  const problem = problems.find(p => p.type === type);
  expect(!!problem);
  return problem as ModelDeviceProblem;
}

describe('modelUtil', () => {
  describe("WebLLM dependency", () => {
    it('matches assumptions of tests', () => {
      const model = prebuiltAppConfig.model_list.find(m => m.model_id === MODEL_ID);
      expect(model).toBeDefined();
      expect(model?.vram_required_MB).toBe(MODEL_VRAM_REQUIRED_MB);
    });
  });

  describe("predictModelDeviceProblems()", () => {
    let uniqueProblemDescriptions:string[] = [];

    beforeEach(() => { // Initialize to a good value, and let tests update it as wanted.
      theSystemMemory = 8;
      theAvailableStorage = 100;
      clearCachedModelInfo();
      theModelDeviceHistory = _createModelDeviceHistory();
    });

    it('returns null for no predicted problems', async () => {
      theSystemMemory = 8;
      theAvailableStorage = 100;
      const result = await predictModelDeviceProblems(MODEL_ID);
      expect(result).toBeNull();
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
        updateMovingAverage(0.1, theModelDeviceHistory.inputTokensPerSec);
        const result = await predictModelDeviceProblems(MODEL_ID);
        expect(result).not.toBeNull();
        const problems:ModelDeviceProblem[] = result as unknown as ModelDeviceProblem[];
        expect(problems.length).toBe(1);
        expect(problems[0].type).toBe(ModelDeviceProblemType.BAD_PERFORMANCE_HISTORY);
      });

      it('returns a unique description for input rate being slow', async () => {
        updateMovingAverage(0.1, theModelDeviceHistory.inputTokensPerSec);
        const result = await predictModelDeviceProblems(MODEL_ID);
        const problem = _findProblemFromResult(result, ModelDeviceProblemType.BAD_PERFORMANCE_HISTORY);
        expect(uniqueProblemDescriptions.includes(problem.description)).toBeFalsy();
        uniqueProblemDescriptions.push(problem.description);
      });

      it('returns a unique description for output rate being slow', async () => {
        updateMovingAverage(0.1, theModelDeviceHistory.outputTokensPerSec);
        const result = await predictModelDeviceProblems(MODEL_ID);
        const problem = _findProblemFromResult(result, ModelDeviceProblemType.BAD_PERFORMANCE_HISTORY);
        expect(uniqueProblemDescriptions.includes(problem.description)).toBeFalsy();
        uniqueProblemDescriptions.push(problem.description);
      });

      it('returns a unique description for input and output rate being slow', async () => {
        updateMovingAverage(0.1, theModelDeviceHistory.inputTokensPerSec);
        updateMovingAverage(0.1, theModelDeviceHistory.outputTokensPerSec);
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
  });

  describe('updateModelDevicePerformanceHistory()', () => {
    beforeEach(() => {
      clearCachedModelInfo();
      theModelDeviceHistory = _createModelDeviceHistory();
    });

    it('updates the input and output token rates', async () => {
      await updateModelDevicePerformanceHistory(MODEL_ID, 10, 20);
      expect(theModelDeviceHistory.inputTokensPerSec.lastAverage).toBe(10);
      expect(theModelDeviceHistory.outputTokensPerSec.lastAverage).toBe(20);
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

    it('updates the load success rate and load time for a failed load', async () => {
      await updateModelDeviceLoadHistory(MODEL_ID, false, 200);
      expect(theModelDeviceHistory.loadSuccessRate.lastAverage).toBe(0);
      expect(theModelDeviceHistory.loadTime.lastAverage).toBe(200);
    });
  });
});