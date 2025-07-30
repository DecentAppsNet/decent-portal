import styles from './Gallery.module.css';
import ModelDeviceProblemType from '@/models/types/ModelDeviceProblemType';
import ModelDeviceProblemDialog from '@/models/ModelDeviceProblemsDialog';
import ModelDeviceProblem from '@/models/types/ModelDeviceProblem';
import { predictModelDeviceProblems } from '@/models/modelUtil';
import ContentButton from '@/components/contentButton/ContentButton';

function _testModelDeviceProblems(modalDialogName:string|null, setModalDialogName:Function) {
  const DIALOG_NAME = ModelDeviceProblemDialog.name;
  const problems:ModelDeviceProblem[] = [
    {type:ModelDeviceProblemType.BAD_LOAD_SUCCESS_HISTORY, description:`The model didn't load before.`, isBlocking:false},
    {type:ModelDeviceProblemType.BAD_PERFORMANCE_HISTORY, description:`The model performed poorly before.`, isBlocking:false},
    {type:ModelDeviceProblemType.INSUFFICIENT_STORAGE, description:`You might not have enough storage for this bad boy.`, isBlocking:false},
    {type:ModelDeviceProblemType.INSUFFICIENT_VRAM, description:`Got enough VRAM? I don't think so, buddy.`, isBlocking:false},
    {type:ModelDeviceProblemType.DEVELOPER_MODE, description:`We aren't actually loading a model. This is just a UI test!`, isBlocking:false}
  ];
  return <>
    <h3>Test: Model Device Problems Dialog</h3>
    <ModelDeviceProblemDialog 
      modelId={'Fake Model'}
      isOpen={modalDialogName === DIALOG_NAME}
      problems={problems}
      onConfirm={() => setModalDialogName(null)}
      onCancel={() => setModalDialogName(null)}
    />
    <ContentButton onClick={() => setModalDialogName(DIALOG_NAME)} text='Open' />
  </>;
}

function _testModelDeviceProblemsDevMode(modalDialogName:string|null, setModalDialogName:Function) {
  const DIALOG_NAME = `${ModelDeviceProblemDialog.name}2`;
  const problems:ModelDeviceProblem[] = [
    {type:ModelDeviceProblemType.DEVELOPER_MODE, description:`We aren't actually loading a model. This is just a UI test!`, isBlocking:false}
  ];
  return <>
    <h3>Test: Model Device Problems Dialog - Developer Mode</h3>
    <ModelDeviceProblemDialog 
      modelId={'Fake Model'}
      isOpen={modalDialogName === DIALOG_NAME}
      problems={problems}
      onConfirm={() => setModalDialogName(null)}
      onCancel={() => setModalDialogName(null)}
    />
    <ContentButton onClick={() => setModalDialogName(DIALOG_NAME)} text='Open' />
  </>;
}

function _testModelDeviceProblemsRealData(modalDialogName:string|null, 
    modelDeviceProblems:ModelDeviceProblem[]|null, setModelDeviceProblems:Function, setModalDialogName:Function) {
  const DIALOG_NAME = `${ModelDeviceProblemDialog.name}3`;
  const MODEL_ID = "Llama-3-70B-Instruct-q3f16_1-MLC"; // A larger model more likely to have problems.
  if (!modelDeviceProblems) modelDeviceProblems = [];
  return <>
    <h3>Test: Model Device Problems Dialog - Real Device Data</h3>
    <ModelDeviceProblemDialog 
      isOpen={modalDialogName === DIALOG_NAME}
      modelId={MODEL_ID}
      problems={modelDeviceProblems}
      onConfirm={() => setModalDialogName(null)}
      onCancel={() => setModalDialogName(null)}
    />
    <ContentButton onClick={async () => {
      const nextProblems = await predictModelDeviceProblems(MODEL_ID);
      setModelDeviceProblems(nextProblems);
      if (nextProblems) { 
        setModalDialogName(DIALOG_NAME);
      } else {
        alert(`No problems found for loading ${MODEL_ID} on this device.`);
      }
    }} text='Check for Problems' />
  </>;
}

function _testWebGpuNotAvailableDialog(modalDialogName:string|null, setModalDialogName:Function) {
  const DIALOG_NAME = `${ModelDeviceProblemDialog.name}WebGpu`;
  const problems:ModelDeviceProblem[] = [
    {type:ModelDeviceProblemType.WEBGPU_NOT_AVAILABLE, description:'Web GPU is unavailable.', isBlocking:true}
  ];
  return <>
    <h3>Test: WebGPU Not Available Dialog</h3>
    <ModelDeviceProblemDialog 
      modelId={'None'}
      isOpen={modalDialogName === DIALOG_NAME}
      problems={problems}
      onConfirm={() => setModalDialogName(null)}
      onCancel={() => setModalDialogName(null)}
    />
    <ContentButton onClick={() => setModalDialogName(DIALOG_NAME)} text='Open' />
  </>;
}

type Props = {
  modalDialogName:string|null,
  setModalDialogName:Function,
  modelDeviceProblems:ModelDeviceProblem[]|null,
  setModelDeviceProblems:Function
}

function ModelDeviceProblemTests({modalDialogName, setModalDialogName, modelDeviceProblems, setModelDeviceProblems}:Props) {
  return (
    <div className={styles.container}>
      <h1>Model Device Problem Tests</h1>

      {_testWebGpuNotAvailableDialog(modalDialogName, setModalDialogName)}
      {_testModelDeviceProblems(modalDialogName, setModalDialogName)}
      {_testModelDeviceProblemsDevMode(modalDialogName, setModalDialogName)}
      {_testModelDeviceProblemsRealData(modalDialogName, modelDeviceProblems, setModelDeviceProblems, setModalDialogName)}
    </div>
  );
}

export default ModelDeviceProblemTests;