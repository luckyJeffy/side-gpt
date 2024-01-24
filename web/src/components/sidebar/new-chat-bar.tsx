import { OpenAiLogo } from '@/components/icons'
import { useChatStore } from '@/store'

import { Button, Toolbar } from '@mui/material'

import { useDebounceFn } from 'ahooks'

function NewChatBar() {
  const { createNewSession } = useChatStore()
  const { run: handleCreateNewSession } = useDebounceFn(
    () => {
      createNewSession()
    },
    {
      wait: 300,
    },
  )

  return (
    <Toolbar variant="dense" disableGutters sx={{ width: '100%' }}>
      <Button
        fullWidth
        size="large"
        disableFocusRipple
        variant="text"
        startIcon={<OpenAiLogo />}
        onClick={handleCreateNewSession}
      >
        Create New Chat
      </Button>
    </Toolbar>
  )
}

export { NewChatBar }
