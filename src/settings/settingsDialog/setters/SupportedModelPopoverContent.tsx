import ModelDeviceProblem from "@/models/types/ModelDeviceProblem"
import styles from "./SupportedModelPopoverContent.module.css"
import LlmSpeed from "@/components/llmSpeed/LlmSpeed";
import ModelDeviceProblemsList from "@/models/ModelDeviceProblemsList";
import { AUTO_SELECT_ID } from "./SupportedModelSetter";

type Props = {
  modelId:string,
  appBehaviorSummary:string,
  problems:ModelDeviceProblem[]|null;
  inputCharsPerSec:number;
  outputCharsPerSec:number;
}

function SupportedModelPopoverContent({modelId, appBehaviorSummary, problems, inputCharsPerSec, outputCharsPerSec}:Props) {
  const speedContent = inputCharsPerSec > 0 || outputCharsPerSec > 0
    ? <LlmSpeed inputCharsPerSec={inputCharsPerSec} outputCharsPerSec={outputCharsPerSec} />
    : null;
  const modelIdContent = modelId === AUTO_SELECT_ID ? 'Auto Select Model' : modelId;
  return (
    <div className={styles.container}>
      <div className={styles.modelIdText}>{modelIdContent}</div>
      <p className={styles.appBehaviorSummary}>{appBehaviorSummary}</p>
      <ModelDeviceProblemsList problems={problems} />
      {speedContent}
    </div>
  );
}

export default SupportedModelPopoverContent;