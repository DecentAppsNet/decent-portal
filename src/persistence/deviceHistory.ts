import ModelDeviceHistory, { isModelDeviceHistoryFormat } from "@/models/types/ModelDeviceHistory";
import { getText, setText } from "./pathStore";
import { createMovingAverage } from "@/common/movingAverageUtil";

export const LOAD_SUCCESS_RATE_SAMPLE_COUNT = 4;
export const LOAD_TIME_SAMPLE_COUNT = 4;
export const INPUT_TOKENS_SAMPLE_COUNT = 20;
export const OUTPUT_TOKENS_SAMPLE_COUNT = 20;

function _modelIdToKey(modelId:String):string {
  return `/deviceHistory/models/${modelId}.json`;
}

function _createModelDeviceHistory():ModelDeviceHistory {
  return { 
    loadSuccessRate: createMovingAverage(LOAD_SUCCESS_RATE_SAMPLE_COUNT),
    loadTime: createMovingAverage(LOAD_TIME_SAMPLE_COUNT),
    inputCharsPerSec: createMovingAverage(INPUT_TOKENS_SAMPLE_COUNT),
    outputCharsPerSec: createMovingAverage(OUTPUT_TOKENS_SAMPLE_COUNT)
  };
}

export async function getModelDeviceHistory(modelId:string):Promise<ModelDeviceHistory> {
  const key = _modelIdToKey(modelId);
  const json = await getText(key);
  if (!json) return _createModelDeviceHistory();
  try {
    const history:ModelDeviceHistory = JSON.parse(json);
    if (!isModelDeviceHistoryFormat(history)) {
      console.error(`Model device history for model ${modelId} is not in the expected format. Reinitializing history.`);
      return _createModelDeviceHistory();
    }
    return history;
  } catch (e) {
    console.error(`Failed to parse model device history for model ${modelId}:`, e);
    return _createModelDeviceHistory();
  }
}

export async function setModelDeviceHistory(modelId:string, history:ModelDeviceHistory):Promise<void> {
  const key = _modelIdToKey(modelId);
  const json = JSON.stringify(history);
  await setText(key, json);
}