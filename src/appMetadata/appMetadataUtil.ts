import { assertNonNullable } from "@/common/assertUtil";
import { fetchAppMetadataText } from "./fetchAppMetaData";
import AppMetaData, { isAppMetaDataFormat } from "./types/AppMetaData";

// Only need to load the app metadata once per session, so cache it.
let theAppMetaData:AppMetaData|null = null;

// For testing purposes.
export function clearAppMetaDataCache():void {
  theAppMetaData = null;
}

// Convenience function - assumes loaded to avoid async handling.
export function getAppId():string {
  if (!theAppMetaData) throw new Error('App metadata not initialized yet.');
  return theAppMetaData.id;
}

// Convenience function - assumes loaded to avoid async handling.
export function getAppName():string {
  if (!theAppMetaData) throw new Error('App metadata not initialized yet.');
  return theAppMetaData.name;
}

export async function initAppMetaData():Promise<void> {
  if (theAppMetaData) return; // Already initialized.
  const json = await fetchAppMetadataText();
  let appMetaData:AppMetaData;
  try {
    appMetaData = JSON.parse(json);
  } catch (e) {
    throw new Error(`Failed to parse app metadata JSON: ` + e);
  }
  if (!isAppMetaDataFormat(appMetaData)) throw new Error('Invalid app metadata format.');
  theAppMetaData = appMetaData;
}

export async function getAppMetaData():Promise<AppMetaData> {
  if (!theAppMetaData) await initAppMetaData();
  assertNonNullable(theAppMetaData);
  return theAppMetaData;
}