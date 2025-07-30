import ModelInfo from "./types/ModelInfo";
import { updateMovingAverage } from "@/common/movingAverageUtil";
import ModelDeviceProblem from "./types/ModelDeviceProblem";
import ModelDeviceProblemType from "./types/ModelDeviceProblemType";
import { estimateAvailableStorage } from "@/deviceCapabilities/storageUtil";
import { getModelDeviceHistory, setModelDeviceHistory } from "@/persistence/deviceHistory";
import { assertNonNullable } from "@/common/assertUtil";
import MovingAverageData from "@/common/types/MovingAverageData";
import { isServingLocally } from "@/developer/devEnvUtil";
import theModelList from './modelList.json';
import { getMaxLlmSize, incrementMaxLlmSizeAfterSuccessfulLoad } from "@/settings/categories/llmSettingsUtil";
import { mbToGb } from "@/deviceCapabilities/memoryUtil";
import { hasWebGpuSupport } from "@/deviceCapabilities/featureUtil";

let theCurrentModelInfo:ModelInfo|null = null;

function _findModelRequiredMemory(modelId:string):number {
  const model = (theModelList as any)[modelId];
  if (!model || !model.vramRequiredMb) return 0;
  return mbToGb(model.vramRequiredMb);
}

const WEBLLM_MEMORY_TO_STORAGE_RATIO = 3; // Could improve this number with testing.
async function _setCurrentModel(modelId:string) {
  if (theCurrentModelInfo?.modelId === modelId) return;
  const history = await getModelDeviceHistory(modelId);
  const requiredMemoryGb = _findModelRequiredMemory(modelId);
  if (!requiredMemoryGb) throw new Error(`Model ${modelId} not found or has no required memory.`);
  const requiredStorageGb = requiredMemoryGb * WEBLLM_MEMORY_TO_STORAGE_RATIO;
  theCurrentModelInfo = { modelId, history, requiredMemoryGb, requiredStorageGb};
}

async function _saveCurrentModel() {
  assertNonNullable(theCurrentModelInfo);
  await setModelDeviceHistory(theCurrentModelInfo.modelId, theCurrentModelInfo.history);
}

function _describeBadLoadSuccessHistory(loadSuccessRate:MovingAverageData):string {
    const attemptCount = loadSuccessRate.series.length;
    const failCount = loadSuccessRate.series.filter(s => s === 0).length;
    if (attemptCount === failCount) {
      if (attemptCount === 1) return `Your last attempt to load this model failed.`;
      if (attemptCount < loadSuccessRate.seriesMax) return `All ${attemptCount} of your attempts to load this model failed.`;
      return `All of the last ${attemptCount} attempts to load this model failed.`;  
    }

    const didlastLoadFail = loadSuccessRate.series[loadSuccessRate.series.length - 1] === 0;
    const successCount = attemptCount - failCount;
    if (didlastLoadFail) return `This model loaded successfully ${successCount} in ${attemptCount} tries, with the last attempt failing.`;
    return `This model loaded successfully ${successCount} in ${attemptCount} tries.`;
}

const SLOW_INPUT_TOKEN_THRESHOLD = 6, SLOW_OUTPUT_TOKEN_THRESHOLD = 3;
function _areTokenRatesSlow(inputTokensPerSec:MovingAverageData, outputTokensPerSec:MovingAverageData):boolean {
  return ((inputTokensPerSec.series.length > 0 && inputTokensPerSec.lastAverage < SLOW_INPUT_TOKEN_THRESHOLD) ||
    (outputTokensPerSec.series.length > 0 && outputTokensPerSec.lastAverage < SLOW_OUTPUT_TOKEN_THRESHOLD));
}

function _describeBadPerformanceHistory(inputTokensPerSec:MovingAverageData, outputTokensPerSec:MovingAverageData):string {
  const inputRate = inputTokensPerSec.lastAverage.toFixed(1);
  const outputRate = outputTokensPerSec.lastAverage.toFixed(1);
  const inputRateDesc = inputTokensPerSec.series.length ? `Predicted input token rate is ${inputRate} tokens/sec.` : `Can't predict input token rate.`;
  const outputRateDesc = outputTokensPerSec.series.length ? `Predicted output token rate is ${outputRate} tokens/sec.` : `Can't predict output token rate.`;
  return `This model's performance might be too slow. ${inputRateDesc} ${outputRateDesc}`;
}

function _describeInsufficientStorage(wasSuccessfulBefore:boolean, requiredStorageGb:number, availableStorage:number):string {
  if (availableStorage === 0) {
    if (wasSuccessfulBefore) return `Couldn't determine how much storage is available on the device. But you had previous success loading this model.`;
    return `Couldn't determine how much storage is available on the device. There might not be enough to load the model.`;
  }
  // Round to fixed 1 place
  const neededStorage = (requiredStorageGb - availableStorage).toFixed(1);
  if (wasSuccessfulBefore) return `Although you were successful loading this model previously, you might need an additional ${neededStorage} GB of free storage space on this device to load it safely.`
  return `You probably need an additional ${neededStorage} GB of free storage space on this device to load this model safely.`;
}

