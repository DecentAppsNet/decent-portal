import { useState, useEffect, JSX } from 'react';

import { assert } from '../common/assertUtil';
import ModalDialog from "../components/modalDialogs/ModalDialog";
import ModelDeviceProblem from "./types/ModelDeviceProblem"
import DialogFooter from "../components/modalDialogs/DialogFooter";
import DialogButton from "../components/modalDialogs/DialogButton";
import styles from './ModelDeviceProblemsDialog.module.css';
import ModelDeviceProblemType from './types/ModelDeviceProblemType';
import ModelDeviceProblemsList from './ModelDeviceProblemsList';
import { openSettingsDialog } from '../components/decentBar/interactions/opening';
import { APP_CATEGORY_ID } from '../settings/categories/appSettingsUtil';
import { findOtherModelCount } from './interactions/initialization';
import SupportedModel from '../appMetadata/types/SupportedModel';

type Props = {
  isOpen:boolean,
  modelId:string,
  onConfirm:() => void,
  onCancel:() => void,
  problems:ModelDeviceProblem[]|null,
  supportedModels?:SupportedModel[] // If you don't pass anything, they'll be retrieved from app meta data.
}

function _getOtherModelsAvailableText(otherModelCount:number):string {
  if (otherModelCount === 0) return '';
  return otherModelCount === 1 ? ' Another model supported by this app is available.' : ` Other models supported by this app are available.` 
}

function _renderFooterButtons(hasBlockingProblem:boolean, otherModelCount:number, onCancel:() => void, onConfirm:() => void) {
    const buttons:JSX.Element[] = [];
    if (otherModelCount > 0) {
      buttons.push(
        <DialogButton key="otherModels" text={'Other Models'} onClick={() => { onCancel(); openSettingsDialog(APP_CATEGORY_ID); }} disabled={!otherModelCount} />
      );
    }
    buttons.push(
      <DialogButton key="cancel" text={'Cancel'} onClick={onCancel} isPrimary={hasBlockingProblem}/>
    );
    if (!hasBlockingProblem) {
      buttons.push(
        <DialogButton key="loadModel" text={'Load Model'} onClick={onConfirm} isPrimary />
      );
    }
    return buttons;
  }

function ModelDeviceProblemsDialog({isOpen, problems, onConfirm, onCancel, modelId, supportedModels}:Props) {
  const [otherModelCount, setOtherModelCount] = useState<number|null>(null);

  useEffect(() => { // It works well to set otherModelCount before the dialog is open, because the value won't be affected by the dialog opening or anything else in the session.
    findOtherModelCount(supportedModels).then(setOtherModelCount);
  }, []);

  if (!isOpen || !problems || otherModelCount === null) return null;

  assert(problems.length >= 1);

  // Developer mode means pause before loading the model, but if there are other problems besides that, 
  // those problems would already need a pause before loading the model, so remove developer mode from problems in that case.
  const isDeveloperMode = problems.length === 1 && problems[0].type === ModelDeviceProblemType.DEVELOPER_MODE;
  if (problems.length > 1) problems = problems.filter(p => p.type !== ModelDeviceProblemType.DEVELOPER_MODE);

  const hasBlockingProblem = problems.some(p => p.isBlocking);
  
  const summaryContent = isDeveloperMode 
    ? <p>Development environment detected. Paused loading <span className={styles.modelIdText}>{modelId}</span> until you confirm.</p>
    : problems.length === 1 
      ? <p>The following problem was found for loading <span className={styles.modelIdText}>{modelId}</span>:</p>
      : <p>The following problems were found for loading <span className={styles.modelIdText}>{modelId}</span>:</p>;

  const otherModelsAvailableText = _getOtherModelsAvailableText(otherModelCount);
  const conclusionMessage = hasBlockingProblem
    ? `This model can't be loaded.${otherModelsAvailableText}`
    : `You can continue loading the model if you want.${otherModelsAvailableText}`;

  const footerButtons = _renderFooterButtons(hasBlockingProblem, otherModelCount, onCancel, onConfirm);
  
  return (
    <ModalDialog isOpen={isOpen} title={hasBlockingProblem ? 'Failed to Load Model' : 'Continue Loading Model?'} onCancel={onCancel}>
      {summaryContent}
      <div className={styles.problemPanel}>
        <ModelDeviceProblemsList problems={problems} />
      </div>
      <p className={styles.continueText}>{conclusionMessage}</p>
      <DialogFooter>
        {footerButtons}
      </DialogFooter>
    </ModalDialog>
  );
}

export default ModelDeviceProblemsDialog;