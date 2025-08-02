import { useEffect, useState } from 'react';

import ModelDeviceProblem from '../models/types/ModelDeviceProblem';
import ModelDeviceProblemTests from './ModelDeviceProblemTests';
import AdhocTests from './AdhocTests';
import DecentBarTests from './DecentBarTests';
import Selector from '@/components/selector/Selector';
import styles from './Gallery.module.css' // Import this after the other imports to preserve intended order for CSS overrides.
import { initAppMetaData } from '@/appMetadata/appMetadataUtil';

enum Group {
  DECENT_BAR = 0,
  MODEL_DEVICE_PROBLEMS = 1,
  ADHOC = 2
}

const OPTION_NAMES = ['Decent Bar', 'Model Device Problems', 'Ad-hoc'];

function Gallery() {
  const [modalDialogName, setModalDialogName] = useState<string|null>(null);
  const [modelDeviceProblems, setModelDeviceProblems] = useState<ModelDeviceProblem[]|null>(null);
  const [selectedGroupNo, setSelectedGroupNo] = useState<number>(0);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  useEffect(() => {
    if (isInitialized) return;
    initAppMetaData().then(() => setIsInitialized(true))
  }, [isInitialized]);

  if (!isInitialized) return <div className={styles.container}>Loading...</div>;

  function _renderGroup(groupNo:number) {
    switch (groupNo) {
      case Group.DECENT_BAR:
        return <DecentBarTests />;
      case Group.MODEL_DEVICE_PROBLEMS:
        return <ModelDeviceProblemTests modalDialogName={modalDialogName} setModalDialogName={setModalDialogName} 
          modelDeviceProblems={modelDeviceProblems} setModelDeviceProblems={setModelDeviceProblems} />;
      case Group.ADHOC:
        return <AdhocTests />;
      default:
        return null;
    }
  }

  return (
    <div className={styles.container}>
      <h1>Decent Portal Test App</h1>

      <Selector optionNames={OPTION_NAMES} selectedOptionNo={selectedGroupNo} onChange={setSelectedGroupNo} displayAsTabs/>
      { _renderGroup(selectedGroupNo) } 
    </div>
  );
}

export default Gallery;