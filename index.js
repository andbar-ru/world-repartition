class Pixel {
  x
  y
  country
  extendable = true

  constructor(x, y, country) {
    this.x = x
    this.y = y
    this.country = country
  }
}

class World {
  width = 0
  height = 0
  pixels = []
  countries = new Set()

  constructor(canvas) {
    this.width = canvas.width
    this.height = canvas.height
    this.pixels.length = this.width * this.height
  }

  /**
   * Renders world on the canvas
   *
   * @param ctx {CanvasRenderingContext2D} - canvas context
   */
  render(ctx) {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        const i = this.width * y + x
        const pixel = this.pixels[i]
        if (pixel) {
          ctx.fillStyle = pixel.country.color
          ctx.fillRect(x, y, 1, 1)
        }
      }
    }
  }

  /**
   * Renders country capitals as rectangle 3x3.
   *
   * @param ctx {CanvasRenderingContext2D} - canvas context
   */
  renderCapitals(ctx) {
    for (const country of this.countries) {
      const color = country.altColor
      ctx.fillStyle = color

      const [x0, y0] = country.capitalCoordinates

      for (const dx of [-1, 0, 1]) {
        for (const dy of [-1, 0, 1]) {
          const x = x0 + dx
          const y = y0 + dy
          if (x < 0 || x > this.width - 1 || y < 0 || y > this.height - 1) {
            continue
          }
          const i = this.width * y + x
          const pixel = this.pixels[i]
          if (pixel.country === country) {
            ctx.fillRect(x, y, 1, 1)
          }
        }
      }
    }
  }

  /**
   * Adds country into the world.
   *
   * @param country {Country} - country
   * @throws if country is already added or has invalid coordinates
   */
  addCountry(country) {
    if (this.countries.has(country)) {
      throw new Error(`Country ${country.name} already exists in the world`)
    }

    const [x, y] = country.capitalCoordinates

    if (x < 0 || x > this.width - 1 || y < 0 || y > this.height - 1) {
      console.debug(country.coordinates)
      throw new Error('Country has coordinates beyond canvas')
    }

    const i = this.width * y + x

    if (this.pixels[i]) {
      throw new Error(`Pixel [${x}, ${y}] is already occupied`)
    }

    const pixel = new Pixel(x, y, country)
    this.pixels[i] = pixel
    country.addPixel(pixel)
    this.countries.add(country)
  }

  /** Allocates the world among countries by the most straightforward algorithm. */
  allocate() {
    let extendablePixelsExist = true

    while (extendablePixelsExist) {
      extendablePixelsExist = false

      for (const country of this.countries) {
        const extendablePixels = country.pixels.filter((p) => p.extendable)
        if (extendablePixels.length) {
          extendablePixelsExist = true

          for (const pixel of extendablePixels) {
            pixel.extendable = false

            for (const dx of [-1, 0, 1]) {
              for (const dy of [-1, 0, 1]) {
                if (dx === 0 && dy === 0) {
                  continue
                }
                const x = pixel.x + dx
                const y = pixel.y + dy
                if (x < 0 || x > this.width - 1 || y < 0 || y > this.height - 1) {
                  continue
                }
                const i = this.width * y + x
                if (!this.pixels[i]) {
                  const pixel = new Pixel(x, y, country)
                  this.pixels[i] = pixel
                  country.addPixel(pixel)
                }
              }
            }
          }
        }
      }
    }
  }
}

class Country {
  capitalCoordinates
  name
  color
  altColor
  pixels = []

  constructor(name, color, altColor) {
    this.name = name
    this.color = color
    this.altColor = altColor
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
   * Adds pixel to country. Id est extends country's area by one pixel.
   *
   * @param pixel {Pixel} - pixel
   */
  addPixel(pixel) {
    this.pixels.push(pixel)
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

  const world = new World(canvas)
  const countryObjs = countries.map((country) => new Country(country.name, country.color, country.altColor))
  const occupiedCoordinates = new Set()

  for (const country of countryObjs) {
    country.setCapitalCoordinates(getRandomCoordinates(canvas, occupiedCoordinates))
    world.addCountry(country)
  }

  world.allocate()
  world.render(ctx)
  world.renderCapitals(ctx)
}
