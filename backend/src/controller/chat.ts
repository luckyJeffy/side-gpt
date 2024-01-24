import { ChatGPTAPI } from 'chatgpt'
import { HttpsProxyAgent } from 'https-proxy-agent'
import nodeFetch from 'node-fetch'
import { PassThrough } from 'stream'
import createError from 'http-errors'

import { getDataChunk } from '../utils'

import type { Context } from 'koa'

const { CHAT_GPT_API_BASE_URL, CHAT_GPT_API_DEBUG, API_PROXY } = process.env

const isDebugMode = !!CHAT_GPT_API_DEBUG

const chatApiInstance = new ChatGPTAPI({
  apiBaseUrl: CHAT_GPT_API_BASE_URL || '',
  apiKey: '_PLACEHOLDER',
  debug: isDebugMode,
  fetch: API_PROXY
    ? (url, options = {}) => {
        const defaultOptions = {
          agent: new HttpsProxyAgent(API_PROXY),
        }

        const mergedOptions = {
          ...defaultOptions,
          ...options,
        }

        return nodeFetch(url, mergedOptions)
      }
    : undefined,
})

interface SendMessageParams {
  apiKey: string
  message: string
  timeoutMs?: number
  conversationId?: string
  parentMessageId?: string
}

function sendMessage(ctx: Context) {
  if (!ctx.request.body) throw new Error('Request params can not be empty.')

  const { apiKey, message, timeoutMs, conversationId, parentMessageId } = ctx.request
    .body as Partial<SendMessageParams>

  if (!apiKey) throw new createError.Unauthorized('API key is required.')

  if (!message) throw new createError.BadRequest('Message is required.')

  chatApiInstance.apiKey = apiKey

  const stream = new PassThrough()

  ctx.set({
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache',
    'Content-Type': 'text/event-stream',
  })

  ctx.body = stream
  ctx.status = 200

  async function sendChatMessage(message: string) {
    await chatApiInstance.sendMessage(message, {
      conversationId,
      parentMessageId,
      timeoutMs: timeoutMs || 2 * 60 * 1000,
      onProgress: (partialResponse) => {
        const chunk = getDataChunk(JSON.stringify(partialResponse))
        stream.write(chunk)

        if (isDebugMode) {
          console.log('partialResponse:', chunk)
        }
      },
    })
  }

  sendChatMessage(message).then(() => {
    stream.write('data: [DONE]\n\n')
    stream.end()
  })
}

export { sendMessage }
