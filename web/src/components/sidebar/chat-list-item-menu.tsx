import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import {
  ClickAwayListener,
  Grow,
  IconButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  MenuList,
  Paper,
  Popper,
} from '@mui/material'

import { useToggle } from 'ahooks'
import { useCallback, useEffect, useRef } from 'react'

function useMenuPopper() {
  const [isPopperOpen, { toggle: togglePopper, setLeft: closePopper }] = useToggle(false)
  const anchorRef = useRef<HTMLButtonElement>(null)
  const handlePopperClose = useCallback(
    (event: Event | React.SyntheticEvent) => {
      if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) return

      closePopper()
    },
    [closePopper],
  )
  const handleListKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Tab') {
        event.preventDefault()
        closePopper()
      } else if (event.key === 'Escape') {
        closePopper()
      }
    },
    [closePopper],
  )

  // return focus to the button when we transitioned from !open -> open
  const prevOpen = useRef(isPopperOpen)

  useEffect(() => {
    if (prevOpen.current === true && isPopperOpen === false) {
      anchorRef.current!.focus()
    }

    prevOpen.current = isPopperOpen
  }, [isPopperOpen])

  return { isPopperOpen, togglePopper, anchorRef, handlePopperClose, handleListKeyDown }
}

interface ListItemMenuProps {
  itemIndex: number
  onDeleteSession(index: number): void
}

const ListItemMenu: React.FC<ListItemMenuProps> = (props) => {
  const { itemIndex, onDeleteSession } = props
  const { isPopperOpen, togglePopper, anchorRef, handlePopperClose, handleListKeyDown } =
    useMenuPopper()
  const handleIconButtonClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation()

      togglePopper()
    },
    [togglePopper],
  )

  return (
    <>
      <IconButton
        size="small"
        ref={anchorRef}
        id="composition-button"
        aria-label="more"
        aria-controls={isPopperOpen ? 'composition-menu' : undefined}
        aria-expanded={isPopperOpen ? 'true' : undefined}
        aria-haspopup="true"
        onClick={handleIconButtonClick}
      >
        <MoreHorizIcon />
      </IconButton>
      <Popper
        sx={{ zIndex: 1201 }}
        open={isPopperOpen}
        anchorEl={anchorRef.current}
        role={undefined}
        placement="bottom-start"
        transition
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom-start' ? 'left top' : 'left bottom',
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handlePopperClose}>
                <MenuList
                  autoFocusItem={isPopperOpen}
                  id="composition-menu"
                  aria-labelledby="composition-button"
                  onKeyDown={handleListKeyDown}
                >
                  <MenuItem disabled>
                    <ListItemIcon>
                      <EditIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Rename</ListItemText>
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      onDeleteSession(itemIndex)
                    }}
                  >
                    <ListItemIcon>
                      <DeleteIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Delete</ListItemText>
                  </MenuItem>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  )
}

export { ListItemMenu }
