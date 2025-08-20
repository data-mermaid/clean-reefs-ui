import { GLOBAL_LULC_URL, REGIONS_URL } from '../constants'

export interface LayerInfo {
  id: string
  link: string
  isLayerOn: boolean
}

//Boolean flags to represent if the individual layer is on or not
//Current layers include: Regions
export const layers: LayerInfo[] = [
  {
    id: '0-regions',
    link: REGIONS_URL,
    isLayerOn: true,
  },
  {
    id: '1-lulc',
    link: GLOBAL_LULC_URL,
    isLayerOn: false,
  },
]
