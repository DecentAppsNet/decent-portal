import { useState, useRef, ReactNode, MouseEvent, useEffect, CSSProperties } from 'react';
import { createPortal } from 'react-dom';

import styles from './Popover.module.css';
import Direction from './types/Direction';
import { calcPopoverPositionStyle, getTryDirections } from './popOverUtil';

type Props = {
  children:ReactNode;  // Element that triggers the popover
  content:ReactNode;   // Content to show in the popover
  preferredDirection?:Direction|Direction[]; // Optional preferred direction(s) for the popover to display relative to the trigger element's rect.
  allowedDirections?:Direction[]; // Optional allowed directions for the popover to display. If specified, only these directions will be considered.
};

const POPOVER_HIDDEN_STYLE:CSSProperties = { 'visibility': 'hidden' };

function Popover({ children, content, preferredDirection, allowedDirections }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [tryDirections, setTryDirections] = useState<Direction[]>([]);
  const [popoverPositionStyle, setPopoverPositionStyle] = useState<CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const directions = getTryDirections(preferredDirection, allowedDirections);
    setTryDirections(directions);
  }, []);

  const contentBoxStyle = isOpen ? popoverPositionStyle : POPOVER_HIDDEN_STYLE;

  function _onMouseOver(event:MouseEvent<HTMLDivElement>) {
    if (!containerRef.current || !contentRef.current || isOpen) return;
    const relatedTarget = event.relatedTarget as HTMLDivElement | null;
    if (relatedTarget && containerRef.current.contains(relatedTarget)) return; // Ignore if moving within the container
    const nextPopoverPositionStyle = calcPopoverPositionStyle(tryDirections, containerRef.current, contentRef.current);
    setPopoverPositionStyle(nextPopoverPositionStyle);
    setIsOpen(true);
  };

  function _onMouseOut(event:MouseEvent<HTMLDivElement>) {
    if (!containerRef.current || !contentRef.current || !isOpen) return;
    const relatedTarget = event.relatedTarget as Node | null;
    const isInsideContent = contentRef.current.contains(relatedTarget);
    const isInsideContainer = containerRef.current.contains(relatedTarget);
    if (isInsideContainer || isInsideContent) return; // Don't hide if moving within the contentBox.
    setIsOpen(false);
  };

  const popoverContent = createPortal(<div className={styles.contentBox} style={contentBoxStyle} ref={contentRef} onMouseOut={_onMouseOut}>{content}</div>, document.body);

  return (
    <div className={styles.container} ref={containerRef}>
      <div onMouseOver={_onMouseOver} onMouseOut={_onMouseOut}>{children}</div>
      {popoverContent}
    </div>
  );
}

export default Popover;