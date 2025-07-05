import { hasStorageSupport } from "./featureUtil";

export async function estimateAvailableStorage() {
  if (!hasStorageSupport()) return 0;
  const estimate = await navigator.storage.estimate();
  if (!estimate || estimate.quota === undefined || estimate.usage === undefined) return 0;
  
  const quota = estimate.quota;
  const usage = estimate.usage;
  return quota - usage;
}