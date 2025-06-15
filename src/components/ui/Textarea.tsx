// app/components/Textarea.tsx
import React, {
  CSSProperties,
  TextareaHTMLAttributes,
  useRef,
  useState,
} from "react";
import styled from "styled-components";
import { useSpring, animated } from "@react-spring/web";

type TextareaProps = {
  value?: string;
  onChange?: (value: string) => void;
  style?: CSSProperties;
};


const Container = styled.div`
  position: relative;
  width: 100%;
  height: 5.5rem;
  border: 1px solid #ddd;
  border-radius: 2px;
  overflow: hidden;
`;

const StyledTextarea = styled.textarea`
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 0.5rem 0.5rem;
  font-size: 1rem;
  font-family: "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  line-height: 1.5rem;
  color: #333;
  background: #fdfdfd;
  border: none;
  resize: none;
  outline: none;
  caret-color: #0005;
`;

const AnimatedContainer = animated(Container);

export default function Textarea({ style, value, onChange }: TextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [focused, setFocused] = useState(false);

  const springStyle = useSpring({
    transform: focused ? "scale(1.05)" : "scale(1)",
    config: { tension: 300, friction: 20 },
  });

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = textareaRef.current;
      if (!ta) return;
      const { selectionStart, selectionEnd, value } = ta;
      const before = value.slice(0, selectionStart);
      const after = value.slice(selectionEnd);
      const cursor = selectionStart + 1;
      ta.value = before + "\t" + after;
      ta.setSelectionRange(cursor, cursor);
    }
  };


  return (
    <AnimatedContainer style={{ ...springStyle, ...style }}>
        <StyledTextarea
          ref={textareaRef}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={e => onChange?.(e.target.value)}
          onKeyDown={handleKeyDown}
        />
    </AnimatedContainer>
  );
}