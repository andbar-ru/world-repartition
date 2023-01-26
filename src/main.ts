import { countries as countriesConfig } from './config'
import { Position } from './types'
import { getRandomCoordinates } from './utils'
import World from './World'
import Country from './Country'

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
    const cc = countriesConfig[i]!
    const origin = countryOrigins[i]!
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
