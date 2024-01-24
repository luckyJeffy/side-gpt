import { useAppConfig, useChatStore } from '@/store'
import { useToggle } from 'ahooks'

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material'

import { isEmpty } from 'lodash-es'
import { useCallback } from 'react'

function useUpdateSettingDialog() {
  const { apiKey, updateApiKey } = useAppConfig()
  const [isDialogOpen, { setLeft: handleCloseDialog, setRight: handleOpenDialog }] =
    useToggle(false)
  const handleSubmitApiKey = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      const formData = new FormData(event.currentTarget)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const formJson = Object.fromEntries((formData as any).entries())

      updateApiKey(formJson.apiKey as string)

      handleCloseDialog()
    },
    [handleCloseDialog, updateApiKey],
  )

  const dialog = (
    <Dialog
      open={isDialogOpen}
      onClose={handleCloseDialog}
      PaperProps={{
        component: 'form',
        onSubmit: handleSubmitApiKey,
      }}
    >
      <DialogTitle>Update Setting</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Please verify the service availability of your service provider by yourself.
        </DialogContentText>
        <TextField
          autoFocus
          required
          margin="dense"
          id="apiKey"
          name="apiKey"
          label="API KEY"
          type="text"
          defaultValue={apiKey}
          fullWidth
          variant="standard"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDialog}>Cancel</Button>
        <Button type="submit">Save</Button>
      </DialogActions>
    </Dialog>
  )

  return { dialog, isDialogOpen, handleOpenDialog, handleCloseDialog }
}

function useClearAllSessionsDialog() {
  const { clearSessions } = useChatStore()
  const [isDialogOpen, { setLeft: handleCloseDialog, setRight: handleOpenDialog }] =
    useToggle(false)
  const handleClearSessions = useCallback(() => {
    clearSessions()
    handleCloseDialog()
  }, [clearSessions, handleCloseDialog])

  const dialog = (
    <Dialog open={isDialogOpen} onClose={handleCloseDialog}>
      <DialogTitle>Clear all conversation data?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          This action will clear all conversation data and is irreversible.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDialog}>Cancel</Button>
        <Button color="error" onClick={handleClearSessions}>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  )

  return { dialog, isDialogOpen, handleOpenDialog, handleCloseDialog }
}

function ConfigSettingBar() {
  const { apiKey } = useAppConfig()
  const { dialog: settingDialog, handleOpenDialog: handleOpenSettingDialog } =
    useUpdateSettingDialog()
  const { dialog: clearSessionDialog, handleOpenDialog: handleOpenClearSessionDialog } =
    useClearAllSessionsDialog()

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Typography variant="overline">Service Provider</Typography>
      <Typography variant="caption" color="text.secondary" gutterBottom noWrap>
        OpenKEY
      </Typography>
      <Typography variant="overline">API Key</Typography>
      <Typography variant="caption" color="text.secondary" gutterBottom noWrap>
        {isEmpty(apiKey) ? 'Empty' : apiKey}
      </Typography>
      <Button
        fullWidth
        color="info"
        size="large"
        disableFocusRipple
        variant="text"
        onClick={handleOpenSettingDialog}
      >
        Update API Setting
      </Button>
      <Button
        fullWidth
        color="warning"
        size="large"
        disableFocusRipple
        variant="text"
        onClick={handleOpenClearSessionDialog}
      >
        Clear Conversation
      </Button>
      {settingDialog}
      {clearSessionDialog}
    </Box>
  )
}

export { ConfigSettingBar }
