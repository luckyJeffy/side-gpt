import { useMediaQuery } from '@mui/material'

/**
 * Check if it is a mobile device screen size.
 *
 * @returns
 */
function useMobileScreen() {
  const isMatch = useMediaQuery('(max-width:600px)')
  return isMatch
}

export { useMobileScreen }