import { useAppConfig } from '@/store'
import { useMobileScreen } from '@/utils/hooks'
import { Box, Divider, Drawer } from '@mui/material'

import { useMemo } from 'react'

import { ChatList } from './chat-list'
import { ConfigSettingBar } from './config-setting-bar'
import { NewChatBar } from './new-chat-bar'

import type { DrawerProps } from '@mui/material'

interface SideBarProps {}

const SideBar: React.FC<SideBarProps> = () => {
  const isMobileScreen = useMobileScreen()
  const { sidebarWidth, isSideBarMobileOpen, handleOnSideBarClose, handleOnSideBarTransitionEnd } =
    useAppConfig()

  const drawerProps = useMemo<DrawerProps>(() => {
    const commonSx = {
      '& .MuiDrawer-paper': {
        // background: '#000',
        // color: '#ececf1',
        boxSizing: 'border-box',
        width: sidebarWidth,
        px: 0.75,
        pb: 0.875,
      },
    }

    if (isMobileScreen) {
      return {
        variant: 'temporary',
        open: isSideBarMobileOpen,
        onTransitionEnd: handleOnSideBarTransitionEnd,
        onClose: handleOnSideBarClose,
        ModalProps: {
          // Better open performance on mobile.
          keepMounted: true,
        },
        sx: {
          ...commonSx,
          display: { xs: 'block', sm: 'none' },
        },
      }
    }

    return {
      variant: 'permanent',
      sx: {
        ...commonSx,
        display: { xs: 'none', sm: 'block' },
      },
      open: true,
    }
  }, [
    sidebarWidth,
    isMobileScreen,
    isSideBarMobileOpen,
    handleOnSideBarClose,
    handleOnSideBarTransitionEnd,
  ])

  return (
    <Box
      component="nav"
      sx={{ width: { sm: sidebarWidth }, flexShrink: { sm: 0 } }}
      aria-label="folders"
    >
      <Drawer {...drawerProps}>
        <NewChatBar />
        <ChatList />
        <Divider />
        <ConfigSettingBar />
      </Drawer>
    </Box>
  )
}

export { SideBar }
