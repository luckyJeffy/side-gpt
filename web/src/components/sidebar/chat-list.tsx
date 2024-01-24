import { useResetState, useToggle } from 'ahooks'
import { isNumber } from 'lodash-es'
import { useCallback } from 'react'

import { useChatStore } from '@/store'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from '@mui/material'

import { ListItemMenu } from './chat-list-item-menu'

import type { ChatSession } from '@/types'

function useDeleteSessionDialog() {
  const [sessions, deleteSession] = useChatStore((state) => [state.sessions, state.deleteSession])

  type DeletingSession = (ChatSession & { index: number }) | undefined

  const [deletingSession, setDeletingSession, resetDeletingSession] =
    useResetState<DeletingSession>(undefined)
  const [isDialogOpen, { setLeft: closeDialog, setRight: openDialog }] = useToggle(false)

  const handleOpenDialog = useCallback(
    (chosenSessionIndex: number) => {
      const chosenSession = sessions[chosenSessionIndex]

      setDeletingSession({ ...chosenSession, index: chosenSessionIndex })
      openDialog()
    },
    [sessions, openDialog, setDeletingSession],
  )
  const handleCloseDialog = useCallback(() => {
    closeDialog()
    resetDeletingSession()
  }, [closeDialog, resetDeletingSession])

  const handleOnDeleteSession = useCallback(() => {
    if (isNumber(deletingSession?.index)) {
      deleteSession(deletingSession.index)
    }

    handleCloseDialog()
  }, [deletingSession, deleteSession, handleCloseDialog])

  const dialog = (
    <Dialog
      open={isDialogOpen}
      onClose={handleCloseDialog}
      aria-labelledby="chat-list-alert-dialog-title"
      aria-describedby="chat-list-alert-dialog-description"
    >
      <DialogTitle id="chat-list-alert-dialog-title">Delete chat?</DialogTitle>
      <DialogContent>
        <DialogContentText id="chat-list-alert-dialog-description">
          <span>
            This will delete <b>{deletingSession?.topic}</b>
          </span>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDialog}>Cancel</Button>
        <Button onClick={handleOnDeleteSession} color="error">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  )

  return {
    dialog,
    isDialogOpen,
    handleOpenDialog,
    handleCloseDialog,
  }
}

interface ChatListItemProps {
  itemIndex: number
  topic: string
  onSelectSession: (index: number) => void
  onDeleteSession: React.ComponentProps<typeof ListItemMenu>['onDeleteSession']
}

const ChatListItem: React.FC<ChatListItemProps> = (props) => {
  const { itemIndex, topic, onSelectSession, onDeleteSession } = props

  const { currentSessionIndex: selectedIndex } = useChatStore()
  const isSelectedItem = selectedIndex === itemIndex

  return (
    <ListItem
      className="chat-list-item"
      disablePadding
      secondaryAction={<ListItemMenu itemIndex={itemIndex} onDeleteSession={onDeleteSession} />}
      onClick={() => {
        onSelectSession(itemIndex)
      }}
    >
      <ListItemButton disableGutters selected={isSelectedItem}>
        <ListItemText primary={<Typography noWrap>{topic}</Typography>} />
      </ListItemButton>
    </ListItem>
  )
}

interface ChatListProps {}

const ChatList: React.FC<ChatListProps> = () => {
  const { sessions, currentSessionIndex: selectedIndex, selectSession } = useChatStore()
  const { dialog, handleOpenDialog } = useDeleteSessionDialog()

  const handleOnSelectSession = useCallback(
    (index: number) => {
      if (selectedIndex === index) return

      selectSession(index)
    },
    [selectedIndex, selectSession],
  )

  return (
    <Box sx={{ flex: 1, overflowY: 'auto' }}>
      <List dense>
        {sessions.map(({ topic, id }, itemIndex) => {
          return (
            <ChatListItem
              key={id}
              itemIndex={itemIndex}
              topic={topic}
              onSelectSession={handleOnSelectSession}
              onDeleteSession={handleOpenDialog}
            />
          )
        })}
      </List>
      {dialog}
    </Box>
  )
}

export { ChatList }
