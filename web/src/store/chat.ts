import { clone } from 'lodash-es'
import { nanoid } from 'nanoid'

import api from '@/api'
import { DEFAULT_TOPIC_NAME, StoreKey } from '@/constants'
import { MessageRole } from '@/types'
import { abortControllerMap } from '@/utils/abort-controller'
import { createPersistStore } from '@/utils/store'

import type { ChatMessage, ChatSession } from '@/types'
import type { ChatMessage as ChatGPTMessage } from 'chatgpt'

interface HandlePromptSubmitParams {
  apiKey: string
  message: string
  parentMessageId?: string
  timeoutMs?: number
}

interface HandleSummarizeSessionParams {
  apiKey: string
  message: string
  conversationId: string
}

function createEmptyMessage(override: Partial<ChatMessage>): ChatMessage {
  return {
    id: nanoid(),
    date: new Date().toLocaleString(),
    role: MessageRole.USER,
    content: '',
    ...override,
  }
}

function createEmptySession(): ChatSession {
  const id = nanoid()

  return {
    id,
    topic: `${DEFAULT_TOPIC_NAME} ${id}`,
    memoryPrompt: '',
    messages: [],
    lastUpdate: Date.now(),
  }
}

const _DEFAULT_CHAT_SESSION = createEmptySession()

const DEFAULT_CHAT_STATE = {
  sessions: [_DEFAULT_CHAT_SESSION],
  currentSessionId: _DEFAULT_CHAT_SESSION.id,
  currentSessionIndex: 0,
}

const useChatStore = createPersistStore(
  DEFAULT_CHAT_STATE,
  (set, _get) => {
    function get() {
      return {
        ..._get(),
        ...methods,
      }
    }

    const methods = {
      clearSessions() {
        set(() => {
          const session = createEmptySession()

          return {
            sessions: [session],
            currentSessionId: session.id,
            currentSessionIndex: 0,
          }
        })
      },

      selectSession(index: number) {
        const { sessions } = get()

        set({
          currentSessionId: sessions[index].id,
          currentSessionIndex: index,
        })
      },

      createNewSession() {
        const session = createEmptySession()

        set((state) => ({
          currentSessionId: session.id,
          currentSessionIndex: 0,
          sessions: [session].concat(state.sessions),
        }))
      },

      deleteSession(index: number) {
        const { sessions: currentSessions, currentSessionIndex } = get()

        const deletingLastSession = currentSessions.length === 1
        const deletedSession = currentSessions.at(index)

        if (!deletedSession) return

        const sessions = currentSessions.slice()
        sessions.splice(index, 1)

        let nextSessionIndex = Math.min(
          currentSessionIndex - Number(index < currentSessionIndex),
          sessions.length - 1,
        )
        let nextSessionId = sessions?.[nextSessionIndex]?.id

        if (deletingLastSession) {
          const newSession = createEmptySession()

          nextSessionId = newSession.id
          nextSessionIndex = 0
          sessions.push(newSession)
        }

        set(() => ({
          currentSessionId: nextSessionId,
          currentSessionIndex: nextSessionIndex,
          sessions,
        }))
      },

      getCurrentSession() {
        let { currentSessionIndex: index } = get()
        const { sessions } = get()

        if (index < 0 || index >= sessions.length) {
          index = Math.min(sessions.length - 1, Math.max(0, index))
          set(() => ({ currentSessionIndex: index }))
        }

        const session = sessions[index]

        return session
      },

      resetSession() {
        const { updateCurrentSession } = get()

        updateCurrentSession((session) => {
          session.messages = []
          session.memoryPrompt = ''
        })
      },

      updateCurrentSession(updater: (session: ChatSession) => void) {
        const { sessions, currentSessionIndex } = get()
        const session = sessions[currentSessionIndex]

        updater(session)
        set(() => ({ sessions }))
      },

      clearAllData() {
        localStorage.clear()
        location.reload()
      },

      getCurrentSessionMessages() {
        const { getCurrentSession } = get()
        const { messages } = getCurrentSession()

        return messages
      },

      async handlePromptSubmit(params: HandlePromptSubmitParams) {
        const { message: prompt, parentMessageId: parentMessageIdFromParams, apiKey } = params
        const { getCurrentSession, updateCurrentSession, handleSummarizeSession } = get()

        const { id: conversationId, messages: currentSessionMessages } = getCurrentSession()
        const lastAssistantMessage = currentSessionMessages.findLast(
          (i) => i.role === MessageRole.ASSISTANT,
        )
        const parentMessageId = parentMessageIdFromParams || lastAssistantMessage?.serverSideId

        const userMessage: ChatMessage = createEmptyMessage({
          role: MessageRole.USER,
          content: prompt,
        })
        const assistantMessage: ChatMessage = createEmptyMessage({
          role: MessageRole.ASSISTANT,
          isStreaming: true,
        })

        // Update messages UI status
        updateCurrentSession((session) => {
          session.messages = session.messages.concat([userMessage, assistantMessage])
        })

        // We had to control the assistant message response flow for different features
        // So register AbortController into AbortController right here
        const abortController = new AbortController()
        const abortControllerKey = `${conversationId}-${assistantMessage.id}`
        abortControllerMap.addController(abortControllerKey, abortController)

        const callbacks = {
          onUpdate(parsedChunk: ChatGPTMessage) {
            const { id: serverSideId, text } = parsedChunk

            assistantMessage.isStreaming = true
            assistantMessage.serverSideId = serverSideId
            assistantMessage.content = text

            updateCurrentSession((session) => {
              session.messages = clone(session.messages)
            })
          },
          onFinish() {
            assistantMessage.isStreaming = false

            updateCurrentSession((session) => {
              session.lastUpdate = Date.now()
            })
            abortControllerMap.removeControllers(abortControllerKey)
          },
          onError() {
            assistantMessage.isError = true
            assistantMessage.isStreaming = false
            delete assistantMessage.serverSideId

            updateCurrentSession((session) => {
              session.messages = clone(session.messages)
            })
            abortControllerMap.removeControllers(abortControllerKey)
          },
        }

        await Promise.all([
          api.chat.getMessage({
            conversationId,
            parentMessageId,
            abortControllerKey,
            callbacks,
            ...params,
          }),
          handleSummarizeSession({
            apiKey,
            message: prompt,
            conversationId,
          }),
        ])
      },

      async handleSummarizeSession(params: HandleSummarizeSessionParams) {
        const { getCurrentSession, updateCurrentSession } = get()
        const { topic } = getCurrentSession()

        if (!topic.startsWith(DEFAULT_TOPIC_NAME)) return

        const { conversationId, ...restParams } = params
        const abortController = new AbortController()
        const abortControllerKey = `session-summarize-${conversationId}`

        abortControllerMap.addController(abortControllerKey, abortController)

        const callbacks = {
          onUpdate(parsedChunk: ChatGPTMessage) {
            const { text } = parsedChunk

            updateCurrentSession((session) => {
              session.topic = text
            })
          },
          onFinish() {
            abortControllerMap.removeControllers(abortControllerKey)
          },
          onError() {
            abortControllerMap.removeControllers(abortControllerKey)
          },
        }

        await api.chat.getSessionSummarize({
          abortControllerKey,
          callbacks,
          ...restParams,
        })
      },
    }

    return methods
  },
  {
    name: StoreKey.Chat,
  },
)

export { DEFAULT_CHAT_STATE, createEmptyMessage, createEmptySession, useChatStore }
