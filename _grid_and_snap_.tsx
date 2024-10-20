import { useState, useEffect, useRef } from "react";

const NAVIGATION_KEYS = [
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "Tab",
  "Escape",
  "Enter",
  " ",
];
const COLUMNS = 5;

export const ArrowPOC = (props: any) => {
  const { colorPalette, selectedColor, allowNoColor, onColorChange } = props;
  const [visible, setVisible] = useState(false);

  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [prevFocusedIndex, setPrevFocusedIndex] = useState<number | null>(null);
  const allowNoColorRef = useRef<HTMLDivElement>(null);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!visible) return;

    setFocusedIndex(() => {
      const selectedIndex = colorPalette.findIndex(
        (colorObject) => colorObject.color === selectedColor
      );

      const indexToFocus = selectedIndex !== -1 ? selectedIndex : 0;

      return indexToFocus;
    });
  }, [selectedColor, visible]);

  const handleGridKeyDown = (e: React.KeyboardEvent) => {
    if (!NAVIGATION_KEYS.includes(e.key)) return;

    const isShiftTab = e.key === "Tab" && e.shiftKey;

    if (isShiftTab) {
      e.preventDefault();
      setVisible(false);
      triggerButtonRef.current?.focus();
      return;
    }

    if (e.key === "Tab" && allowNoColor) {
      setPrevFocusedIndex(focusedIndex);
      setFocusedIndex(-1);
      allowNoColorRef.current?.focus();
      return;
    }

    if (e.key === "Tab") {
      setVisible(false);
      return;
    }
    if (e.key === "Escape") {
      setVisible(false);
      triggerButtonRef.current?.focus();
      return;
    }
    e.preventDefault();
    setFocusedIndex((prev) => {
      const totalItems = colorPalette.length;
      let nextIndex = prev;

      const isLastInColumn = (index: number) => index + COLUMNS >= totalItems;
      const isFirstInColumn = (index: number) => index - COLUMNS < 0;

      switch (e.key) {
        case "ArrowRight":
          return (prev + 1) % totalItems;

        case "ArrowLeft":
          return (prev - 1 + totalItems) % totalItems;

        case "ArrowDown":
          nextIndex = prev + COLUMNS;
          if (isLastInColumn(prev)) {
            return (nextIndex %= COLUMNS);
          } else {
            return nextIndex;
          }

        case "ArrowUp":
          if (isFirstInColumn(prev)) {
            const rows = Math.floor((totalItems - 1) / COLUMNS);
            nextIndex = prev + rows * COLUMNS;
            if (nextIndex >= totalItems) {
              nextIndex -= COLUMNS;
            }
          } else {
            nextIndex = prev - COLUMNS;
          }
          return nextIndex;

        case "Enter":
        case " ":
          e.stopPropagation();
          const selectedColor = colorPalette[prev];
          onColorChange(selectedColor);
          setVisible(false);
          triggerButtonRef.current?.focus();
          return prev;

        default:
          return prev;
      }
    });
  };

  const handleNoColorKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "Tab":
        if (!e.shiftKey) {
          setVisible(false);
        } else {
          e.preventDefault();
          if (focusedIndex === -1 && prevFocusedIndex !== null) {
            setFocusedIndex(prevFocusedIndex);
          }
        }
        break;

      case "Enter":
      case " ":
        e.preventDefault();
        e.stopPropagation();
        if (!e.shiftKey) {
          onColorChange({ color: "" });
          setVisible(false);
          triggerButtonRef.current?.focus();
        }
        break;

      case "Escape":
        setVisible(false);
        triggerButtonRef.current?.focus();
        break;

      default:
        break;
    }
  };
};
