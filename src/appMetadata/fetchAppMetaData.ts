import { baseUrl } from "@/common/urlUtil";

// Put function in this module to allow for mocking in tests.
/* v8 ignore start */
export async function fetchAppMetadataText():Promise<string> {
  const appMetaDataUrl = baseUrl('app-metadata.json');
  const response = await fetch(appMetaDataUrl);
  if (!response.ok) throw new Error(`Failed to fetch app metadata from ${appMetaDataUrl}: ${response.status} ${response.statusText}`);
  return await response.text();
}
/* v8 ignore end */