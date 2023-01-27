import { Position } from './types'

/**
 * Return random coordinates in bbox [minX, minY, maxX, maxY] including boundary.
 *
 * @param minX - Minimal X
 * @param minY - Minimal Y
 * @param maxX - Maximal X
 * @param maxY - Maximal Y
 * @param occupiedCoordinates - Already occupied coordinates in string format.
 * @returns Coordinates
 * @throws If failed to find unoccupied coordinates
 */
export function getRandomCoordinates(
  minX: number,
  minY: number,
  maxX: number,
  maxY: number,
  occupiedCoordinates: Set<string>
): Position {
  const xRange = maxX - minX
  const yRange = maxY - minY
  const maxTries = 100
  let tryCount = 1

  while (tryCount <= maxTries) {
    const x = Math.floor(Math.random() * (xRange + 1) + minX)
    const y = Math.floor(Math.random() * (yRange + 1) + minY)
    const xy = `${x}_${y}`
    if (!occupiedCoordinates.has(xy)) {
      occupiedCoordinates.add(xy)
      return [x, y]
    } else {
      tryCount++
      continue
    }
  }

  throw new Error('Failed to find free coordinates')
}
