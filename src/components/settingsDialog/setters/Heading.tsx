import HeadingType from "@/settings/types/Heading";
import styles from "./Setters.module.css";
import HeadingButton from "./HeadingButton";

type Props = {
  heading:HeadingType,
  disabled?:boolean
}

function _renderButtons(heading:HeadingType, disabled?:boolean) {
  if (!heading.buttons) return null;
  return heading.buttons.map(button => {
    return (
        <HeadingButton key={button.value} text={button.label} onClick={() => heading.onButtonClick?.(button.value)} disabled={disabled}/>
    );
  });
}

function Heading({heading, disabled}:Props) {
  const buttonsContent = !heading.buttons ? null : <div className={styles.buttonsContainer}>{_renderButtons(heading, disabled)}</div>;
  const indentStyle = heading.indentLevel ? { marginLeft: `${heading.indentLevel * 1}vh` } : {};
  const headingClass = disabled ? styles.headingDisabled : styles.heading;
  return (
    <div className={headingClass} style={indentStyle}>
      <p>{heading.label}</p>
      {buttonsContent}
    </div>
  );
}

export default Heading;