import { useState, useEffect, useRef } from "react";

const NAV_KEYS = [
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "Tab",
  "Escape",
  "Enter",
  " ",
];
const COLS = 5;

export const ArrowPOC = (props: any) => {
  const { color_palette, selected_color, allow_no_color, on_color_change } = props;
  const [is_visible, set_is_visible] = useState(false);

  const [current_focused_index, setCurrent_focused_index] = useState(-1);
  const [prevCurrent_focused_index, set_prevCurrent_focused_index] = useState<number | null>(null);
  const allow_no_colorRef = useRef<HTMLDivElement>(null);
  const trigger_button_ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!is_visible) return;

    setCurrent_focused_index(() => {
      const selectedIndex = color_palette.findIndex(
        (colorObject) => colorObject.color === selected_color
      );

      const indexToFocus = selectedIndex !== -1 ? selectedIndex : 0;

      return indexToFocus;
    });
  }, [selected_color, is_visible]);

  const handle_grid_key_down = (e: React.KeyboardEvent) => {
    if (!NAV_KEYS.includes(e.key)) return;

    const isShiftTab = e.key === "Tab" && e.shiftKey;

    if (isShiftTab) {
      e.preventDefault();
      set_is_visible(false);
      trigger_button_ref.current?.focus();
      return;
    }

    if (e.key === "Tab" && allow_no_color) {
      set_prevCurrent_focused_index(current_focused_index);
      setCurrent_focused_index(-1);
      allow_no_colorRef.current?.focus();
      return;
    }

    if (e.key === "Tab") {
      set_is_visible(false);
      return;
    }
    if (e.key === "Escape") {
      set_is_visible(false);
      trigger_button_ref.current?.focus();
      return;
    }
    e.preventDefault();
    setCurrent_focused_index((prev) => {
      const totalItems = color_palette.length;
      let nextIndex = prev;

      const is_last_in_column = (index: number) => index + COLS >= totalItems;
      const is_first_in_column = (index: number) => index - COLS < 0;

      switch (e.key) {
        case "ArrowRight":
          return (prev + 1) % totalItems;

        case "ArrowLeft":
          return (prev - 1 + totalItems) % totalItems;

        case "ArrowDown":
          nextIndex = prev + COLS;
          if (is_last_in_column(prev)) {
            return (nextIndex %= COLS);
          } else {
            return nextIndex;
          }

        case "ArrowUp":
          if (is_first_in_column(prev)) {
            const rows = Math.floor((totalItems - 1) / COLS);
            nextIndex = prev + rows * COLS;
            if (nextIndex >= totalItems) {
              nextIndex -= COLS;
            }
          } else {
            nextIndex = prev - COLS;
          }
          return nextIndex;

        case "Enter":
        case " ":
          e.stopPropagation();
          const selected_color = color_palette[prev];
          on_color_change(selected_color);
          set_is_visible(false);
          trigger_button_ref.current?.focus();
          return prev;

        default:
          return prev;
      }
    });
  };

  const handle_no_color_key_down = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "Tab":
        if (!e.shiftKey) {
          set_is_visible(false);
        } else {
          e.preventDefault();
          if (current_focused_index === -1 && prevCurrent_focused_index !== null) {
            setCurrent_focused_index(prevCurrent_focused_index);
          }
        }
        break;

      case "Enter":
      case " ":
        e.preventDefault();
        e.stopPropagation();
        if (!e.shiftKey) {
          on_color_change({ color: "" });
          set_is_visible(false);
          trigger_button_ref.current?.focus();
        }
        break;

      case "Escape":
        set_is_visible(false);
        trigger_button_ref.current?.focus();
        break;

      default:
        break;
    }
  };
};
