import { Tile } from 'maplibre-gl'

export interface SourceDataEvent {
  isSourceLoaded: boolean
  sourceId?: string
  dataType?: string
  sourceDataType?: string
  error?: Error
  tile?: Tile
}
