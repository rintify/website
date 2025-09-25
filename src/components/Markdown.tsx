import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import './MarkdownRenderer.module.css'
import 'katex/dist/katex.min.css'
import { CSSProperties } from 'react'

export const MarkdownBox = ({ content, style }: { content: string; style?: CSSProperties }) => {
  return (
    <div
      style={{
        ...style,
      }}
    >
      <ReactMarkdown
        children={content.replace(/\n/g, '  \n')}
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
      />
    </div>
  )
}
