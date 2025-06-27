type DisablementRule = {
  targetSettingId: string;
  criteriaSettingId: string;
  criteriaValue: any; // The value that the criteria setting must have to disable the target.
}

export default DisablementRule;