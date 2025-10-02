export interface MapErrorEvent {
  error?: {
    message?: string
    statusText?: string
  }
  sourceId?: string
}

export interface SourceDataEvent {
  isSourceLoaded: boolean
  sourceId?: string
  dataType?: string
  sourceDataType?: string
  error?: Error
  tile?: unknown
}
