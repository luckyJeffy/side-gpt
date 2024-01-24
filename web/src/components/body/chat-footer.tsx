import { useAppConfig, useChatStore, useLocalStorageStore } from '@/store'

import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import { Box, IconButton, TextField, Tooltip } from '@mui/material'

import { useDebounceFn, useKeyPress } from 'ahooks'
import { clone, isEmpty } from 'lodash-es'
import { enqueueSnackbar } from 'notistack'
import { useCallback, useEffect, useRef, useState } from 'react'

interface UseUnfinishedInputParams {
  sessionId: string
  setPrompt: React.Dispatch<React.SetStateAction<string>>
}

function useUnfinishedInput(props: UseUnfinishedInputParams) {
  const { sessionId, setPrompt } = props

  const { getUnfinishedPrompt } = useLocalStorageStore()

  useEffect(() => {
    const unfinishedPrompt = getUnfinishedPrompt(sessionId)

    if (unfinishedPrompt) {
      setPrompt(unfinishedPrompt)
    } else {
      setPrompt('')
    }
  }, [sessionId, getUnfinishedPrompt, setPrompt])
}

interface UseTextFieldBehaviorInterceptorParams {
  prompt: string
  inputRef: React.MutableRefObject<HTMLTextAreaElement | null>
  setPrompt: React.Dispatch<React.SetStateAction<string>>
  submitPrompt: (message: string) => Promise<void>
}

function useTextFieldBehaviorInterceptor(params: UseTextFieldBehaviorInterceptorParams) {
  const { prompt, inputRef, setPrompt, submitPrompt } = params

  useKeyPress(
    'shift.enter',
    (event: KeyboardEvent) => {
      // Intercept 'Shift + Enter' key default behavior
      event.preventDefault()

      const inputDOM = inputRef.current

      if (!inputDOM) return

      const { selectionStart = 0, selectionEnd = 0 } = inputDOM
      const prevValue = clone(prompt)
      const currentValue = `${prevValue.slice(0, selectionStart)}${`\n`}${prevValue.slice(
        selectionEnd,
      )}`
      const currentCursorIndex = selectionStart + 1

      setPrompt(currentValue)
      inputDOM.setSelectionRange(currentCursorIndex, currentCursorIndex)
    },
    {
      target: inputRef,
      exactMatch: true,
    },
  )

  useKeyPress(
    'enter',
    async (event: KeyboardEvent) => {
      // Intercept 'Enter' key default behavior
      event.preventDefault()

      await submitPrompt(prompt)
    },
    {
      target: inputRef,
      exactMatch: true,
    },
  )
}

interface ChatFooterProps {
  sessionId: string
}

function ChatFooter(props: ChatFooterProps) {
  const { sessionId } = props

  const { apiKey } = useAppConfig()
  const { handlePromptSubmit } = useChatStore()
  const { createUnfinishedPrompt, removeUnfinishedPrompt } = useLocalStorageStore()
  const { run: debouncedCreateUnfinishedPrompt } = useDebounceFn(createUnfinishedPrompt, {
    wait: 80,
    maxWait: 200,
  })
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [prompt, setPrompt] = useState('')

  const submitPrompt = useCallback(
    async (message: string) => {
      if (!apiKey) {
        enqueueSnackbar('Please message GPT after setting up the API key.', {
          variant: 'info',
          autoHideDuration: 3000,
          anchorOrigin: {
            horizontal: 'right',
            vertical: 'top',
          },
        })
        return
      }

      setPrompt('')

      const params = {
        apiKey,
        message,
      }

      try {
        await handlePromptSubmit(params)
        removeUnfinishedPrompt(sessionId)
      } catch (error: unknown) {
        if (error instanceof Error) {
          enqueueSnackbar(error.message, {
            variant: 'error',
            autoHideDuration: 3000,
            anchorOrigin: {
              horizontal: 'right',
              vertical: 'top',
            },
          })
        }
      }
    },
    [apiKey, handlePromptSubmit, removeUnfinishedPrompt, sessionId],
  )

  const handlePromptChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const {
        target: { value: promptValue },
      } = event

      setPrompt(promptValue)
      debouncedCreateUnfinishedPrompt(sessionId, promptValue)
    },
    [debouncedCreateUnfinishedPrompt, sessionId],
  )
  const handleOnFromSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      const formData = new FormData(event.currentTarget)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const formJson = Object.fromEntries((formData as any).entries())
      const message = formJson.prompt as string

      await submitPrompt(message)
    },
    [submitPrompt],
  )

  useUnfinishedInput({ sessionId, setPrompt })

  useTextFieldBehaviorInterceptor({
    prompt,
    inputRef,
    setPrompt,
    submitPrompt,
  })

  return (
    <Box
      component="form"
      sx={{ width: '100%', position: 'relative' }}
      noValidate
      autoComplete="off"
      onSubmit={handleOnFromSubmit}
    >
      <TextField
        fullWidth
        multiline
        id="prompt"
        label="Message ChatGPT..."
        placeholder="[Shift.Enter] - Insert new line"
        value={prompt}
        onChange={handlePromptChange}
        maxRows={9}
        inputRef={inputRef}
      />
      <IconButton
        disabled={isEmpty(apiKey)}
        sx={{ position: 'fixed', right: 0, bottom: '8px' }}
        onClick={() => {
          submitPrompt(prompt)
        }}
      >
        <Tooltip title="Send Message">
          <ArrowUpwardIcon />
        </Tooltip>
      </IconButton>
    </Box>
  )
}

export { ChatFooter }
