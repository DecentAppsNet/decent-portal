import { fetchAppMetadataText } from "./fetchAppMetaData";
import AppMetaData, { isAppMetaDataFormat } from "./types/AppMetaData";

// Only need to load the app metadata once per session, so cache it.
let theAppMetaData:AppMetaData|null = null;

// For testing purposes.
export function clearAppMetaDataCache():void {
  theAppMetaData = null;
}

export async function getAppMetaData():Promise<AppMetaData> {
  if (theAppMetaData) return theAppMetaData;
  const json = await fetchAppMetadataText();
  let appMetaData:AppMetaData;
  try {
    appMetaData = JSON.parse(json);
  } catch (e) {
    throw new Error(`Failed to parse app metadata JSON: ` + e);
  }
  if (!isAppMetaDataFormat(appMetaData)) throw new Error('Invalid app metadata format.');
  theAppMetaData = appMetaData;
  return appMetaData;
}