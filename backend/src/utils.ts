import { DATA_CHUNK_PREFIX, DATA_CHUNK_SUFFIX } from './constants'

function getDataChunk(data: string) {
  return `${DATA_CHUNK_PREFIX}${data}${DATA_CHUNK_SUFFIX}`
}

export { getDataChunk }
