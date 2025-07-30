import ModelDeviceProblemType from "./ModelDeviceProblemType";

type ModelDeviceProblem = {
  type: ModelDeviceProblemType;
  description: string;
  isBlocking: boolean;
}

export default ModelDeviceProblem;