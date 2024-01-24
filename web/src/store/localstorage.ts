import { clone } from 'lodash-es'

import { StoreKey, UNFINISHED_PROMPT_KEY_PREFIX } from '@/constants'
import { createPersistStore } from '@/utils/store'

const DEFAULT_LOCAL_STORAGE_STATE = {
  unfinishedPromptMap: {} as Record<string, string>,
}

const useLocalStorageStore = createPersistStore(
  DEFAULT_LOCAL_STORAGE_STATE,
  (set, _get) => {
    function get() {
      return {
        ..._get(),
        ...methods,
      }
    }

    const methods = {
      createUnfinishedPrompt(sessionId: string, prompt: string) {
        const { unfinishedPromptMap } = get()

        set(() => ({
          unfinishedPromptMap: {
            ...unfinishedPromptMap,
            [`${UNFINISHED_PROMPT_KEY_PREFIX}${sessionId}`]: prompt,
          },
        }))
      },

      getUnfinishedPrompt(sessionId: string) {
        const { unfinishedPromptMap } = get()

        return unfinishedPromptMap[`${UNFINISHED_PROMPT_KEY_PREFIX}${sessionId}`]
      },

      removeUnfinishedPrompt(sessionId: string) {
        const { unfinishedPromptMap } = get()
        const currentUnfinishedPromptMap = clone(unfinishedPromptMap)

        delete currentUnfinishedPromptMap[`${UNFINISHED_PROMPT_KEY_PREFIX}${sessionId}`]

        set(() => ({ unfinishedPromptMap: currentUnfinishedPromptMap }))
      },
    }

    return methods
  },
  {
    name: StoreKey.LocalStorage,
  },
)

export { useLocalStorageStore }
