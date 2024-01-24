import { sendMessage } from './controller'

/**
 * All application routes.
 */
const AppRoutes = [
  {
    path: '/chat',
    method: 'post',
    action: sendMessage,
  },
]

export { AppRoutes }
