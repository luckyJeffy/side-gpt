const DEFAULT_SIDEBAR_WIDTH = 260

const SUPPORTED_MODELS = [
  {
    name: 'gpt-4',
    available: true,
    provider: {
      id: 'openai',
      providerName: 'OpenAI',
      providerType: 'openai',
    },
  },
  {
    name: 'gpt-3.5-turbo',
    available: true,
    provider: {
      id: 'openai',
      providerName: 'OpenAI',
      providerType: 'openai',
    },
  },
  {
    name: 'gpt-3.5-turbo-1106',
    available: true,
    provider: {
      id: 'openai',
      providerName: 'OpenAI',
      providerType: 'openai',
    },
  },
] as const

enum StoreKey {
  Chat = 'chat-next-web-store',
  Config = 'app-config',
  LocalStorage = '_local-storage',
}

export { DEFAULT_SIDEBAR_WIDTH, SUPPORTED_MODELS, StoreKey }
