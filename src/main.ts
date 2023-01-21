import { countries as countriesConfig } from './config'
import { Position } from './types'

/** Country metrics. */
interface CountryMetrics {
  /** Minimal X */
  minX: number
  /** Maximal X */
  maxX: number
  /** Minimal Y */
  minY: number
  /** Maximal Y */
  maxY: number
  /** Coordinates of the center of gravity */
  center: Position
}

/** Represents one pixel on a canvas. */
class Pixel {
  /** X-coordinate */
  public x: number
  /** Y-coordinate */
  public y: number
  /** Country having this pixel */
  public country: Country
  /** Pixel has free pixels around */
  public extendable = true

  /**
   * The constructor of the `Pixel` class.
   *
   * @param x - X-coordinate
   * @param y - Y-coordinate
   * @param country - instance of `Country` class
   */
  constructor(x: number, y: number, country: Country) {
    this.x = x
    this.y = y
    this.country = country
    this.country.addPixel(this)
  }
}

/** Represents a country. */
class Country {
  /** Coordinates of the origin */
  public origin: Position
  /** Coordinates of the capital */
  public capital: Position | undefined
  /** Country name */
  public name: string
  /** Country color on a canvas */
  public color: string
  /** ALternative color. Used for capital and name */
  public altColor: string
  /** Pixels that make up the country */
  public pixels: Set<Pixel> = new Set()
  /** Country metrics */
  public metrics: CountryMetrics | undefined

  /**
   * The constructor of the `Country` class.
   *
   * @param name - Country name
   * @param color - Background color
   * @param altColor - Alternative color
   * @param origin - Coordinates of the country origin
   */
  constructor(name: string, color: string, altColor: string, origin: Position) {
    this.name = name
    this.color = color
    this.altColor = altColor
    this.origin = origin
    this.capital = origin
  }

  /**
   * Assignes pixel to the country.
   *
   * @param pixel - instance of the `Pixel` class
   */
  public addPixel(pixel: Pixel) {
    this.pixels.add(pixel)
  }

  /**
   * Calculates country metrics.
   *
   * @returns Metrics or undefined if country has no pixels
   */
  private calcMetrics(): Country['metrics'] {
    if (!this.pixels.size) {
      return undefined
    }

    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity,
      sumX = 0,
      sumY = 0
    for (const pixel of this.pixels) {
      const x = pixel.x
      const y = pixel.y
      if (x < minX) {
        minX = x
      }
      if (x > maxX) {
        maxX = x
      }
      if (y < minY) {
        minY = y
      }
      if (y > maxY) {
        maxY = y
      }
      sumX += x
      sumY += y
    }
    const meanX = Math.round(sumX / this.pixels.size)
    const meanY = Math.round(sumY / this.pixels.size)

    return {
      minX: minX,
      maxX: maxX,
      minY: minY,
      maxY: maxY,
      center: [meanX, meanY],
    }
  }

  /**
   * Returns country metrics if already calculated. If no, calculates and returns.
   *
   * @returns Metrics
   */
  public getMetrics(): Country['metrics'] {
    if (this.metrics) {
      return this.metrics
    } else {
      const metrics = this.calcMetrics()
      this.metrics = metrics
      return metrics
    }
  }
}

/** Represents the world. Fills the entire canvas. */
class World {
  /** Width */
  width = 0
  /** Height */
  height = 0
  /** Pixels the world consists of */
  pixels: Pixel[] = []
  /** Countries in the world */
  countries: Set<Country> = new Set()

  /**
   * The constructor of the `World` class.
   *
   * @param canvas - Canvas
   */
  constructor(canvas: HTMLCanvasElement) {
    this.width = canvas.width
    this.height = canvas.height
    this.pixels.length = this.width * this.height
  }

