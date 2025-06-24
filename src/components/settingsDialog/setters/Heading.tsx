import HeadingType from "@/settings/types/Heading";
import styles from "./Setters.module.css";
import ContentButton from "@/components/contentButton/ContentButton";

type Props = {
  heading:HeadingType
}

function _renderButtons(heading:HeadingType) {
  if (!heading.buttons) return null;
  return heading.buttons.map(button => {
    return (
        <ContentButton key={button.value} text={button.label} onClick={() => heading.onButtonClick?.(button.value)} />
    );
  });
}

function Heading({heading}:Props) {
  const buttonsContent = !heading.buttons ? null : <div className={styles.buttonsContainer}>{_renderButtons(heading)}</div>;
  return (
    <div className={styles.heading}>
      <hr/>
      <p>{heading.label}</p>
      {buttonsContent}
    </div>
  );
}

export default Heading;