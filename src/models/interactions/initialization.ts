import { getAppMetaData } from "@/appMetadata/appMetadataUtil";
import SupportedModel from "@/appMetadata/types/SupportedModel";

export async function findOtherModelCount(supportedModels?:SupportedModel[]):Promise<number> {
  if (!supportedModels) {
    const appMetaData = await getAppMetaData();
    supportedModels = appMetaData.supportedModels;
  }
  return Math.max(0, supportedModels.length - 1);
}