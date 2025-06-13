// app/components/Textarea.tsx
import React, {
  CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import styled from "styled-components";
import { useSpring, animated } from "@react-spring/web";
import 'katex/dist/katex.min.css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

/* ===== 公開 Props ======================================================= */
export type TextareaProps = {
  value?: string;                 // Controlled 値
  onChange?: (v: string) => void; // 全文変更
  style?: CSSProperties;          // コンテナ追加スタイル
};

/* ===== styled-components =============================================== */
const Base = styled.div`
  border: 1px solid #ddd;
  border-radius: 2px;
  overflow: hidden;
  background: #fdfdfd;
  font-size: 1rem;
  line-height: 1.5;
  color: #333;
  display: flex;
  flex-direction: column;
`;
const Container = animated(Base);

const Display = styled.div`
  padding: 6px 16px;
  white-space: pre-wrap;
  word-wrap: break-word;
  cursor: text;

  /* Markdown 出力要素のマージンをリセット */
  & > * {
    margin: 0 0;
    line-height: 1.5;
  }
`;

const Field = styled.input`
  padding: 0 16px;
  margin: auto 0;
  width: 100%;
  border: 0;
  outline: none;
  background: #f6f6f6;
  font: inherit;
  caret-color: #0005;
`;

/* ===== 本体 ============================================================ */
export default function Textarea({
  value,
  onChange,
  style,
  ...rest
}: TextareaProps) {
  /* ---------- Controlled 判定 & 行状態 ---------- */
  const controlled = value != null;
  const [internalLines, setInternalLines] = useState<string[]>(
    (value ?? "").split("\n")
  );
  const lines = controlled ? value!.split("\n") : internalLines;

  /* ---------- 編集中の行 & 桁 ---------- */
  const [editPos, setEditPos] = useState<{ row: number; col: number } | null>(
    null
  );
  const inputRef = useRef<HTMLInputElement>(null);

  /* ---------- IME Composition 状態 ---------- */
  const [isComposing, setIsComposing] = useState(false);

  /* caret を行切替後に合わせる */
  useEffect(() => {
    if (editPos && inputRef.current) {
      requestAnimationFrame(() => {
        inputRef.current!.selectionStart = editPos.col;
        inputRef.current!.selectionEnd = editPos.col;
        inputRef.current!.focus();
      });
    }
  }, [editPos]);

  /* ---------- 行配列の更新 ---------- */
  const commitLines = useCallback(
    (newLines: string[]) => {
      const txt = newLines.join("\n");
      if (controlled) onChange?.(txt);
      else {
        setInternalLines(newLines);
        onChange?.(txt);
      }
    },
    [controlled, onChange]
  );

  /* ---------- onKeyDown & onChange（既存ロジック） ---------- */
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    idx: number
  ) => {
    const el = e.currentTarget;
    const caret = el.selectionStart ?? 0;
    switch (e.key) {
      case "Enter": {
        if (isComposing) return;
        e.preventDefault();
        const left = el.value.slice(0, caret);
        const right = el.value.slice(caret);
        const next = [...lines];
        next[idx] = left;
        next.splice(idx + 1, 0, right);
        commitLines(next);
        setEditPos({ row: idx + 1, col: 0 });
        break;
      }
      case "Backspace": {
        if (caret !== 0 || idx === 0) return;
        e.preventDefault();
        const prevLen = lines[idx - 1].length;
        const next = [...lines];
        next[idx - 1] = next[idx - 1] + next[idx];
        next.splice(idx, 1);
        commitLines(next);
        setEditPos({ row: idx - 1, col: prevLen });
        break;
      }
      case "ArrowUp": {
        if (idx === 0) return;
        e.preventDefault();
        const col = Math.min(caret, lines[idx - 1].length);
        setEditPos({ row: idx - 1, col });
        break;
      }
      case "ArrowDown": {
        if (idx === lines.length - 1) return;
        e.preventDefault();
        const col = Math.min(caret, lines[idx + 1].length);
        setEditPos({ row: idx + 1, col });
        break;
      }
      case "ArrowLeft": {
        if (caret !== 0 || idx === 0) return;
        e.preventDefault();
        setEditPos({ row: idx - 1, col: lines[idx - 1].length });
        break;
      }
      case "ArrowRight": {
        if (caret !== el.value.length || idx === lines.length - 1) return;
        e.preventDefault();
        setEditPos({ row: idx + 1, col: 0 });
        break;
      }
      default:
        break;
    }
  };
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    idx: number
  ) => {
    const next = [...lines];
    next[idx] = e.target.value;
    commitLines(next);
  };

  /* ---------- Markdown部クリックで編集開始 ---------- */
  const finishEdit = () => setEditPos(null);

  /* ---------- 前後ブロッククリック用ハンドラ ---------- */
  const handlePreClick = () => {
    if (editPos && editPos.row > 0) {
      const prevRow = editPos.row - 1;
      setEditPos({ row: prevRow, col: lines[prevRow].length });
    }
  };
  const handlePostClick = () => {
    if (editPos && editPos.row < lines.length - 1) {
      const nextRow = editPos.row + 1;
      setEditPos({ row: nextRow, col: 0 });
    }
  };

  /* ---------- 三つ組テキストを算出 ---------- */
  const row = editPos?.row ?? -1;
  const preLines  = row >= 1 ? lines.slice(0, row).join("\n") : "";
  const curLine   = row >= 0 ? lines[row] : "";
  const postLines = row >= 0 && row < lines.length - 1
    ? lines.slice(row + 1).join("\n")
    : "";

  /* ---------- アニメーション ---------- */
  const spring = useSpring({
    transform: editPos ? "scale(1.05)" : "scale(1)",
    config: { tension: 300, friction: 20 },
  });

  /* ---------- JSX ---------- */
  return (
    <Container style={{ ...spring, ...style }} {...rest}>
      {editPos === null ? (
        // 編集中でないときは全文 Markdown 表示
        <Display onMouseDown={() => setEditPos({ row: 0, col: 0 })}>
          <ReactMarkdown
            children={lines.join("\n")}
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
          />
        </Display>
      ) : (
        // 編集中のときは「前半」「編集中行」「後半」の３ブロック
        <>
          {/* 1) 編集行より前 */}
          <Display onMouseDown={handlePreClick}>
            <ReactMarkdown
              children={preLines || "\u00a0"}
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
            />
          </Display>

          {/* 2) 編集行 */}
          <Field
            ref={inputRef}
            value={curLine}
            onChange={e => handleChange(e, row)}
            onKeyDown={e => handleKeyDown(e, row)}
            onBlur={finishEdit}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
          />

          {/* 3) 編集行より後 */}
          <Display onMouseDown={handlePostClick}>
            <ReactMarkdown
              children={postLines || "\u00a0"}
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
            />
          </Display>
        </>
      )}
    </Container>
  );
}
