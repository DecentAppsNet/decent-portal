type SupportedModel = {
  id:string;                  // Model ID.
  appBehaviorSummary: string; // Summary of how the model behaves in the app.
  beta?: boolean;             // Optional flag indicating if the model is in beta.
}

export function isSupportedModelFormat(maybeModel:any): boolean {
  if (!maybeModel || typeof maybeModel !== 'object') return false;
  if (typeof maybeModel.id !== 'string') return false;
  if (typeof maybeModel.appBehaviorSummary !== 'string') return false;
  if (maybeModel.beta !== undefined && typeof maybeModel.beta !== 'boolean') return false;
  return true;
}

export function duplicateSupportedModel(model:SupportedModel):SupportedModel {
  return { ...model };
}

export default SupportedModel;