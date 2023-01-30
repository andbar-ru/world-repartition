import Pixel from './Pixel'
import Country from './Country'
import { Position } from './types'

/** Represents the world. Fills the entire canvas. */
export default class World {
  /** Width */
  width = 0
  /** Height */
  height = 0
  /** Pixels the world consists of */
  pixels: ReadonlyArray<ReadonlyArray<Pixel>> = []
  /** Countries in the world */
  countries: Set<Country> = new Set()

  /**
   * The constructor of the `World` class.
   *
   * @param width - Width
   * @param height - Height
   */
  constructor(width: number, height: number) {
    this.width = width
    this.height = height

    const pixels: Array<ReadonlyArray<Pixel>> = []

    for (let x = 0; x < width; x++) {
      const row: Pixel[] = []
      for (let y = 0; y < height; y++) {
        const pixel = new Pixel(x, y)
        row.push(pixel)
      }
      pixels.push(Object.freeze(row))
    }

    this.pixels = Object.freeze(pixels)
  }

  /**
   * Renders countries on the canvas.
   *
   * @param ctx - Canvas context
   */
  public renderCountries(ctx: CanvasRenderingContext2D) {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        const pixel = this.pixels[x]![y]!
        const color = pixel.country?.color ?? 'transparent'
        ctx.fillStyle = color
        ctx.fillRect(x, y, 1, 1)
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
          const pixel = this.pixels[x]?.[y]
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
          const pixel = this.pixels[x1]?.[y1]
          if (!pixel) {
            continue
          }
          capitalPixels.add(pixel)
        }
      }
    }

    for (const x of [minX, maxX]) {
      for (const y of [minY, maxY]) {
        const pixel = this.pixels[x]?.[y]
        if (!pixel || pixel.country !== country) {
          return false
        }
      }
    }
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        const pixel = this.pixels[x]?.[y]
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

    const pixel = this.pixels[x]![y]! // pixel certainly exists, based on checks above

    if (pixel.country) {
      throw new Error(`Pixel [${x}, ${y}] is already occupied`)
    }

    pixel.setCountry(country)
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
                const p = this.pixels[x]![y]! // pixel certainly exists, based on checks above
                if (!p.country) {
                  p.setCountry(country)
                }
              }
            }
          }
        }
      }
    }
  }
}
