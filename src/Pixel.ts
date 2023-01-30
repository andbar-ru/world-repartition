import Country from './Country'

/** Represents one pixel on a canvas. */
export default class Pixel {
  /** X-coordinate */
  public x: number
  /** Y-coordinate */
  public y: number
  /** Country having this pixel */
  public country: Country | undefined
  /** Pixel is likely to have free pixels around */
  public extendable = true

  /**
   * The constructor of the `Pixel` class.
   *
   * @param x - X-coordinate
   * @param y - Y-coordinate
   */
  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }

  /**
   * Sets country to the pixel.
   *
   * @param country - Country
   */
  public setCountry(country: Country) {
    this.country = country
    this.country.addPixel(this)
  }
}
