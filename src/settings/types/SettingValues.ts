type SettingValues = { [key:string]:number|string|boolean };

export function isSettingValuesFormat(maybeValues:any): boolean {
  return !!maybeValues && 
    typeof maybeValues === 'object' &&
    !Array.isArray(maybeValues) &&
    Object.keys(maybeValues).every(key =>
      typeof key === 'string' &&
      (typeof maybeValues[key] === 'number' ||
      typeof maybeValues[key] === 'string' ||
      typeof maybeValues[key] === 'boolean')
    );
}

export default SettingValues;