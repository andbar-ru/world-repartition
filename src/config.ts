export const canvas = {
  width: 300,
  height: 300,
} as const

// Colors are taken from https://www.aic-color.org/resources/Documents/jaic_v5_06.pdf.
// Alternate colors are assigned by "L" in LAB color space
export const countries = [
  {
    name: 'A',
    color: 'rgb(240, 163, 255)', // Amethyst
    altColor: 'black',
  },
  {
    name: 'B',
    color: 'rgb(0, 117, 220)', // Blue
    altColor: 'white',
  },
  {
    name: 'C',
    color: 'rgb(153, 63, 0)', // Caramel
    altColor: 'white',
  },
  {
    name: 'D',
    color: 'rgb(76, 0, 92)', // Damson
    altColor: 'white',
  },
  {
    name: 'E',
    color: 'rgb(25, 25, 25)', // Ebony
    altColor: 'white',
  },
  {
    name: 'F',
    color: 'rgb(0, 92, 49)', // Forest
    altColor: 'white',
  },
  {
    name: 'G',
    color: 'rgb(43, 206, 72)', // Green
    altColor: 'black',
  },
  {
    name: 'H',
    color: 'rgb(255, 204, 153)', // Honeydew
    altColor: 'black',
  },
  {
    name: 'I',
    color: 'rgb(128, 128, 128)', // Iron
    altColor: 'black',
  },
  {
    name: 'J',
    color: 'rgb(148, 255, 181)', // Jade
    altColor: 'black',
  },
  {
    name: 'K',
    color: 'rgb(143, 124, 0)', // Khaki
    altColor: 'black',
  },
  {
    name: 'L',
    color: 'rgb(157, 204, 0)', // Lime
    altColor: 'black',
  },
  {
    name: 'M',
    color: 'rgb(194, 0, 136)', // Mallow
    altColor: 'white',
  },
  {
    name: 'N',
    color: 'rgb(0, 51, 128)', // Navy
    altColor: 'white',
  },
  {
    name: 'O',
    color: 'rgb(255, 164, 5)', // Orpiment
    altColor: 'black',
  },
  {
    name: 'P',
    color: 'rgb(255, 168, 187)', // Pink
    altColor: 'black',
  },
  {
    name: 'Q',
    color: 'rgb(66, 102, 0)', // Quagmire
    altColor: 'white',
  },
  {
    name: 'R',
    color: 'rgb(255, 0, 16)', // Red
    altColor: 'black',
  },
  {
    name: 'S',
    color: 'rgb(94, 241, 242)', // Sky
    altColor: 'black',
  },
  {
    name: 'T',
    color: 'rgb(0, 153, 143)', // Turquoise
    altColor: 'black',
  },
  {
    name: 'U',
    color: 'rgb(224, 255, 102)', // Uranium
    altColor: 'black',
  },
  {
    name: 'V',
    color: 'rgb(116, 10, 255)', // Violet
    altColor: 'white',
  },
  {
    name: 'W',
    color: 'rgb(153, 0, 0)', // Wine
    altColor: 'white',
  },
  {
    name: 'X',
    color: 'rgb(255, 255, 128)', // Xanthin
    altColor: 'black',
  },
  {
    name: 'Y',
    color: 'rgb(255, 225, 0)', // Yellow
    altColor: 'black',
  },
  {
    name: 'Z',
    color: 'rgb(255, 80, 5)', // Zinnia
    altColor: 'black',
  },
] as const

/** Land to sea ratio. Keep in mind that this ratio is not in the sense of pixels but origins. */
export const landToSeaRatio = [30, 70]

/** Color of land pixels. Can be the same as of some country. */
export const landColor = 'black'

/** Color of sea pixels. Must be defferent from that of any of the countries. */
export const seaColor = 'white'
