import { useMemo, useEffect, useState } from 'react';

import styles from './LlmSpeed.module.css';

type Props = {
  inputCharsPerSec?:number,
  outputCharsPerSec?:number
}

function _getRateText(prefix:string, rate?:number):string {
  if (rate === undefined || rate === 0) return `${prefix}: unknown`;
  if (rate !== Math.round(rate)) rate = Math.round(rate * 10) / 10;
  return `${prefix}: ${rate} chars/sec`;
}

type RenderTiming = {
  startTime:number,
  inputDuration:number,
  outputDuration:number
}

const INPUT_PREFIX = 'input', OUTPUT_PREFIX = 'output';

function _calcRenderTiming(inputCharsPerSec?:number, outputCharsPerSec?:number):RenderTiming {
  const startTime = Date.now();
  const inputDuration = inputCharsPerSec === undefined 
    ? 0 
    : _getRateText(INPUT_PREFIX, inputCharsPerSec).length / inputCharsPerSec * 1000;
  const outputDuration = outputCharsPerSec === undefined 
    ? 0 
    : _getRateText(OUTPUT_PREFIX, outputCharsPerSec).length / outputCharsPerSec * 1000;
  return { startTime, inputDuration, outputDuration };
}

function _calcProgress(renderTiming:RenderTiming):{inputProgress:number, outputProgress:number } {
  const { startTime, inputDuration, outputDuration } = renderTiming;
  const overallTime = inputDuration + outputDuration;
  const elapsed = (Date.now() - startTime) % overallTime;
  let inputProgress = 0, outputProgress = 0;
  if (elapsed < inputDuration) {
    inputProgress = elapsed / inputDuration;
  } else {
    inputProgress = 1;
    outputProgress = (elapsed - inputDuration) / outputDuration;
  }
  return { inputProgress, outputProgress };
}

const FRAMES_PER_SEC = 20, FRAME_INTERVAL = 1000 / FRAMES_PER_SEC;

function LlmSpeed({inputCharsPerSec, outputCharsPerSec}:Props) {
  const [frameNo, setFrameNo] = useState(0);
  const [renderTiming] = useState<RenderTiming>(_calcRenderTiming(inputCharsPerSec, outputCharsPerSec));
  const inputText = useMemo(() => _getRateText('input', inputCharsPerSec), [inputCharsPerSec]);
  const outputText = useMemo(() => _getRateText('output', outputCharsPerSec), [outputCharsPerSec]);

  const {inputProgress, outputProgress} = _calcProgress(renderTiming);

  useEffect(() => {
    const interval = setTimeout(() => {
      setFrameNo(frameNo + 1);
    }, FRAME_INTERVAL);
    return () => clearInterval(interval);
  }, [frameNo]);

  return (
    <div className={styles.container}>
      <div className={styles.inputSpeedBox}>
        <div
          className={styles.progressBar}
          style={{ width: `${inputProgress * 100}%` }}
        />
        <div
          className={styles.overTextBar}
          style={{ width: `${(1 - inputProgress) * 100}%` }}
        />
        {inputText}
      </div>
      <div className={styles.outputSpeedBox}>
        <div
          className={styles.progressBar}
          style={{ width: `${outputProgress * 100}%` }}
        />
        <div
          className={styles.overTextBar}
          style={{ width: `${(1 - outputProgress) * 100}%` }}
        />
        {outputText}
      </div>
    </div>
  );
}

export default LlmSpeed;