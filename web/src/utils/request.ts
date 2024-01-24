import { API_BASE_URL } from '@/constants'
import { fetchEventSource } from '@microsoft/fetch-event-source'
import { isString } from 'lodash-es'

import type { FetchEventSourceInit } from '@microsoft/fetch-event-source'

class ResponseError extends Error {
  constructor(message: string, res?: Response) {
    super(message)
    this.response = res
  }

  response?: Response
}

type CustomRequestInit = Omit<RequestInit, 'body'> & {
  body?: RequestInit['body'] | Record<string, unknown>
}

type CustomFetchEventSourceInit = Omit<FetchEventSourceInit, 'body'> & {
  body?: FetchEventSourceInit['body'] | Record<string, unknown>
}

interface RequestParams {
  input: RequestInfo | URL
  init?: CustomRequestInit
}

interface RequestSSEParams {
  input: RequestInfo
  init?: CustomFetchEventSourceInit
}

function getApiUrl(url: string) {
  return `${API_BASE_URL}${url}`
}

async function requestSSE(params: RequestSSEParams) {
  const { input: inputFromParams, init: initFromParams } = params

  const input = isString(inputFromParams) ? getApiUrl(inputFromParams) : inputFromParams
  const stringifiedBody = initFromParams?.body ? JSON.stringify(initFromParams.body) : undefined

  try {
    await fetchEventSource(input, {
      ...initFromParams,
      body: stringifiedBody,
    })
  } catch (error) {
    if (error instanceof ResponseError) {
      console.error('ResponseError:', error)
    }

    throw error
  }
}

async function request<TRes = unknown>(params: RequestParams): Promise<TRes> {
  const { input: inputFromParams, init: initFromParams } = params

  const input = isString(inputFromParams) ? getApiUrl(inputFromParams) : inputFromParams
  const stringifiedBody = initFromParams?.body ? JSON.stringify(initFromParams.body) : undefined

  try {
    const res = await fetch(input, {
      ...initFromParams,
      body: stringifiedBody,
    })

    if (!res.ok) {
      throw new ResponseError('Bad fetch response', res)
    }

    return res.json()
  } catch (error) {
    if (error instanceof ResponseError) {
      console.error('ResponseError:', error)
    }

    throw error
  }
}

export { ResponseError, request, requestSSE }
export type { RequestParams }
