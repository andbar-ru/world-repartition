import countriesConfig from './countries'

interface CountryMetrics {
  minX: number
  maxX: number
  minY: number
  maxY: number
  center: [number, number]
}

class Pixel {
  x: number
  y: number
  country: Country
  extendable = true

  constructor(x: number, y: number, country: Country) {
    this.x = x
    this.y = y
    this.country = country
  }
}

class Country {
  origin: [number, number]
  capital: [number, number] | undefined
  name: string
  color: string
  altColor: string
  pixels: Pixel[] = []
  metrics: CountryMetrics | undefined

  constructor(name: string, color: string, altColor: string, origin: [number, number]) {
    this.name = name
    this.color = color
    this.altColor = altColor
    this.origin = origin
    this.capital = origin
  }

  addPixel(pixel: Pixel) {
    this.pixels.push(pixel)
  }

  calcMetrics(): Country['metrics'] {
    if (!this.pixels.length) {
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
    const meanX = Math.round(sumX / this.pixels.length)
    const meanY = Math.round(sumY / this.pixels.length)

    return {
      minX: minX,
      maxX: maxX,
      minY: minY,
      maxY: maxY,
      center: [meanX, meanY],
    }
  }

  getMetrics(): Country['metrics'] {
    if (this.metrics) {
      return this.metrics
    } else {
      const metrics = this.calcMetrics()
      this.metrics = metrics
      return metrics
    }
  }
}

class World {
  width = 0
  height = 0
  pixels: Pixel[] = []
  countries: Set<Country> = new Set()

  constructor(canvas: HTMLCanvasElement) {
    this.width = canvas.width
    this.height = canvas.height
    this.pixels.length = this.width * this.height
  }

  render(ctx: CanvasRenderingContext2D) {
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

  renderCapitals(ctx: CanvasRenderingContext2D) {
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
          if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
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

  checkRectangle(minX: number, maxX: number, minY: number, maxY: number, country: Country): boolean {
    const capitalPixels: Set<Pixel> = new Set()
    const capital = country.capital
    if (capital) {
      const [x0, y0] = capital
      const delta = 3
      for (let x1 = x0 - delta; x1 <= x0 + delta; x1++) {
        for (let y1 = y0 - delta; y1 <= y0 + delta; y1++) {
          if (x1 < 0 || x1 >= this.width || y1 < 0 || y1 >= this.height) {
            continue
          }
          const i1 = this.width * y1 + x1
          capitalPixels.add(this.pixels[i1])
        }
      }
    }

    for (const x of [minX, maxX]) {
      for (const y of [minY, maxY]) {
        const i = this.width * y + x
        if (this.pixels[i].country !== country) {
          return false
        }
      }
    }
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        const i = this.width * y + x
        const pixel = this.pixels[i]
        if (pixel.country !== country || capitalPixels.has(pixel)) {
          return false
        }
      }
    }

    return true
  }

  findRectangle(width: number, height: number, country: Country, buffer: number): [number, number] | undefined {
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

  renderNames(ctx: CanvasRenderingContext2D) {
    ctx.font = '12px monospace'
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

  addCountry(country: Country) {
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

function getRandomCoordinates(canvas: HTMLCanvasElement, occupiedCoordinates: Set<string>): [number, number] {
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
  const countryOrigins = countriesConfig.map<[number, number]>(() => getRandomCoordinates(canvas, occupiedCoordinates))

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
