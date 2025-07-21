import { ReactNode } from 'react';

import styles from './Selector.module.css';
import Popover from '../popOver/PopOver';
import Direction from '../popOver/types/Direction';

type Props = {
  disabled?:boolean,
  label?:string,
  selectedOptionNo:number,
  optionNames:string[],
  displayAsTabs?:boolean,
  onChange?:(optionNo:number) => void,
  onClick?:(optionNo:number) => void,
  popoverContent?:ReactNode[],
  popoverPreferredDirection?:Direction|Direction[]; // Optional preferred direction(s) for the popover to display relative to the trigger element's rect. Ignored if popoverContent undefined.
  popoverAllowedDirections?:Direction[], // Optional allowed directions for the popover to display. If specified, only these directions will be considered.
  iconChars?:(string|null)[], // Unicode chars to use as icons.
}

function Selector({ disabled, label, optionNames, onClick, onChange, selectedOptionNo, 
    displayAsTabs, popoverContent, popoverPreferredDirection, popoverAllowedDirections, iconChars }:Props) {

  function _onOptionClick(optionNo:number) {
    if (disabled) return;
    if (onClick) onClick(optionNo);
    if (optionNo === selectedOptionNo) return;
    if (onChange) onChange(optionNo);
  }

  const iconClass = disabled ? styles.iconDisabled : styles.icon;
  const options = optionNames.map((optionName, optionNo) => {
    const reclickableSelection = onClick !== undefined;
    const selectorButtonSelected = reclickableSelection ? styles.selectorButtonSelectedReclickable : styles.selectorButtonSelected;
    const selected = optionNo === selectedOptionNo;
    let buttonClass = disabled
      ? styles.selectorButtonDisabled
      : selected ? selectorButtonSelected : styles.selectorButton;
    const textClass = disabled
      ? styles.selectorButtonTextDisabled
      : selected ? styles.selectorButtonTextSelected : styles.selectorButtonText;

    if (displayAsTabs) {
      buttonClass = `${buttonClass} ${styles.tabButton}`;
    } else {
      if (optionNo === 0) buttonClass = `${buttonClass} ${styles.firstSelectorButton}`;
      if (optionNo === optionNames.length-1) buttonClass = `${buttonClass} ${styles.lastSelectorButton}`;
    }
    const iconContent = iconChars && iconChars[optionNo] ? <span className={iconClass}>{iconChars[optionNo]}</span> : null;
    const optionButtonContent = (
      <button key={optionName} className={buttonClass} onClick={() => _onOptionClick(optionNo) } disabled={disabled}>
        {iconContent}<span className={textClass}>{optionName}</span>
      </button>
    );
    return popoverContent 
      ? <Popover key={optionName} content={popoverContent[optionNo]} preferredDirection={popoverPreferredDirection} allowedDirections={popoverAllowedDirections}>{optionButtonContent}</Popover> 
      : optionButtonContent;
  });

  const labelElement = label ? <span className={styles.label}>{label}:</span> : null;

  return (
    <div className={styles.bar}>
      {labelElement}
      {options}
    </div>  
  );
}

export default Selector;