import NumericRangeSetting from "@/settings/types/NumericSetting";
import styles from "./Setters.module.css";
import NumericInput from "@/components/numericInput/NumericInput";

type Props = {
  setting:NumericRangeSetting,
  onChange:(setting:NumericRangeSetting, isValid:boolean) => void,  
}

function NumericSetter({ setting, onChange }:Props) {
  
  function _onChange(value:number) {
    const nextSetting = { ...setting, value };
    // Don't need validation, because the NumericInputRange component doesn't allow invalid values.
    onChange(nextSetting, true);
  }

  return (
    <div className={styles.container}>
      <span className={styles.label}>{setting.label}</span>
      <NumericInput minValue={setting.min} maxValue={setting.max} allowDecimals={setting.useDecimal} value={setting.value} onChange={_onChange} />
    </div>
  );
}

export default NumericSetter;