function _describeInsufficientMemory(wasSuccessfulBefore:boolean, requiredMemoryGb:number, maxLlmSize:number):string {
  if (maxLlmSize == 0) {
    if (wasSuccessfulBefore) return `Couldn't determine how much memory is available on the device. But you did have previous success loading this model.`;
    return `Couldn't determine how much memory is available on the device. There might not be enough to load the model.`;
  }
  if (wasSuccessfulBefore) return `It looks like you may not have enough video memory. But you did have previous success loading this model.`;
  return `You need ${requiredMemoryGb.toFixed(1)} GB of video memory to load this model. It seems unlikely to load, but you can try it.`;
}

export function _describeWebGpuNotAvailable():string {
  return `Your browser doesn't support WebGPU. GPU-accelerated models won't load successfully. You could try using a different browser like Google Chrome or Microsoft Edge.`;
}

// Used for testing.
export async function clearCachedModelInfo() {
  theCurrentModelInfo = null;
}

function _calculatePerformance(requestTimestamp:number, firstResponseTimestamp:number, lastResponseTimestamp:number, 
    inputCharCount:number, outputCharCount:number):{inputCharsPerSec:number, outputCharsPerSec:number} {
  const inputTime = firstResponseTimestamp - requestTimestamp;
  const inputCharsPerSec = inputTime === 0 ? 0 : inputCharCount / inputTime * 1000;
  const outputTime = lastResponseTimestamp - firstResponseTimestamp;
  const outputCharsPerSec = outputTime === 0 ? 0 : outputCharCount / outputTime * 1000;
  return {inputCharsPerSec, outputCharsPerSec};
}

export async function updateModelDevicePerformanceHistory(modelId:string, requestTime:number, firstResponseTime:number, lastResponseTime:number, 
    inputCharCount:number, outputCharCount:number) {
  const {inputCharsPerSec, outputCharsPerSec} = _calculatePerformance(requestTime, firstResponseTime, lastResponseTime, inputCharCount, outputCharCount);
  if (inputCharsPerSec === 0 && outputCharsPerSec === 0) return; // I don't trust these values, so don't update history.
  await _setCurrentModel(modelId);
  assertNonNullable(theCurrentModelInfo);
  if (inputCharsPerSec) updateMovingAverage(inputCharsPerSec, theCurrentModelInfo.history.inputCharsPerSec);
  if (outputCharsPerSec) updateMovingAverage(outputCharsPerSec, theCurrentModelInfo.history.outputCharsPerSec);
  await _saveCurrentModel();
}

export async function updateModelDeviceLoadHistory(modelId:string, successfulLoad:boolean, loadTime:number = 0) {
  await _setCurrentModel(modelId);
  assertNonNullable(theCurrentModelInfo);
  const loadSuccessRate = successfulLoad ? 1 : 0;
  updateMovingAverage(loadSuccessRate, theCurrentModelInfo.history.loadSuccessRate);
  if (successfulLoad) {
    updateMovingAverage(loadTime, theCurrentModelInfo.history.loadTime);
    await incrementMaxLlmSizeAfterSuccessfulLoad(theCurrentModelInfo.requiredMemoryGb);
  }
  await _saveCurrentModel();
}

export async function predictModelDeviceProblems(modelId:string):Promise<ModelDeviceProblem[]|null> {
  await _setCurrentModel(modelId);
  assertNonNullable(theCurrentModelInfo);

  const problems:ModelDeviceProblem[] = [];

  if (!hasWebGpuSupport()) {
    problems.push({
      type: ModelDeviceProblemType.WEBGPU_NOT_AVAILABLE,
      description: _describeWebGpuNotAvailable(),
      isBlocking: true
    });
  }

  const { loadSuccessRate } = theCurrentModelInfo.history;
  if (loadSuccessRate.series.length && loadSuccessRate.lastAverage < 1) {
    problems.push({
      type: ModelDeviceProblemType.BAD_LOAD_SUCCESS_HISTORY,
      description: _describeBadLoadSuccessHistory(loadSuccessRate),
      isBlocking: false
    });
  }

  const { inputCharsPerSec, outputCharsPerSec } = theCurrentModelInfo.history;
  if (_areTokenRatesSlow(inputCharsPerSec, outputCharsPerSec)) {
    problems.push({
      type: ModelDeviceProblemType.BAD_PERFORMANCE_HISTORY,
      description: _describeBadPerformanceHistory(inputCharsPerSec, outputCharsPerSec),
      isBlocking: false
    })
  }

  const maxLlmSize = await getMaxLlmSize();
  const wasSuccessfulBefore = loadSuccessRate.series.some(s => s > 0);
  if (theCurrentModelInfo.requiredMemoryGb > maxLlmSize) {
    problems.push({
      type: ModelDeviceProblemType.INSUFFICIENT_VRAM, 
      description: _describeInsufficientMemory(wasSuccessfulBefore, theCurrentModelInfo.requiredMemoryGb, maxLlmSize),
      isBlocking: false
    });
  }

  const availableStorage = await estimateAvailableStorage();
  if (theCurrentModelInfo.requiredStorageGb > await estimateAvailableStorage()) {
    problems.push({
      type: ModelDeviceProblemType.INSUFFICIENT_STORAGE,
      description: _describeInsufficientStorage(wasSuccessfulBefore, theCurrentModelInfo.requiredStorageGb, availableStorage),
      isBlocking: false
    });
  }

  if (isServingLocally()) {
    problems.push({
      type: ModelDeviceProblemType.DEVELOPER_MODE,
      description: `You are running this web app from a local server, probably for development.`,
      isBlocking: false
    });
  }
  
  return problems.length ? problems : null;
}