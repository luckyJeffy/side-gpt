import { OpenAiLogo } from '@/components/icons'
import { useChatStore } from '@/store'
import { MessageRole } from '@/types'
import { MarkdownContent } from '@/widgets'

import FaceIcon from '@mui/icons-material/Face'
import {
  Avatar,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Skeleton,
  Typography,
} from '@mui/material'

import { isEmpty } from 'lodash-es'
import { useEffect, useRef, useState } from 'react'

import type { ChatMessage } from '@/types'

interface UseAutoScrollParams {
  sessionId: string
  ref: React.MutableRefObject<HTMLElement | null>
}

function useAutoScroll(params: UseAutoScrollParams) {
  const { ref } = params

  useEffect(() => {
    const domNode = ref.current

    if (domNode) {
      requestAnimationFrame(() => {
        domNode.scrollTo(0, domNode.scrollHeight)
      })
    }
  })
}

const EmptyHint = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
      }}
    >
      <OpenAiLogo sx={{ fontSize: '72px', mb: '12px' }} />
      <Typography variant="h5">How can I help you today?</Typography>
    </Box>
  )
}

interface MessageItemProps extends ChatMessage {
  index: number
}

const MessageItem: React.FC<MessageItemProps> = (props: MessageItemProps) => {
  const { index: messageIndex, ...messageItem } = props
  const { role, content, isStreaming, isError } = messageItem

  const { currentSessionIndex } = useChatStore()
  const [displayedContent, setDisplayedContent] = useState(content)

  const messageRef = useRef(messageItem)

  useEffect(() => {
    if (!isStreaming) return

    let isTyping = false
    let currentIndex = 0
    let requestAnimationFrameHandle: number

    const subscriber = useChatStore.subscribe((state) => {
      if (requestAnimationFrameHandle) {
        cancelAnimationFrame(requestAnimationFrameHandle)
      }

      const { sessions } = state
      const { messages } = sessions[currentSessionIndex]
      const message = messages[messageIndex]
      const { content: messageContent } = message

      messageRef.current = message

      function updateText() {
        if (!isTyping) {
          isTyping = true
        }

        const partialContent = messageContent.slice(0, currentIndex)
        setDisplayedContent(() => partialContent)

        currentIndex++

        if (currentIndex <= messageContent.length && isTyping) {
          requestAnimationFrameHandle = requestAnimationFrame(updateText)
        } else {
          isTyping = false
        }
      }

      updateText()
    })

    return subscriber
  }, [isStreaming, currentSessionIndex, messageIndex])

  const isUserMessage = role === MessageRole.USER
  const isEmptyMessage = !isStreaming && isEmpty(displayedContent)

  const messageFrom = isUserMessage ? 'You' : 'ChatGPT'
  const messageAvatar = isUserMessage ? (
    <Avatar alt={messageFrom} sx={{ width: 24, height: 24, bgcolor: '#fff' }}>
      <FaceIcon sx={{ color: '#000' }} />
    </Avatar>
  ) : (
    <Avatar alt={messageFrom} sx={{ width: 24, height: 24, bgcolor: '#19c37d' }}>
      <OpenAiLogo sx={{ width: 16, height: 16, color: '#fff' }} />
    </Avatar>
  )

  const messageContent = isStreaming && !displayedContent ? (
    <>
      <Skeleton animation="wave" height={20} width="100%" style={{ marginBottom: 8 }} />
      <Skeleton animation="wave" height={20} width="100%" style={{ marginBottom: 8 }} />
      <Skeleton animation="wave" height={20} width="60%" style={{ marginBottom: 8 }} />
    </>
  ) : (
    <MarkdownContent
      content={isError ? '[Error Message]' : isEmptyMessage ? '[Empty Message]' : displayedContent}
    />
  )

  return (
    <ListItem alignItems="flex-start">
      <ListItemAvatar>{messageAvatar}</ListItemAvatar>
      <ListItemText
        primary={messageFrom}
        secondary={messageContent}
        secondaryTypographyProps={{ component: 'div', className: 'markdown-body' }}
      />
    </ListItem>
  )
}

interface MessageListProps {
  messages?: ChatMessage[]
}

const MessageList: React.FC<MessageListProps> = (props: MessageListProps) => {
  const { messages: messagesFromProps } = props
  const { getCurrentSessionMessages } = useChatStore()
  const messages = messagesFromProps || getCurrentSessionMessages()

  return isEmpty(messages) ? (
    <EmptyHint />
  ) : (
    <List sx={{ width: '100%' }}>
      {messages.map((message, messageIndex) => (
        <MessageItem {...message} key={message.id} index={messageIndex} />
      ))}
    </List>
  )
}

interface ChatBodyProps {
  sessionId: string
}

const ChatBody: React.FC<ChatBodyProps> = (props) => {
  const { sessionId } = props
  const chatBodyRef = useRef<HTMLElement | null>(null)

  useAutoScroll({ sessionId, ref: chatBodyRef })

  return (
    <Box
      component="main"
      ref={chatBodyRef}
      sx={{
        width: '100%',
        flex: 1,
        overflowY: 'auto',
      }}
    >
      <MessageList />
    </Box>
  )
}

export { ChatBody }
