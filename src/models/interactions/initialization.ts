import { getAppMetaData } from "@/appMetadata/appMetadataUtil";
import SupportedModel from "@/appMetadata/types/SupportedModel";

export async function findOtherModelCount(supportedModels?:SupportedModel[]):Promise<number> {
  console.log('!!1');
  if (!supportedModels) {
    console.log('!!2');
    const appMetaData = await getAppMetaData();
    supportedModels = appMetaData.supportedModels;
  }
  console.log('!!3');
  return Math.max(0, supportedModels.length - 1);
}