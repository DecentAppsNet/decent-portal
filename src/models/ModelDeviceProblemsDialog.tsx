import { assert } from '@/common/assertUtil';
import ModalDialog from "@/components/modalDialogs/ModalDialog";
import ModelDeviceProblem from "./types/ModelDeviceProblem"
import DialogFooter from "@/components/modalDialogs/DialogFooter";
import DialogButton from "@/components/modalDialogs/DialogButton";
import styles from './ModelDeviceProblemsDialog.module.css';
import ModelDeviceProblemType from './types/ModelDeviceProblemType';
import ModelDeviceProblemsList from './ModelDeviceProblemsList';

type Props = {
  isOpen:boolean,
  modelId:string,
  onConfirm:() => void,
  onCancel:() => void,
  problems:ModelDeviceProblem[]|null
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

  return (
    <ModalDialog isOpen={isOpen} title='Continue Loading Model?' onCancel={onCancel}>
      {summaryContent}
      <ModelDeviceProblemsList problems={problems} />
      <p className={styles.continueText}>You can continue loading the model if you want.</p>
      <DialogFooter>
        <DialogButton text={'Cancel'} onClick={onCancel} />
        <DialogButton text={'Load Model'} onClick={onConfirm} isPrimary />
      </DialogFooter>
    </ModalDialog>
  );
}

export default ModelDeviceProblemsDialog;