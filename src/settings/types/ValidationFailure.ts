/* v8 ignore next */
export const LAST_VALID_VALUE = 'LAST_VALID_VALUE';

// Because settings always begin in a valid default state, there is no need to delay
// display of validation failures to a "save" or "submit" action.

type ValidationFailure = {
  failReason?: string; // Undefined - don't show a failure message. (Useful for a silent correction made with nextValue.)
  nextValue?: any; // Undefined - allow the invalid value. LAST_VALID_VALUE - revert to the last valid value.
}

export default ValidationFailure;