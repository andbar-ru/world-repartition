import { Position } from './types'
import Pixel from './Pixel'

/** Country metrics. */
export interface CountryMetrics {
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

/** Represents a country. */
export default class Country {
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