  /**
   * Return pixel represented by coordinates.
   *
   * @param x - X-coordinate
   * @param y - Y-coordinate
   * @returns Pixel or undefined if coordinates are beyond the world
   */
  private getPixel(x: number, y: number): Pixel | undefined {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return
    }
    const i = this.width * y + x
    return this.pixels[i]
  }

  /**
   * Renders the world on the canvas.
   *
   * @param ctx - Canvas context
   */
  public render(ctx: CanvasRenderingContext2D) {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        const pixel = this.getPixel(x, y)
        if (pixel) {
          ctx.fillStyle = pixel.country.color
          ctx.fillRect(x, y, 1, 1)
        }
      }
    }
  }

  /**
   * Renders only capitals on the canvas.
   *
   * @param ctx - Canvas context
   */
  public renderCapitals(ctx: CanvasRenderingContext2D) {
    for (const country of this.countries) {
      const color = country.altColor
      ctx.fillStyle = color

      if (!country.capital) {
        continue
      }

      const [x0, y0] = country.capital

      for (const dx of [-1, 0, 1]) {
        for (const dy of [-1, 0, 1]) {
          const x = x0 + dx
          const y = y0 + dy
          const pixel = this.getPixel(x, y)
          if (!pixel) {
            continue
          }
          if (pixel.country === country) {
            ctx.fillRect(x, y, 1, 1)
          }
        }
      }
    }
  }

  /**
   * Checks that all pixels of the rectangle belong to the same country and are not under the
   * country's capital.
   *
   * @param minX - X-coordinate of the rectangle top left corner
   * @param maxX - X-coordinate of the rectangle bottom right corner
   * @param minY - Y-coordinate of the rectangle top left corner
   * @param maxY - Y-coordinate of the rectangle bottom right corner
   * @param country - Country
   * @returns Result
   */
  private checkRectangle(minX: number, maxX: number, minY: number, maxY: number, country: Country): boolean {
    const capitalPixels: Set<Pixel> = new Set()
    const capital = country.capital
    if (capital) {
      const [x0, y0] = capital
      const delta = 3
      for (let x1 = x0 - delta; x1 <= x0 + delta; x1++) {
        for (let y1 = y0 - delta; y1 <= y0 + delta; y1++) {
          const pixel = this.getPixel(x1, y1)
          if (!pixel) {
            continue
          }
          capitalPixels.add(pixel)
        }
      }
    }

    for (const x of [minX, maxX]) {
      for (const y of [minY, maxY]) {
        const pixel = this.getPixel(x, y)
        if (!pixel || pixel.country !== country) {
          return false
        }
      }
    }
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        const pixel = this.getPixel(x, y)
        if (!pixel || pixel.country !== country || capitalPixels.has(pixel)) {
          return false
        }
      }
    }

    return true
  }

  /**
   * Searches for a rectangle whose pixels all belong to the same country and are free.
   *
   * @param width - Rectangle width
   * @param height - Rectangle height
   * @param country - Country
   * @param buffer - Buffer around the rectangle, in pixels, that must be also free
   * @returns Coordinates of the rectangle center if it found, or undefined otherwise
   */
  private findRectangle(width: number, height: number, country: Country, buffer: number): Position | undefined {
    const metrics = country.getMetrics()
    if (!metrics) {
      return
    }
    const halfWidth = Math.ceil(width / 2)
    const halfHeight = Math.ceil(height / 2)
    let [x, y] = metrics.center
    const minX = metrics.minX + halfWidth + buffer
    const maxX = metrics.maxX - halfWidth - buffer
    const minY = metrics.minY + halfHeight + buffer
    const maxY = metrics.maxY - halfHeight - buffer

    let delta = 0

    while (x - delta >= minX && x + delta <= maxX && y - delta >= minY && y + delta <= maxY) {
      if (!delta) {
        const ok = this.checkRectangle(x - halfWidth, x + halfWidth, y - halfHeight, y + halfHeight, country)
        if (ok) {
          return [x, y]
        }
        delta++
        continue
      } else {
        for (const dx of [-delta, 0, delta]) {
          for (const dy of [-delta, 0, delta]) {
            if (!dx && !dy) {
              continue
            }
            const x1 = x + dx
            const y1 = y + dy
            const ok = this.checkRectangle(x1 - halfWidth, x1 + halfWidth, y1 - halfHeight, y1 + halfHeight, country)
            if (ok) {
              return [x1, y1]
            }
          }
        }
        delta++
        continue
      }
    }

    return
  }

  /**
   * Render country names on the canvas.
   *
   * @param ctx - Canvas context
   */
  public renderNames(ctx: CanvasRenderingContext2D) {
    ctx.font = '12px Terminus' // pixel perfect font but only in Firefox
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    for (const country of this.countries) {
      const textMetrics = ctx.measureText(country.name)
      const textWidth = textMetrics.width
      const textHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent
      const xy = this.findRectangle(textWidth, textHeight, country, 1)
      if (!xy) {
        continue
      }
      const [x, y] = xy
      ctx.fillStyle = country.altColor
      ctx.fillText(country.name, x, y)
    }
  }

  /**
   * Adds country to the world.
   *
   * @param country - Country
   */
  public addCountry(country: Country) {
    if (this.countries.has(country)) {
      throw new Error(`Country ${country.name} already exists in the world`)
    }

    const [x, y] = country.origin

    if (x < 0 || x > this.width - 1 || y < 0 || y > this.height - 1) {
      console.debug(country.capital)
      throw new Error('Country has coordinates beyond canvas')
    }

    const i = this.width * y + x
    if (this.pixels[i]) {
      throw new Error(`Pixel [${x}, ${y}] is already occupied`)
    }

    const pixel = new Pixel(x, y, country)
    this.pixels[i] = pixel
    this.countries.add(country)
  }

  /** Allocates the world among countries by the most straightforward algorithm. */
  public allocate() {
    let extendablePixelsExist = true

    while (extendablePixelsExist) {
      extendablePixelsExist = false

      for (const country of this.countries) {
        const extendablePixels = Array.from(country.pixels).filter((p) => p.extendable)
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
                if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
                  continue
                }
                const i = this.width * y + x
                if (!this.pixels[i]) {
                  const pixel = new Pixel(x, y, country)
                  this.pixels[i] = pixel
                }
              }
            }
          }
        }
      }
    }
  }
}

/**
 * Return random coordinates on the canvas.
 *
 * @param canvas - Canvas
 * @param occupiedCoordinates - Already occupied coordinates in string format.
 * @returns Coordinates
 * @throws If failed to find unoccupied coordinates
 */
function getRandomCoordinates(canvas: HTMLCanvasElement, occupiedCoordinates: Set<string>): Position {
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

/** Main function */
function main() {
  const canvas = document.getElementById('canvas')
  if (!(canvas instanceof HTMLCanvasElement)) {
    throw new Error('Could not find element with id "canvas"')
  }

  const ctx = canvas.getContext('2d')
  if (!(ctx instanceof CanvasRenderingContext2D)) {
    throw new Error('Could not retrieve canvas context')
  }

  const occupiedCoordinates: Set<string> = new Set()
  const countryOrigins = countriesConfig.map<Position>(() => getRandomCoordinates(canvas, occupiedCoordinates))

  const world = new World(canvas)
  const countries: Country[] = []
  for (let i = 0; i < countriesConfig.length; i++) {
    const cc = countriesConfig[i]
    const origin = countryOrigins[i]
    countries.push(new Country(cc.name, cc.color, cc.altColor, origin))
  }

  for (const country of countries) {
    world.addCountry(country)
  }

  world.allocate()
  world.render(ctx)
  world.renderCapitals(ctx)
  world.renderNames(ctx)
}

main()
