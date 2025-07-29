import SupportedModel, { isSupportedModelFormat } from "./SupportedModel";

type AppMetaData = {
  id:string;                        // Unique identifier for the app.
  name:string;                      // Display name of the app.
  description:string;               // Description of the app.
  supportedModels:SupportedModel[]; // Array of models supported by the app.
};

export function isAppMetaDataFormat(maybeAppMetaData:any): boolean {
  if (!maybeAppMetaData || typeof maybeAppMetaData !== 'object') return false;
  if (typeof maybeAppMetaData.id !== 'string') return false;
  if (typeof maybeAppMetaData.name !== 'string') return false;
  if (typeof maybeAppMetaData.description !== 'string') return false;
  if (!Array.isArray(maybeAppMetaData.supportedModels)) return false;
  return maybeAppMetaData.supportedModels.every(isSupportedModelFormat);
}

export default AppMetaData;