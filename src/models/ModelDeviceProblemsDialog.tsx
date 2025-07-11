import { assert, botch } from '@/common/assertUtil';
import ModalDialog from "@/components/modalDialogs/ModalDialog";
import ModelDeviceProblem from "./types/ModelDeviceProblem"
import DialogFooter from "@/components/modalDialogs/DialogFooter";
import DialogButton from "@/components/modalDialogs/DialogButton";
import styles from './ModelDeviceProblemsDialog.module.css';
import InsufficientMemoryIcon from './icons/memory.svg';
import InsufficientStorageIcon from './icons/database.svg';
import BadLoadSuccessIcon from './icons/message-alert.svg';
import BadPerformanceIcon from './icons/speedometer-slow.svg';
import DeveloperIcon from './icons/code-braces.svg';
import ModelDeviceProblemType from './types/ModelDeviceProblemType';

type Props = {
  isOpen:boolean,
  modelId:string,
  onConfirm:() => void,
  onCancel:() => void,
  problems:ModelDeviceProblem[]|null
}

function _renderProblemIcon(problemType:ModelDeviceProblemType) {
  switch(problemType) {
    case ModelDeviceProblemType.INSUFFICIENT_VRAM:  return <img className={styles.icon} src={InsufficientMemoryIcon} alt='Insufficient VRAM' />;
    case ModelDeviceProblemType.INSUFFICIENT_STORAGE: return <img className={styles.icon} src={InsufficientStorageIcon} alt='Insufficient Storage' />;
    case ModelDeviceProblemType.BAD_LOAD_SUCCESS_HISTORY: return <img className={styles.icon} src={BadLoadSuccessIcon} alt='Bad Load Success History' />;
    case ModelDeviceProblemType.BAD_PERFORMANCE_HISTORY: return <img className={styles.icon} src={BadPerformanceIcon} alt='Bad Performance History' />;
    case ModelDeviceProblemType.DEVELOPER_MODE: return <img className={styles.icon} src={DeveloperIcon} alt='Developer Mode' />;
    default: botch();
  }
}

function ModelDeviceProblemsDialog({isOpen, problems, onConfirm, onCancel, modelId}:Props) {
  if (!isOpen || !problems) return null;

  assert(problems.length >= 1);

  // Developer mode means pause before loading the model, but if there are other problems besides that, 
  // those problems would already need a pause before loading the model, so remove developer mode from problems in that case.
  const isDeveloperMode = problems.length === 1 && problems[0].type === ModelDeviceProblemType.DEVELOPER_MODE;
  if (problems.length > 1) problems = problems.filter(p => p.type !== ModelDeviceProblemType.DEVELOPER_MODE);

  const summaryContent = isDeveloperMode 
    ? <p>Development environment detected. Paused loading <span className={styles.modelIdText}>{modelId}</span> until you confirm.</p>
    : problems.length === 1 
      ? <p>The following problem was found for loading <span className={styles.modelIdText}>{modelId}</span>:</p>
      : <p>The following problems were found for loading <span className={styles.modelIdText}>{modelId}</span>:</p>;
  const problemsContent = problems.map((problem, problemI) => {
    return <li key={problemI}>{_renderProblemIcon(problem.type)}{problem.description}</li>
  });

  return (
    <ModalDialog isOpen={isOpen} title='Continue Loading Model?' onCancel={onCancel}>
      {summaryContent}
      <ul className={styles.problemList}>{problemsContent}</ul>
      <p className={styles.continueText}>You can continue loading the model if you want.</p>
      <DialogFooter>
        <DialogButton text={'Cancel'} onClick={onCancel} />
        <DialogButton text={'Load Model'} onClick={onConfirm} isPrimary />
      </DialogFooter>
    </ModalDialog>
  );
}

export default ModelDeviceProblemsDialog;