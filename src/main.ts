import { countries as countriesConfig, canvas as canvasConfig } from './config'
import { Position } from './types'
import { getRandomCoordinates } from './utils'
import World from './World'
import Country from './Country'

/** All canvases. Will be filled in the `main` function. */
let canvases: Record<string, HTMLCanvasElement> = {}

/** Class name for hidden elements */
const hiddenClass = 'hidden'

/**
 * Listens for the `change` event of checkboxes. Toggles appropriate canvas.
 *
 * @param event - event
 */
function toggleLayer(event: Event) {
  const target = event.target
  if (!(target instanceof HTMLInputElement)) {
    throw new Error('target is not instance of HTMLInputElement')
  }
  const id = target.dataset['id'] ?? 'undefined'
  const canvas = canvases[id]
  if (!canvas) {
    throw new Error(`Unknown id="${id}"`)
  }
  if (target.checked) {
    canvas.classList.remove(hiddenClass)
  } else {
    canvas.classList.add(hiddenClass)
  }
}

/** Main function */
function main() {
  /* Check and initialize html elements. <<HTML END */
  const main = document.getElementById('main')
  if (!main) {
    throw new Error('Could not find element with id="main"')
  }

  const throbber = document.getElementById('throbber')
  if (!throbber) {
    throw new Error('Could not find element with id="throbber"')
  }

  /* Initialize all canvases <<CANVAS END */
  const surfaceCanvas = document.getElementById('surface-canvas')
  if (!(surfaceCanvas instanceof HTMLCanvasElement)) {
    throw new Error('Could not find canvas with id="surface-canvas"')
  }
  let id = surfaceCanvas.dataset['id']
  if (id !== 'surface') {
    throw new Error('canvas[id="surface-canvas"] must have data-id="surface"')
  }
  canvases['surface'] = surfaceCanvas

  const countriesCanvas = document.getElementById('countries-canvas')
  if (!(countriesCanvas instanceof HTMLCanvasElement)) {
    throw new Error('Could not find canvas with id="countries-canvas"')
  }
  id = countriesCanvas.dataset['id']
  if (id !== 'countries') {
    throw new Error('canvas[id="countries-canvas"] must have data-id="countries"')
  }
  canvases['countries'] = countriesCanvas

  const capitalsCanvas = document.getElementById('capitals-canvas')
  if (!(capitalsCanvas instanceof HTMLCanvasElement)) {
    throw new Error('Could not find canvas with id="capitals-canvas"')
  }
  id = capitalsCanvas.dataset['id']
  if (id !== 'capitals') {
    throw new Error('canvas[id="capitals-canvas"] must have data-id="capitals"')
  }
  canvases['capitals'] = capitalsCanvas

  const namesCanvas = document.getElementById('names-canvas')
  if (!(namesCanvas instanceof HTMLCanvasElement)) {
    throw new Error('Could not find canvas with id="names-canvas"')
  }
  id = namesCanvas.dataset['id']
  if (id !== 'names') {
    throw new Error('canvas[id="names-canvas"] must have data-id="names"')
  }
  canvases['names'] = namesCanvas

  const canvasWidth = canvasConfig.width
  const canvasHeight = canvasConfig.height

  for (const canvas of Object.values(canvases)) {
    canvas.width = canvasWidth
    canvas.height = canvasHeight
  }
  /* CANVAS END */

  const layerToggles = Array.from(document.getElementsByClassName('layer-toggle')).filter(
    (el) => el instanceof HTMLInputElement
  )
  if (layerToggles.length !== Object.values(canvases).length) {
    throw new Error('Number of toggles must be the same as of canvases')
  }

  for (const toggle of layerToggles) {
    toggle.addEventListener('change', toggleLayer)
  }
  /* HTML END */

  const surfaceCtx = surfaceCanvas.getContext('2d')
  if (!(surfaceCtx instanceof CanvasRenderingContext2D)) {
    throw new Error('Could not retrieve canvas context')
  }

  const countriesCtx = countriesCanvas.getContext('2d')
  if (!(countriesCtx instanceof CanvasRenderingContext2D)) {
    throw new Error('Could not retrieve canvas context')
  }

  const capitalsCtx = capitalsCanvas.getContext('2d')
  if (!(capitalsCtx instanceof CanvasRenderingContext2D)) {
    throw new Error('Could not retrieve canvas context')
  }

  const namesCtx = namesCanvas.getContext('2d')
  if (!(namesCtx instanceof CanvasRenderingContext2D)) {
    throw new Error('Could not retrieve canvas context')
  }

  const occupiedCoordinates: Set<string> = new Set()
  const countryOrigins = countriesConfig.map<Position>(() =>
    getRandomCoordinates(0, 0, canvasWidth - 1, canvasHeight - 1, occupiedCoordinates)
  )

  const world = new World(canvasWidth, canvasHeight)

  const countries: Country[] = []
  for (let i = 0; i < countriesConfig.length; i++) {
    const cc = countriesConfig[i]!
    const origin = countryOrigins[i]!
    countries.push(new Country(cc.name, cc.color, cc.altColor, origin))
  }
  for (const country of countries) {
    world.addCountry(country)
  }
  world.allocateCountries()

  world.renderSurface(surfaceCtx)
  world.renderCountries(countriesCtx)
  world.renderCapitals(capitalsCtx)
  world.renderNames(namesCtx)

  main.classList.remove(hiddenClass)
  throbber.classList.add(hiddenClass)
}

main()
