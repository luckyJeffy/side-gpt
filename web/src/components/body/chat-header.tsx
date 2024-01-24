import { useAppConfig } from '@/store'
import { useMobileScreen } from '@/utils/hooks'

import MenuIcon from '@mui/icons-material/Menu'
import { IconButton, AppBar, Toolbar, Typography } from '@mui/material'

import React, { useMemo } from 'react'

import type { TypographyProps } from '@mui/material'

interface ChatHeaderProps {}

const ChatHeader: React.FC<ChatHeaderProps> = () => {
  const { handleOnSideBarToggle } = useAppConfig()
  const isMobileScreen = useMobileScreen()

  const dynamicTypographyProps: TypographyProps = useMemo(() => {
    return isMobileScreen ? { align: 'center', width: '100%' } : {}
  }, [isMobileScreen])

  return (
    <AppBar
      color="default"
      position="sticky"
      sx={{
        boxShadow: 'initial',
        borderBottom: isMobileScreen ? '1px solid rgba(0,0,0,.15)' : '',
        bgcolor: '#fff',
      }}
    >
      <Toolbar variant="dense">
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleOnSideBarToggle}
          sx={{ mr: 2, display: { sm: 'none' }, position: 'fixed' }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap component="div" {...dynamicTypographyProps}>
          ChatGPT 3.5
        </Typography>
      </Toolbar>
    </AppBar>
  )
}

export { ChatHeader }
