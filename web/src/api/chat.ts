import { API } from '@/constants'
import { GENERATE_TOPIC_PROMPT } from '@/constants'
import { abortControllerMap } from '@/utils/abort-controller'
import { requestSSE, ResponseError } from '@/utils/request'
import { EventStreamContentType } from '@microsoft/fetch-event-source'

import type { ChatMessage as ChatGPTMessage } from 'chatgpt'

interface SSECallback {
  onUpdate?: (parsedChunk: ChatGPTMessage) => void
  onFinish: (lastChunk?: string) => void
  onError?: (error: ResponseError) => void
}

interface GetMessageParams {
  apiKey: string
  conversationId: string
  message: string
  abortControllerKey: string
  parentMessageId?: string
  timeoutMs?: number
  callbacks: SSECallback
}

async function getMessage(params: GetMessageParams) {
  const { abortControllerKey, conversationId, callbacks, ...restParams } = params
  const { onUpdate, onFinish, onError } = callbacks
  const abortController = abortControllerMap.getController(abortControllerKey)

  try {
    await requestSSE({
      input: API.CHAT,
      init: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-requested-with': 'XMLHttpRequest',
          'Accept': 'application/json',
        },
        body: { conversationId, ...restParams },
        signal: abortController?.signal,
        async onopen(response) {
          if (
            !response.ok ||
            response.headers.get('content-type') !== EventStreamContentType ||
            response.status !== 200
          ) {
            const resClone = response.clone()
            const resText = await resClone.text()
            const error = new ResponseError(resText, response)

            throw error
          }
        },
        onmessage(message) {
          if (message.event === 'FatalError') {
            throw new ResponseError(message.data)
          }

          if (message.data === '[DONE]') {
            onFinish()

            return
          }

          const messageChunk = message.data
          const parsedMessageChunk = JSON.parse(messageChunk) as ChatGPTMessage

          onUpdate?.(parsedMessageChunk)
        },
        onclose() {
          onFinish()
        },
        onerror(error) {
          throw error
        },
        openWhenHidden: true,
      },
    })
  } catch (error: unknown) {
    if (error instanceof Error) {
      onError?.(error)
    }

    throw error
  }
}

interface GetSessionSummarizeParams {
  apiKey: string
  message: string
  abortControllerKey: string
  timeoutMs?: number
  callbacks: SSECallback
}

async function getSessionSummarize(params: GetSessionSummarizeParams) {
  const { abortControllerKey, callbacks, ...restParams } = params
  const { message } = restParams
  const { onUpdate, onFinish, onError } = callbacks
  const abortController = abortControllerMap.getController(abortControllerKey)

  try {
    await requestSSE({
      input: API.CHAT,
      init: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-requested-with': 'XMLHttpRequest',
          'Accept': 'application/json',
        },
        body: { ...restParams, message: `${GENERATE_TOPIC_PROMPT}\n\n${message}` },
        signal: abortController?.signal,
        onmessage(message) {
          if (message.data === '[DONE]') {
            onFinish()

            return
          }

          const messageChunk = message.data
          const parsedMessageChunk = JSON.parse(messageChunk) as ChatGPTMessage

          onUpdate?.(parsedMessageChunk)
        },
        onclose() {
          onFinish()
        },
        openWhenHidden: true,
      },
    })
  } catch (error: unknown) {
    if (error instanceof Error) {
      onError?.(error)
    }

    throw error
  }
}

export { getMessage, getSessionSummarize }
export type { GetMessageParams }
