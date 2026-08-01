// Genera los PNG de la marca VizFitness sin dependencias (PNG a mano con
// zlib), igual que hace build/make-icon.mjs en VizPlay:
//
//   assets/icon.png           1024×1024  baldosa naranja + mancuerna blanca
//   assets/adaptive-icon.png  1024×1024  solo la mancuerna, fondo transparente
//                                        (Android pone detrás el naranja)
//   assets/splash.png         1024×1024  la mancuerna sobre transparente,
//                                        más pequeña, para la pantalla de carga
//
// Uso:  node assets/make-icons.mjs
//
// El dibujo se hace en un lienzo lógico de 512 y se escala; cada píxel se
// muestrea 3×3 para que los bordes redondeados no salgan dentados.
import zlib from 'node:zlib'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const S = 1024 // tamaño final
const U = 512 // lienzo lógico en el que están las coordenadas de abajo
const SS = 3 // muestras por eje (antialiasing)

// -------------------------------------------------------------- la paleta
const TILE_TOP = [0xff, 0x9a, 0x3d] // #FF9A3D
const TILE_BOT = [0xe8, 0x5d, 0x00] // #E85D00
const GLYPH = [0xff, 0xff, 0xff]

// ------------------------------------------------------------ la geometría
/** Rectángulo redondeado en coordenadas del lienzo lógico. */
function roundRect (x0, y0, x1, y1, r) {
  return (x, y) => {
    if (x < x0 || x > x1 || y < y0 || y > y1) return false
    const dx = Math.max(x0 + r - x, x - (x1 - r), 0)
    const dy = Math.max(y0 + r - y, y - (y1 - r), 0)
    return dx * dx + dy * dy <= r * r
  }
}

// La mancuerna: barra central, dos discos grandes y dos pequeños. Va
// centrada en el lienzo (los discos van de 182 a 330: centro exacto, 256).
const BAR = roundRect(120, 238, 392, 274, 18)
const PLATE_L = roundRect(96, 182, 148, 330, 18)
const PLATE_R = roundRect(364, 182, 416, 330, 18)
const SMALL_L = roundRect(58, 216, 92, 296, 14)
const SMALL_R = roundRect(420, 216, 454, 296, 14)
const inDumbbell = (x, y) =>
  BAR(x, y) || PLATE_L(x, y) || PLATE_R(x, y) || SMALL_L(x, y) || SMALL_R(x, y)

const TILE = roundRect(0, 0, U, U, 112)

// --------------------------------------------------------------- el pintor
/**
 * Pinta un PNG RGBA de S×S.
 * @param scale  cuánto se encoge el glifo respecto al lienzo (1 = a sangre)
 * @param tile   si true, se pinta la baldosa naranja detrás
 */
function render ({ scale, tile }) {
  const buf = Buffer.alloc(S * S * 4)
  const step = U / S / SS
  const off = step / 2

  for (let py = 0; py < S; py++) {
    for (let px = 0; px < S; px++) {
      let hitTile = 0
      let hitGlyph = 0
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const x = (px * SS + sx) * step + off
          const y = (py * SS + sy) * step + off
          if (tile && TILE(x, y)) hitTile++
          // El glifo se encoge alrededor del centro del lienzo
          const gx = (x - U / 2) / scale + U / 2
          const gy = (y - U / 2) / scale + U / 2
          if (inDumbbell(gx, gy)) hitGlyph++
        }
      }
      const n = SS * SS
      const aTile = hitTile / n
      const aGlyph = hitGlyph / n
      const i = (py * S + px) * 4

      // Fondo: degradado vertical de la baldosa (o transparente)
      const g = py / S
      const bg = [
        Math.round(TILE_TOP[0] + (TILE_BOT[0] - TILE_TOP[0]) * g),
        Math.round(TILE_TOP[1] + (TILE_BOT[1] - TILE_TOP[1]) * g),
        Math.round(TILE_TOP[2] + (TILE_BOT[2] - TILE_TOP[2]) * g)
      ]
      const alpha = Math.max(aTile, aGlyph)
      if (alpha === 0) continue

      // El glifo va encima del fondo; donde no hay fondo, el glifo manda
      const base = aTile > 0 ? bg : GLYPH
      const k = alpha === 0 ? 0 : aGlyph / alpha
      buf[i] = Math.round(base[0] + (GLYPH[0] - base[0]) * k)
      buf[i + 1] = Math.round(base[1] + (GLYPH[1] - base[1]) * k)
      buf[i + 2] = Math.round(base[2] + (GLYPH[2] - base[2]) * k)
      buf[i + 3] = Math.round(alpha * 255)
    }
  }
  return buf
}

// ------------------------------------------------------- empaquetado PNG
function crc32 (b) {
  let c = ~0
  for (let i = 0; i < b.length; i++) {
    c ^= b[i]
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1))
  }
  return ~c
}
function chunk (type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length)
  const t = Buffer.from(type)
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t, data])) >>> 0)
  return Buffer.concat([len, t, data, crc])
}
function toPng (buf) {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(S, 0); ihdr.writeUInt32BE(S, 4)
  ihdr[8] = 8; ihdr[9] = 6 // 8 bits por canal, RGBA
  const raw = Buffer.alloc((S * 4 + 1) * S)
  for (let y = 0; y < S; y++) {
    raw[y * (S * 4 + 1)] = 0
    buf.copy(raw, y * (S * 4 + 1) + 1, y * S * 4, (y + 1) * S * 4)
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ])
}

// ------------------------------------------------------------------ salida
const OUT = [
  // Icono normal: baldosa naranja a sangre con la mancuerna encima.
  ['icon.png', { scale: 1, tile: true }],
  // Adaptativo: Android recorta la forma y aplica el fondo naranja del
  // app.json, así que aquí solo va el glifo y encogido a la zona segura.
  ['adaptive-icon.png', { scale: 0.62, tile: false }],
  // Splash: el mismo glifo, algo más pequeño, sobre el fondo del app.json.
  ['splash.png', { scale: 0.5, tile: false }]
]

for (const [name, opts] of OUT) {
  fs.writeFileSync(path.join(__dirname, name), toPng(render(opts)))
  console.log(`assets/${name} generado (${S}x${S})`)
}
