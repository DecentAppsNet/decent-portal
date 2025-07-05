import ModelDeviceHistory from "./ModelDeviceHistory";

type ModelInfo = {
  modelId: string;
  requiredMemoryGb:number,
  requiredStorageGb:number,
  history:ModelDeviceHistory
}

export default ModelInfo;