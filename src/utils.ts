import { Position } from './types'

/**
 * Return random coordinates on the canvas.
 *
 * @param canvas - Canvas
 * @param occupiedCoordinates - Already occupied coordinates in string format.
 * @returns Coordinates
 * @throws If failed to find unoccupied coordinates
 */
export function getRandomCoordinates(canvas: HTMLCanvasElement, occupiedCoordinates: Set<string>): Position {
  const maxTries = 100
  let tryCount = 1

  while (tryCount <= maxTries) {
    const x = Math.floor(Math.random() * canvas.width)
    const y = Math.floor(Math.random() * canvas.height)
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
