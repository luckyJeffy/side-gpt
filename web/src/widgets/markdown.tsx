import { memo, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import RehypeHighlight from 'rehype-highlight'
import RehypeKatex from 'rehype-katex'
import RemarkBreaks from 'remark-breaks'
import RemarkGfm from 'remark-gfm'
import RemarkMath from 'remark-math'

import 'katex/dist/katex.min.css'

function escapeDollarNumber(text: string) {
  let escapedText = ''

  for (let i = 0; i < text.length; i += 1) {
    let char = text[i]
    const nextChar = text[i + 1] || ' '

    if (char === '$' && nextChar >= '0' && nextChar <= '9') {
      char = '\\$'
    }

    escapedText += char
  }

  return escapedText
}

interface MarkdownContentProps {
  content: string
}

const MarkdownContent = memo((props: MarkdownContentProps) => {
  const { content } = props
  const escapedContent = useMemo(() => escapeDollarNumber(content), [content])

  return (
    <ReactMarkdown
      remarkPlugins={[RemarkMath, RemarkGfm, RemarkBreaks]}
      rehypePlugins={[
        RehypeKatex,
        [
          RehypeHighlight,
          {
            detect: false,
            ignoreMissing: true,
          },
        ],
      ]}
      components={{
        p: (pProps) => <p {...pProps} dir="auto" />,
        a: (aProps) => {
          const href = aProps.href || ''
          const isInternal = /^\/#/i.test(href)
          const target = isInternal ? '_self' : aProps.target ?? '_blank'

          return <a {...aProps} target={target} />
        },
      }}
    >
      {escapedContent}
    </ReactMarkdown>
  )
})

export { MarkdownContent }
