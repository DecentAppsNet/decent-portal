// Add alphabetically, but don't reassign enum values, or stored data will be incompatible.
enum SettingType {
  BOOLEAN_TOGGLE = 1,
  NUMERIC = 2,
  SUPPORTED_MODEL = 3,
  TEXT = 0,
}

export default SettingType;