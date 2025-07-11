import { describe, it, expect, beforeEach, beforeAll } from 'vitest';

import { handleValidation, setClearValidationMessageDelay } from '../setterUtil';
import TextSetting from '@/settings/types/TextSetting';
import SettingType from '@/settings/types/SettingType';
import Setting from '@/settings/types/Setting';
import ValidationFailure, { LAST_VALID_VALUE } from '@/settings/types/ValidationFailure';
import { wait } from '@/common/waitUtil';

const UNSET_VALUE = 'UNSET_VALUE';
const CLEAR_VALIDATION_MESSAGE_DELAY = 1;
let theLastValidationMessage:string|null = UNSET_VALUE;

function _setValidationMessage(message:string) {
  theLastValidationMessage = message;
}

describe('setterUtil', () => {
  beforeAll(() => {
    setClearValidationMessageDelay(CLEAR_VALIDATION_MESSAGE_DELAY);
  });

  beforeEach(() => {
    theLastValidationMessage = UNSET_VALUE;
  });

  describe('handleValidation()', () => {
    it('set validation message to null and returns true if no validate settings callback passed', () => {
      const nextSetting:TextSetting = {id:'id', type:SettingType.TEXT, label:'label', value:'x'};
      const lastValidValue = 'y';
      const onValidateSetting = undefined;
      const result = handleValidation(nextSetting, lastValidValue, _setValidationMessage, onValidateSetting);
      expect(theLastValidationMessage).toEqual(null);
      expect(result).toBe(true);
    });

    it('sets validation message to null and returns true if validation settings callback returns no failure', () => {
      function _onValidateSetting(_setting:Setting):ValidationFailure|null {
        return null;
      }
      const nextSetting:TextSetting = {id:'id', type:SettingType.TEXT, label:'label', value:'x'};
      const lastValidValue = 'y';
      const result = handleValidation(nextSetting, lastValidValue, _setValidationMessage, _onValidateSetting);
      expect(theLastValidationMessage).toEqual(null);
      expect(result).toBe(true);
    });

    it('sets validation message and returns false if validation settings callback returns failure with no next value', () => {
      function _onValidateSetting(_setting:Setting):ValidationFailure|null {
        return { failReason:'Invalid value', nextValue:undefined };
      }
      const nextSetting:TextSetting = {id:'id', type:SettingType.TEXT, label:'label', value:'x'};
      const lastValidValue = 'y';
      const result = handleValidation(nextSetting, lastValidValue, _setValidationMessage, _onValidateSetting);
      expect(theLastValidationMessage).toEqual('Invalid value');
      expect(result).toBe(false);
    });

    it('sets validation message to null and returns false if validation settings callback returns failure with no failure reason', () => {
      function _onValidateSetting(_setting:Setting):ValidationFailure|null {
        return { nextValue:undefined };
      }
      const nextSetting:TextSetting = {id:'id', type:SettingType.TEXT, label:'label', value:'x'};
      const lastValidValue = 'y';
      const result = handleValidation(nextSetting, lastValidValue, _setValidationMessage, _onValidateSetting);
      expect(theLastValidationMessage).toEqual(null);
      expect(result).toBe(false);
    });

    it('sets validation message and returns true if validation settings callback returns failure with next value', async () => {
      function _onValidateSetting(_setting:Setting):ValidationFailure|null {
        return { failReason:'Invalid value', nextValue:'z' };
      }
      const nextSetting:TextSetting = {id:'id', type:SettingType.TEXT, label:'label', value:'x'};
      const lastValidValue = 'y';
      const result = handleValidation(nextSetting, lastValidValue, _setValidationMessage, _onValidateSetting);
      expect(theLastValidationMessage).toEqual('Invalid value');
      expect(nextSetting.value).toEqual('z');
      expect(result).toBe(true);
      await wait(CLEAR_VALIDATION_MESSAGE_DELAY + 100); // Must wait to avoid next test won't be affected.
      expect(theLastValidationMessage).toEqual(null);
    });

    it('sets validation message and returns last valid value if validation settings callback returns failure with LAST_VALID_VALUE', async () => {
      function _onValidateSetting(_setting:Setting):ValidationFailure|null {
        return { failReason:'Invalid value', nextValue:LAST_VALID_VALUE };
      }
      const nextSetting:TextSetting = {id:'id', type:SettingType.TEXT, label:'label', value:'x'};
      const lastValidValue = 'y';
      const result = handleValidation(nextSetting, lastValidValue, _setValidationMessage, _onValidateSetting);
      expect(theLastValidationMessage).toEqual('Invalid value');
      expect(nextSetting.value).toEqual('y');
      expect(result).toBe(true);
      await wait(CLEAR_VALIDATION_MESSAGE_DELAY + 100); // Must wait to avoid next test won't be affected.
      expect(theLastValidationMessage).toEqual(null);
    });

    it('debounces clearing validation message', async () => {
      function _onValidateSetting(_setting:Setting):ValidationFailure|null {
        return { failReason:'Invalid value', nextValue:LAST_VALID_VALUE };
      }
      const nextSetting:TextSetting = {id:'id', type:SettingType.TEXT, label:'label', value:'x'};
      const lastValidValue = 'y';
      handleValidation(nextSetting, lastValidValue, _setValidationMessage, _onValidateSetting);
      handleValidation(nextSetting, lastValidValue, _setValidationMessage, _onValidateSetting);
      await wait(CLEAR_VALIDATION_MESSAGE_DELAY + 100); // Must wait to avoid next test won't be affected.
      expect(theLastValidationMessage).toEqual(null);
    });
  });
});