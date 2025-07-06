import { assert, botch } from '@/common/assertUtil';
import ModalDialog from "@/components/modalDialogs/ModalDialog";
import ModelDeviceProblem from "./types/ModelDeviceProblem"
import DialogFooter from "@/components/modalDialogs/DialogFooter";
import DialogButton from "@/components/modalDialogs/DialogButton";
import styles from './ModelDeviceProblems.module.css';
import InsufficientMemoryIcon from './icons/memory.svg';
import InsufficientStorageIcon from './icons/database.svg';
import BadLoadSuccessIcon from './icons/message-alert.svg';
import BadPerformanceIcon from './icons/speedometer-slow.svg';
import DeveloperIcon from './icons/code-braces.svg';
import ModelDeviceProblemType from './types/ModelDeviceProblemType';

type Props = {
  isOpen:boolean,
  onConfirm:() => void,
  onCancel:() => void,
  problems:ModelDeviceProblem[]
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

function ModelDeviceProblemDialog({isOpen, problems, onConfirm, onCancel}:Props) {
  if (!isOpen) return null;

  assert(problems.length >= 1);

  // Developer mode means pause before loading the model, but if there are other problems besides that, 
  // those problems would already need a pause before loading the model, so remove developer mode from problems in that case.
  const isDeveloperMode = problems.length === 1 && problems[0].type === ModelDeviceProblemType.DEVELOPER_MODE;
  if (problems.length > 1) problems = problems.filter(p => p.type !== ModelDeviceProblemType.DEVELOPER_MODE);

  const summaryText = isDeveloperMode 
    ? `This looks like a development environment. Pausing before starting the heavy work of loading the model.`
    : problems.length === 1 
      ? 'The following problem was found:' 
      : 'The following problems were found:'
  const problemsContent = problems.map(problem => {
    return <li>{_renderProblemIcon(problem.type)}{problem.description}</li>
  });

  return (
    <ModalDialog isOpen={isOpen} title='Continue Loading Model?' onCancel={onCancel}>
      <p>{summaryText}</p>
      <ul className={styles.problemList}>{problemsContent}</ul>
      <p>You can continue loading the model if you want.</p>
      <DialogFooter>
        <DialogButton text={'Cancel'} onClick={onCancel} />
        <DialogButton text={'Load Model'} onClick={onConfirm} isPrimary />
      </DialogFooter>
    </ModalDialog>
  );
}

export default ModelDeviceProblemDialog;