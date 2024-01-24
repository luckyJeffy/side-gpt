import { StrictMode } from 'react'
import * as ReactDOM from 'react-dom/client'

import { ThemeProvider } from '@emotion/react'

import App from './App'
import theme from './theme'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
