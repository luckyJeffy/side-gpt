import { createPersistStore } from '@/utils/store'
import { SUPPORTED_MODELS, DEFAULT_SIDEBAR_WIDTH, StoreKey } from '@/constants'

type ModelType = (typeof SUPPORTED_MODELS)[number]['name']

const DEFAULT_CONFIG = {
  lastUpdate: Date.now(),

  sendPreviewBubble: true,
  enableAutoGenerateTitle: true,

  sidebarWidth: DEFAULT_SIDEBAR_WIDTH,
  isSideBarClosing: false,
  isSideBarMobileOpen: false,

  models: SUPPORTED_MODELS,

  apiKey: '',
}

const useAppConfig = createPersistStore(
  { ...DEFAULT_CONFIG },
  (set, get) => ({
    reset() {
      set(() => ({ ...DEFAULT_CONFIG }))
    },
    updateApiKey(apiKey: string) {
      set({ apiKey: apiKey.trim() })
    },
    handleOnSideBarClose() {
      set({ isSideBarClosing: true, isSideBarMobileOpen: false })
    },
    handleOnSideBarTransitionEnd() {
      set({ isSideBarClosing: false })
    },
    handleOnSideBarToggle() {
      const { isSideBarClosing, isSideBarMobileOpen } = get()

      if (!isSideBarClosing) {
        set({ isSideBarMobileOpen: !isSideBarMobileOpen })
      }
    },
  }),
  {
    name: StoreKey.Config,
  },
)

export type { ModelType }
export { DEFAULT_CONFIG, useAppConfig }
