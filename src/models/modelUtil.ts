import { estimateSystemMemory, mbToGb } from "@/deviceCapabilities/memoryUtil";
import { prebuiltAppConfig } from "@mlc-ai/web-llm";
import ModelInfo from "./types/ModelInfo";
import { updateMovingAverage } from "@/common/movingAverageUtil";
import ModelDeviceProblem from "./types/ModelDeviceProblem";
import ModelDeviceProblemType from "./types/ModelDeviceProblemType";
import { estimateAvailableStorage } from "@/deviceCapabilities/storageUtil";
import { getModelDeviceHistory, setModelDeviceHistory } from "@/persistence/deviceHistory";
import { assertNonNullable } from "@/common/assertUtil";
import MovingAverageData from "@/common/types/MovingAverageData";

let theCurrentModelInfo:ModelInfo|null = null;

function _findModelRequiredMemory(modelId:string):number {
  const model = prebuiltAppConfig.model_list.find(m => m.model_id === modelId);
  if (!model || !model.vram_required_MB) return 0;
  return mbToGb(model.vram_required_MB);
}

const WEBLLM_MEMORY_TO_STORAGE_RATIO = 3; // Could improve this number with testing.
async function _setCurrentModel(modelId:string) {
  if (theCurrentModelInfo?.modelId === modelId) return;
  const history = await getModelDeviceHistory(modelId);
  const requiredMemoryGb = _findModelRequiredMemory(modelId);
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

const SLOW_INPUT_TOKEN_THRESHOLD = 4, SLOW_OUTPUT_TOKEN_THRESHOLD = 2;
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

function _describeInsufficientMemory(wasSuccessfulBefore:boolean, requiredMemoryGb:number, availableMemory:number):string {
  if (availableMemory == 0) {
    if (wasSuccessfulBefore) return `Couldn't determine how much memory is available on the device. But you did have previous success loading this model.`;
    return `Couldn't determine how much memory is available on the device. There might not be enough to load the model.`;
  }
  if (wasSuccessfulBefore) return `It looks like you may not have enough video memory. But you did have previous success loading this model.`;
  return `You need ${requiredMemoryGb} GB of video memory to load this model. It seems unlikely to load, but you can try it.`;
}

// Used for testing.
export async function clearCachedModelInfo() {
  theCurrentModelInfo = null;
}

export async function updateModelDevicePerformanceHistory(modelId:string, inputTokensPerSec:number, outputTokensPerSec:number) {
  await _setCurrentModel(modelId);
  assertNonNullable(theCurrentModelInfo);
  updateMovingAverage(inputTokensPerSec, theCurrentModelInfo.history.inputTokensPerSec);
  updateMovingAverage(outputTokensPerSec, theCurrentModelInfo.history.outputTokensPerSec);
  await _saveCurrentModel();
}

export async function updateModelDeviceLoadHistory(modelId:string, successfulLoad:boolean, loadTime:number) {
  await _setCurrentModel(modelId);
  assertNonNullable(theCurrentModelInfo);
  const loadSuccessRate = successfulLoad ? 1 : 0;
  updateMovingAverage(loadSuccessRate, theCurrentModelInfo.history.loadSuccessRate);
  updateMovingAverage(loadTime, theCurrentModelInfo.history.loadTime);
}

export async function predictModelDeviceProblems(modelId:string):Promise<ModelDeviceProblem[]|null> {
  await _setCurrentModel(modelId);
  assertNonNullable(theCurrentModelInfo);

  const problems:ModelDeviceProblem[] = [];

  const { loadSuccessRate } = theCurrentModelInfo.history;
  if (loadSuccessRate.series.length && loadSuccessRate.lastAverage < 1) {
    problems.push({
      type: ModelDeviceProblemType.BAD_LOAD_SUCCESS_HISTORY,
      description: _describeBadLoadSuccessHistory(loadSuccessRate)
    });
  }

  const { inputTokensPerSec, outputTokensPerSec } = theCurrentModelInfo.history;
  if (_areTokenRatesSlow(inputTokensPerSec, outputTokensPerSec)) {
    problems.push({
      type: ModelDeviceProblemType.BAD_PERFORMANCE_HISTORY,
      description: _describeBadPerformanceHistory(inputTokensPerSec, outputTokensPerSec)
    })
  }

  const availableMemory = estimateSystemMemory();
  const wasSuccessfulBefore = loadSuccessRate.series.some(s => s > 0);
  if (theCurrentModelInfo.requiredMemoryGb > availableMemory) {
    problems.push({
      type: ModelDeviceProblemType.INSUFFICIENT_VRAM, 
      description: _describeInsufficientMemory(wasSuccessfulBefore, theCurrentModelInfo.requiredStorageGb, availableMemory)
    });
  }

  const availableStorage = await estimateAvailableStorage();
  if (theCurrentModelInfo.requiredStorageGb > await estimateAvailableStorage()) {
    problems.push({
      type: ModelDeviceProblemType.INSUFFICIENT_STORAGE,
      description: _describeInsufficientStorage(wasSuccessfulBefore, theCurrentModelInfo.requiredStorageGb, availableStorage)
    });
  }
  
  return problems.length ? problems : null;
}