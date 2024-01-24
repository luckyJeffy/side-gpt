import { ChatBody, ChatFooter, ChatHeader, SideBar } from '@/components'
import { useChatStore } from '@/store'

import { Box, Container } from '@mui/material'

import { SnackbarProvider } from 'notistack'

import '@/styles/highlight.css'
import '@/styles/markdown.css'

function Layout() {
  const { currentSessionId } = useChatStore()

  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      <SideBar />
      <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', overflow: 'auto' }}>
        <ChatHeader />
        <ChatBody sessionId={currentSessionId} />
        <ChatFooter sessionId={currentSessionId} />
      </Box>
    </Box>
  )
}

export default function App() {
  return (
    <Container maxWidth={false} disableGutters sx={{ height: '100%', overflow: 'hidden' }}>
      <SnackbarProvider>
        <Layout />
      </SnackbarProvider>
    </Container>
  )
}
