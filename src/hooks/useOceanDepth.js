import { useOceanDepthContext } from '../context/OceanDepthContext'
import { getZone, metersAt } from '../constants/depthZones'

export function useOceanDepth() {
  const { depth, depthRef } = useOceanDepthContext()
  const depthMeters = Math.round(metersAt(depth))
  const zone        = getZone(depth)
  return { depth, depthRef, depthMeters, zone }
}
