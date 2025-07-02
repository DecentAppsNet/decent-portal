import { deleteLogTextForDay, findAllLoggedDays, getDayPath, getLogTextForDay, setLogTextForDay } from "@/persistence/localLog";
import { LOGGING_SETTING_ENABLE, LOGGING_SETTING_MAX_RETENTION_DAYS } from "@/settings/categories/loggingSettingsUtil";
import { settingValue } from "@/settings/settingsUtil";
import Setting from "@/settings/types/Setting";

const WRITE_DELAY_MS = 3000;
const DAY = 24 * 60 * 60 * 1000;
const UNINITIALIZED_DAY_PATH = 'UNINITIALIZED_DAY_PATH';

let theDayBuffer:string[] = [];
let theDayBufferPath:string = UNINITIALIZED_DAY_PATH;
let thePreviousDayPath:string = UNINITIALIZED_DAY_PATH;
let thePreviousDayEntryCount:number = 0; // When >0, it means the buffer has entries from the previous day that haven't been written yet.
let theDebouncedWriteTimer:number|null = null;
let theAppName:string = '';
let theLoggingSettings:Setting[]|null = null;

function _getMaxRetentionDays():number {
  return settingValue(LOGGING_SETTING_MAX_RETENTION_DAYS, theLoggingSettings) as number || 0;
}

function _isLoggingEnabled():boolean {
  return settingValue(LOGGING_SETTING_ENABLE, theLoggingSettings) as boolean || false;
}

function _isRunningOnDedicatedWorker():boolean {
  return typeof self !== 'undefined' && self.constructor.name === 'DedicatedWorkerGlobalScope';
}

async function _writeDayBuffer() {
  if (!theDayBuffer.length) return; // Nothing to write.
  try {
    if (!theDayBufferPath) throw Error('Unexpected');
    if (thePreviousDayEntryCount) {
      if (thePreviousDayPath === UNINITIALIZED_DAY_PATH) throw Error('Unexpected');
      const previousDayBuffer = theDayBuffer.slice(0, thePreviousDayEntryCount);
      theDayBuffer = theDayBuffer.slice(thePreviousDayEntryCount); // Keep only the current day's entries in the buffer.
      await setLogTextForDay(thePreviousDayPath, previousDayBuffer.join('\n'));
      thePreviousDayEntryCount = 0;
      thePreviousDayPath = UNINITIALIZED_DAY_PATH;
    }
    await setLogTextForDay(theDayBufferPath, theDayBuffer.join('\n'));
  } catch (error) {
    console.error('Unexpected error writing log buffer:', error);
  }
}

async function _initDayBuffer(dayPath:string) {
  const logText = await getLogTextForDay(dayPath);
  if (logText) theDayBuffer = logText.split('\n');
  theDayBufferPath = dayPath;
}

export async function log(text:string, flushImmediately:boolean = false) {
  if (_isRunningOnDedicatedWorker()) throw Error('Unexpected - log() should not be called in worker thread.');
  if (!theLoggingSettings) {
    console.warn('Logging settings have not been applied yet. Failed to log:', text);
    return;
  }
  if (!_isLoggingEnabled()) return; // Logging is disabled, so do nothing.

  const timestamp = Date.now();
  const dayPath = getDayPath(timestamp);
  if (theDayBufferPath === UNINITIALIZED_DAY_PATH) await _initDayBuffer(dayPath);

  if (theDayBufferPath !== dayPath) { // New day, so set vars for next write to write old day and start a new buffer.
    thePreviousDayEntryCount = theDayBuffer.length; 
    thePreviousDayPath = theDayBufferPath;
    theDayBufferPath = dayPath; // Update the current day path
  }
  const date = new Date(timestamp);
  const timePrefix = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  theDayBuffer.push(`[${timePrefix}] ${text}`);

  if (flushImmediately) {
    await _writeDayBuffer();
    return;
  }

  if (theDebouncedWriteTimer) clearTimeout(theDebouncedWriteTimer);
  theDebouncedWriteTimer = setTimeout(async () => {
    await _writeDayBuffer();
    theDebouncedWriteTimer = null;
  }, WRITE_DELAY_MS) as unknown as number;
}

// If today is 4/2/25 and you pass 1, returns "2025-04-01".
function _getPastDayPath(daysAgo:number):string {
  return getDayPath(Date.now() - daysAgo * DAY);
}

// Intentionally not exported as a roadbump against sending logs to a service.
async function _getLogText(includeDayCount:number):Promise<string> {
  let dayPaths = await findAllLoggedDays();
  if (!dayPaths.length) return ''; // No logs to return.

  if (includeDayCount !== Infinity) {
    const oldestDayPath = _getPastDayPath(includeDayCount);
    dayPaths = dayPaths.filter(dayPath => dayPath > oldestDayPath);
  }

  let logText = '';
  for(let i = 0; i < dayPaths.length; ++i) {
    const dayPath = dayPaths[i];
    const dayLogText = await getLogTextForDay(dayPath);
    if (!dayLogText) { console.error('Non-fatal error - no log text stored for ${dayPath} despite key being present.'); continue;}
    logText += `--- ${dayPath} ---\n`;
    logText += dayLogText;
  }
  return logText;
}

// Supporting use case of user voluntarily, explicitly pasting the log into an email, bug report, or something similar.
export async function copyLogsToClipboard(includeDayCount:number = Infinity):Promise<boolean> {
  const logText = await _getLogText(includeDayCount);
  if (!logText.length) return false;
  self.navigator.clipboard.writeText(logText);
  return true;
}

export async function deleteOldLogMessages() {
  // Generate the key for the oldest day to preserve.
  const olderThanDayCount = _getMaxRetentionDays();
  if (olderThanDayCount <= 0) throw Error('Unexpected'); // Don't call this function if retention days not set.
  const oldestDayPath = _getPastDayPath(olderThanDayCount);

  // Because the keys are stored as `/log/YYYY-MM-DD.txt`, they are chronologically sortable.
  // Find each key that came before the threshold key and delete it.
  const dayPaths = await findAllLoggedDays();
  const dayPathsToDelete = dayPaths.filter(dayPath => dayPath < oldestDayPath);
  const promises = dayPathsToDelete.map(deleteLogTextForDay);
  return await Promise.all(promises);
}

export async function deleteAllLogMessages() {
  const dayPathsToDelete = await findAllLoggedDays();
  const promises = dayPathsToDelete.map(deleteLogTextForDay);
  return await Promise.all(promises);
}

export async function applyLoggingSettings(loggingSettings:Setting[]) {
  theLoggingSettings = loggingSettings;
  const maxRetentionDays = _getMaxRetentionDays();
  if (maxRetentionDays > 0) await deleteOldLogMessages();
}

export function setAppName(appName:string) {
  if (appName !== theAppName) {
    theAppName = appName;
    log(`*** ${appName} session ***`);
  }
}