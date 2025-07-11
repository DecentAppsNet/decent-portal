import { deleteByKey, getAllKeysAtPath, getText, setText } from "./pathStore";

// Format day path as YYYY-MM-DD.
export function getDayPath(timestamp:number):string {
  const date = new Date(timestamp);
  const dayPath = date.getFullYear().toString().padStart(4, '0') + '-' +
    (date.getMonth() + 1).toString().padStart(2, '0') + '-' +
    (date.getDate()).toString().padStart(2, '0');
  return dayPath;
}

function _dayPathToKey(dayPath:string):string {
  return `/log/${dayPath}.txt`;
}

function _keyToDayPath(key:string):string {
  if (!key.startsWith('/log/') || !key.endsWith('.txt')) throw Error(`Invalid log key: ${key}`);
  return key.slice(5, -4); // Remove '/log/' prefix and '.txt' suffix.
}

export async function getLogTextForDay(dayPath:string):Promise<string|null> {
  const key = _dayPathToKey(dayPath);
  return await getText(key);
}

export async function setLogTextForDay(dayPath:string, text:string) {
  const key = _dayPathToKey(dayPath);
  await setText(key, text);
}

export async function deleteLogTextForDay(dayPath:string) {
  const key = _dayPathToKey(dayPath);
  await deleteByKey(key);
}

// Returns a list of all days containing logs in the format YYYY-MM-DD, sorted chronologically (earlier dates first).
export async function findAllLoggedDays():Promise<string[]> {
  const keys = await getAllKeysAtPath('/log/');
  return keys.map(_keyToDayPath).sort((a, b) => a.localeCompare(b));
}