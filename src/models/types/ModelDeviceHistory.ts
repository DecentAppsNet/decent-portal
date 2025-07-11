import MovingAverageData, { isMovingAverageDataFormat } from '../../common/types/MovingAverageData';

type ModelDeviceHistory = {
  loadSuccessRate:MovingAverageData,
  loadTime:MovingAverageData,
  inputCharsPerSec:MovingAverageData,
  outputCharsPerSec:MovingAverageData
}

export function isModelDeviceHistoryFormat(obj:any):boolean {
  return obj && 
    isMovingAverageDataFormat(obj.loadSuccessRate) &&
    isMovingAverageDataFormat(obj.loadTime) &&
    isMovingAverageDataFormat(obj.inputCharsPerSec) &&
    isMovingAverageDataFormat(obj.outputCharsPerSec);
}

export default ModelDeviceHistory;