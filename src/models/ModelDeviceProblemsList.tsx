import { assert, botch } from '@/common/assertUtil';
import ModelDeviceProblem from "./types/ModelDeviceProblem"
import styles from './ModelDeviceProblemsList.module.css';
import InsufficientMemoryIcon from './icons/memory.svg';
import InsufficientStorageIcon from './icons/database.svg';
import BadLoadSuccessIcon from './icons/message-alert.svg';
import BadPerformanceIcon from './icons/speedometer-slow.svg';
import DeveloperIcon from './icons/code-braces.svg';
import BetaIcon from './icons/beta.svg';
import ModelDeviceProblemType from './types/ModelDeviceProblemType';

type Props = {
  problems:ModelDeviceProblem[]|null
}

function _renderProblemIcon(problemType:ModelDeviceProblemType) {
  switch(problemType) {
    case ModelDeviceProblemType.INSUFFICIENT_VRAM:  return <img className={styles.icon} src={InsufficientMemoryIcon} alt='Insufficient VRAM' />;
    case ModelDeviceProblemType.INSUFFICIENT_STORAGE: return <img className={styles.icon} src={InsufficientStorageIcon} alt='Insufficient Storage' />;
    case ModelDeviceProblemType.BAD_LOAD_SUCCESS_HISTORY: return <img className={styles.icon} src={BadLoadSuccessIcon} alt='Bad Load Success History' />;
    case ModelDeviceProblemType.BAD_PERFORMANCE_HISTORY: return <img className={styles.icon} src={BadPerformanceIcon} alt='Bad Performance History' />;
    case ModelDeviceProblemType.DEVELOPER_MODE: return <img className={styles.icon} src={DeveloperIcon} alt='Developer Mode' />;
    case ModelDeviceProblemType.BETA: return <img className={styles.icon} src={BetaIcon} alt='Beta' />;
    default: botch();
  }
}

function ModelDeviceProblemsList({problems}:Props) {
  if (!problems) return null;

  assert(problems.length >= 1);

  const problemsContent = problems.map((problem, problemI) => {
    return <li key={problemI}>{_renderProblemIcon(problem.type)}{problem.description}</li>
  });

  return <ul className={styles.problemList}>{problemsContent}</ul>;
}

export default ModelDeviceProblemsList;