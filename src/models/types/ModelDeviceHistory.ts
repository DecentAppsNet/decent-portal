import MovingAverageData, { isMovingAverageDataFormat } from '@/common/types/MovingAverageData';

type ModelDeviceHistory = {
  loadSuccessRate:MovingAverageData,
  loadTime:MovingAverageData,
  inputTokensPerSec:MovingAverageData,
  outputTokensPerSec:MovingAverageData
}

export function isModelDeviceHistoryFormat(obj:any):boolean {
  return obj && 
    isMovingAverageDataFormat(obj.loadSuccessRate) &&
    isMovingAverageDataFormat(obj.loadTime) &&
    isMovingAverageDataFormat(obj.inputTokensPerSec) &&
    isMovingAverageDataFormat(obj.outputTokensPerSec);
}

export default ModelDeviceHistory;