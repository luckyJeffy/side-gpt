const DEFAULT_TOPIC_NAME = 'New Conversation'

const UNFINISHED_PROMPT_KEY_PREFIX = 'unfinished-prompt-'

const GENERATE_TOPIC_PROMPT =
  '使用四到五个字直接返回这句话的简要主题，不要解释、不要标点、不要语气词、不要多余文本，不要加粗，如果没有主题，请直接返回“闲聊”'

export { DEFAULT_TOPIC_NAME, UNFINISHED_PROMPT_KEY_PREFIX, GENERATE_TOPIC_PROMPT }
