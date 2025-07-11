import styles from './HeadingButton.module.css';

type Props = {
  text:string,
  onClick:any
  disabled?:boolean
}

function HeadingButton({ text, onClick, disabled }:Props) {
  const buttonClass = disabled ? styles.headingButtonDisabled : styles.headingButton;
  const textClass = disabled ? styles.headingButtonTextDisabled : styles.headingButtonText;
  return (
    <button className={buttonClass} onClick={onClick} disabled={disabled}>
      <span className={textClass}>{text}</span>
    </button>
  );
}

export default HeadingButton;