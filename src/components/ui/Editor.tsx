// SlateEditor.tsx
import React, { useCallback, useMemo, useState } from 'react';
import {
  createEditor,
  Descendant,
  BaseEditor,
  Text,
  NodeEntry,
} from 'slate';
import {
  Slate,
  Editable,
  withReact,
  ReactEditor,
  RenderLeafProps,
} from 'slate-react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

// ——— カスタム型定義 ———
type ParagraphElement = {
  type: 'paragraph';
  children: CustomText[];
};

type CustomText = {
  text: string;
  // ハッシュタグ用フラグ
  hashTag?: boolean;
  // 数式用フラグ
  math?: boolean;
  // マーカーを除いた数式の中身
  mathContent?: string;
  // ブロック数式かどうか
  mathBlock?: boolean;
};

type CustomElement = ParagraphElement;
type CustomDescendant = CustomElement | CustomText;

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

// ——— 初期値 ———
const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [
      {
        text: 'ここに $E=mc^2$ や $$\\int_0^1 x^2 \\,dx$$、そして #ハッシュタグ を入力できます。',
      },
    ],
  },
];

// ——— インラインスタイル ———
const styles: { [key: string]: React.CSSProperties } = {
  editorContainer: {
    border: '1px solid #ccc',
    padding: '8px',
    minHeight: '150px',
    borderRadius: '4px',
  },
  editableContent: {
    outline: 'none',
    width: '100%',
    height: '100%',
  },
};

type Props = {
  text: string;
  onChange: (text: string) => void;
};

export default function SlateEditor({ text, onChange }: Props) {
  const editor = useMemo(() => withReact(createEditor()), []);
  const [value, setValue] = useState<Descendant[]>(initialValue);

  // ——— デコレーター ———
  const decorate = useCallback((entry: NodeEntry) => {
    const [node, path] = entry;
    const ranges: Array<any> = [];

    if (Text.isText(node)) {
      const { text } = node;
      let match;

      // ブロック数式: $$...$$
      const blockRegex = /\$\$([\s\S]+?)\$\$/g;
      while ((match = blockRegex.exec(text)) !== null) {
        const start = match.index;
        const end = start + match[0].length;
        ranges.push({
          anchor: { path, offset: start },
          focus: { path, offset: end },
          math: true,
          mathContent: match[1],
          mathBlock: true,
        });
      }

      // インライン数式: $...$
      const inlineRegex = /\$([^$\n]+?)\$/g;
      while ((match = inlineRegex.exec(text)) !== null) {
        const start = match.index;
        const end = start + match[0].length;
        ranges.push({
          anchor: { path, offset: start },
          focus: { path, offset: end },
          math: true,
          mathContent: match[1],
          mathBlock: false,
        });
      }

      // ハッシュタグ: #〇〇
      const tagRegex = /#[^\s#]+/g;
      while ((match = tagRegex.exec(text)) !== null) {
        const start = match.index;
        const end = start + match[0].length;
        ranges.push({
          anchor: { path, offset: start },
          focus: { path, offset: end },
          hashTag: true,
        });
      }
    }

    return ranges;
  }, []);

  // ——— カスタムリーフ ———
  const renderLeaf = useCallback((props: RenderLeafProps) => {
    const { attributes, children, leaf } = props;
    const l = leaf as CustomText;

    // ハッシュタグ
    if (l.hashTag) {
      return (
        <span
          {...attributes}
          style={{ color: 'green', fontSize: '1.2em' }}
        >
          {children}
        </span>
      );
    }

    // 数式
    if (l.math) {
      if (l.mathBlock) {
        return (
          <div {...attributes}>
            <BlockMath>
              {l.mathContent!}
            </BlockMath>
          </div>
        );
      } else {
        return (
          <span {...attributes}>
            <InlineMath>
              {l.mathContent!}
            </InlineMath>
          </span>
        );
      }
    }

    // 通常テキスト
    return <span {...attributes}>{children}</span>;
  }, []);

  // ——— onChange でプレーンテキスト化 ———
  const handleChange = useCallback(
    (newValue: Descendant[]) => {
      setValue(newValue);

      const plainText = newValue
        .map(node => {
          if ('children' in node && Array.isArray(node.children)) {
            return node.children.map(child => child.text).join('');
          }
          return '';
        })
        .filter(Boolean)
        .join('\n');

      onChange(plainText);
    },
    [onChange]
  );

  return (
    <Slate editor={editor} initialValue={value} onChange={handleChange}>
      <div style={styles.editorContainer}>
        <Editable
          decorate={decorate}
          renderLeaf={renderLeaf}
          style={styles.editableContent}
        />
      </div>
    </Slate>
  );
}
