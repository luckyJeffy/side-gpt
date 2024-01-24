import { forEach, isArray, omit, size } from 'lodash-es'

class AbortControllerMap {
  constructor(controllers?: Record<string, AbortController>) {
    this.controllers = controllers || {}
  }

  private controllers: Record<string, AbortController | undefined> = {}

  addController(controllerId: string, controller: AbortController) {
    this.controllers[controllerId] = controller

    return controllerId
  }

  getController(controllerId: string) {
    return this.controllers?.[controllerId]
  }

  stop(controllerId: string) {
    const controller = this.controllers[controllerId]
    controller?.abort()
  }

  stopAll() {
    forEach(this.controllers, (i) => i?.abort())
  }

  hasPending() {
    return size(this.controllers) > 0
  }

  removeControllers(ids: string | string[]) {
    this.controllers = omit(this.controllers, isArray(ids) ? ids : [ids])
  }
}

const abortControllerMap = new AbortControllerMap()

export { AbortControllerMap, abortControllerMap }
