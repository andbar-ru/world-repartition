class Country {
  capitalCoordinates
  name
  color

  constructor(name, color) {
    this.name = name
    this.color = color
  }

  /**
   * Sets coordinates of capital (country origin).
   *
   * @param coordinates {[number, number]} - coordinates
   */
  setCapitalCoordinates(coordinates) {
    this.capitalCoordinates = coordinates
  }

  /**
   * Draws capital on the canvas as point.
   *
   * @param ctx {CanvasRenderingContext2D} - canvas context
   */
  drawCapital(ctx) {
    ctx.fillStyle = this.color
    ctx.fillRect(this.capitalCoordinates[0], this.capitalCoordinates[1], 1, 1)
  }
}

/**
 * Returns random coordinates on canvas except coordinates in occupiedCoordinates.
 *
 * @param canvas {HTMLCanvasElement} - canvas
 * @param occupiedCoordinates {Set<string>} - set of occupied coordinates in the form of string `x_y`
 * @returns {[number, number]} coordinates
 * @throws if failed to find free coordinates
 */
function getRandomCoordinates(canvas, occupiedCoordinates) {
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

/** Main function running on <body> load. */
function main() {
  const canvas = document.getElementById('canvas')
  const ctx = canvas.getContext('2d')

  const countryObjs = countries.map((country) => new Country(country.name, country.color))
  const occupiedCoordinates = new Set()

  for (const country of countryObjs) {
    country.setCapitalCoordinates(getRandomCoordinates(canvas, occupiedCoordinates))
    country.drawCapital(ctx)
  }
}
