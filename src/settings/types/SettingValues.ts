type SettingValues = Record<string, any>;

export function isSettingValuesFormat(maybeValues:any): boolean {
  return !!maybeValues && 
         typeof maybeValues === 'object' &&
         !Array.isArray(maybeValues);
}

export default SettingValues;