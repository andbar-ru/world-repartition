import Country from './Country'

/** Represents one pixel on a canvas. */
export default class Pixel {
  /** X-coordinate */
  public x: number
  /** Y-coordinate */
  public y: number
  /** Country having this pixel */
  public country: Country
  /** Pixel is likely to have free pixels around */
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
