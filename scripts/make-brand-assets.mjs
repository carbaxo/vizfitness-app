// Genera todos los archivos de imagen de la marca VizFitness a partir de una
// única definición del logotipo, sin dependencias (los PNG se escriben a mano
// con zlib, igual que build/make-icon.mjs en VizPlay):
//
//   public/icon.svg               icono de la web / PWA
//   public/icon-maskable.svg      variante recortable (Android en el navegador)
//   mobile/assets/icon.png        1024x1024, icono de la APK
//   mobile/assets/adaptive-icon.png  capa de primer plano del icono adaptativo
//   mobile/assets/splash.png      logotipo de la pantalla de carga
//
// Uso:  node scripts/make-brand-assets.mjs
//
// El logotipo es la palabra VIZFITNESS en dos líneas justificadas al mismo
// ancho: VIZ en blanco y FITNESS en naranja. Las letras van como contornos
// vectoriales —extraídos de Inter Display Black, la misma tipografía con la
// que está hecho el logotipo de VizPlay— para que no haga falta la fuente ni
// para dibujar los PNG ni para que los SVG se vean igual en cualquier sitio.
import zlib from 'node:zlib'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')

// --------------------------------------------------------------- el logo
// Contornos de cada palabra, con la línea base en y=0 y creciendo hacia
// arriba (y negativa). Las coordenadas están en unidades de em de la fuente.
const VIZ = { d: "M500 0L0 -1490L458 -1490L631 -912Q670 -782 706.5 -652Q743 -522 778 -391Q812 -522 847 -652Q882 -782 919 -912L1084 -1490L1536 -1490L1052 0L500 0ZM1992 -1490L1992 0L1576 0L1576 -1490L1992 -1490ZM2082 0L2082 -312L2639 -959Q2678 -1004 2717.5 -1048.5Q2757 -1093 2799 -1138L2096 -1138L2096 -1490L3312 -1490L3312 -1178L2762 -528Q2725 -484 2686 -440Q2647 -396 2607 -352L3318 -352L3318 0L2082 0Z", w: 3368 }
const FITNESS = { d: "M80 0L80 -1490L1199 -1490L1199 -1138L496 -1138L496 -874L1159 -874L1159 -536L496 -536L496 0L80 0ZM1695 -1490L1695 0L1279 0L1279 -1490L1695 -1490ZM1775 -1138L1775 -1490L3039 -1490L3039 -1138L2615 -1138L2615 0L2199 0L2199 -1138L1775 -1138ZM3119 0L3119 -1490L3543 -1490L3906 -905Q3932 -863 3974 -787Q4016 -711 4060 -631Q4057 -721 4056 -806Q4055 -891 4055 -944L4055 -1490L4471 -1490L4471 0L4047 0L3708 -544Q3676 -595 3629.5 -676.5Q3583 -758 3530 -855Q3534 -754 3534.5 -671.5Q3535 -589 3535 -544L3535 0L3119 0ZM4591 0L4591 -1490L5745 -1490L5745 -1138L5007 -1138L5007 -914L5688 -914L5688 -574L5007 -574L5007 -352L5745 -352L5745 0L4591 0ZM6469 24Q6159 24 5994 -110.5Q5829 -245 5829 -496L6222 -496Q6227 -405 6294 -354.5Q6361 -304 6474 -304Q6572 -304 6632.5 -340.5Q6693 -377 6693 -435Q6693 -489 6634 -523Q6575 -557 6449 -581L6301 -609Q6085 -650 5971 -761Q5857 -872 5857 -1038Q5857 -1180 5934 -1287Q6011 -1394 6148 -1454Q6285 -1514 6466 -1514Q6745 -1514 6905.5 -1383Q7066 -1252 7073 -1018L6691 -1018Q6684 -1096 6625.5 -1141Q6567 -1186 6474 -1186Q6386 -1186 6330.5 -1150Q6275 -1114 6275 -1058Q6275 -1005 6328 -973.5Q6381 -942 6497 -921L6617 -899Q6874 -852 6989 -748.5Q7104 -645 7104 -466Q7104 -232 6938 -104Q6772 24 6469 24ZM7832 24Q7522 24 7357 -110.5Q7192 -245 7192 -496L7585 -496Q7590 -405 7657 -354.5Q7724 -304 7837 -304Q7935 -304 7995.5 -340.5Q8056 -377 8056 -435Q8056 -489 7997 -523Q7938 -557 7812 -581L7664 -609Q7448 -650 7334 -761Q7220 -872 7220 -1038Q7220 -1180 7297 -1287Q7374 -1394 7511 -1454Q7648 -1514 7829 -1514Q8108 -1514 8268.5 -1383Q8429 -1252 8436 -1018L8054 -1018Q8047 -1096 7988.5 -1141Q7930 -1186 7837 -1186Q7749 -1186 7693.5 -1150Q7638 -1114 7638 -1058Q7638 -1005 7691 -973.5Q7744 -942 7860 -921L7980 -899Q8237 -852 8352 -748.5Q8467 -645 8467 -466Q8467 -232 8301 -104Q8135 24 7832 24Z", w: 8531 }
const CAP = 1490 // altura de las mayúsculas de Inter, en unidades de em

// Colores de marca
const WHITE = [0xff, 0xff, 0xff]
const ORANGE = [0xff, 0x6f, 0x00] // #FF6F00
const BG = [0x12, 0x10, 0x0e] // #12100E

// Composición dentro de un lienzo lógico de 512: las dos palabras estiradas
// al mismo ancho, una encima de otra, y el bloque centrado.
const U = 512
const TILE_R = 112 // radio de la esquina de la baldosa

/**
 * Calcula dónde va cada palabra.
 * @param width  ancho al que se justifican las dos líneas
 * @param gap    aire entre líneas
 */
function layout (width, gap) {
  const sViz = width / VIZ.w
  const sFit = width / FITNESS.w
  const capViz = CAP * sViz
  const capFit = CAP * sFit
  const total = capViz + gap + capFit
  const top = (U - total) / 2
  const x = (U - width) / 2
  return [
    { word: VIZ, s: sViz, x, y: top + capViz, color: WHITE },
    { word: FITNESS, s: sFit, x, y: top + capViz + gap + capFit, color: ORANGE }
  ]
}

const LOGO = layout(380, 16)

// ==================================================================== SVG
function svgLogo (scale = 1) {
  return LOGO.map((l) => {
    // El encogido opcional (variante recortable) es alrededor del centro
    const s = l.s * scale
    const x = U / 2 + (l.x - U / 2) * scale
    const y = U / 2 + (l.y - U / 2) * scale
    const c = '#' + l.color.map((v) => v.toString(16).padStart(2, '0')).join('')
    return `  <g transform="translate(${round(x)} ${round(y)}) scale(${round(s, 5)})" fill="${c}"><path d="${l.word.d}"/></g>`
  }).join('\n')
}
const round = (v, n = 2) => +v.toFixed(n)
const bgHex = '#' + BG.map((v) => v.toString(16).padStart(2, '0')).join('')

const svgs = {
  'public/icon.svg':
`<!-- Icono de VizFitness: el logotipo (VIZ en blanco, FITNESS en naranja)
     sobre la baldosa oscura de la marca. Generado por
     scripts/make-brand-assets.mjs — no editar a mano. -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="${TILE_R}" fill="${bgHex}"/>
${svgLogo(1)}
</svg>
`,
  'public/icon-maskable.svg':
`<!-- Variante "maskable": el sistema recorta la forma que quiera, así que el
     fondo llega hasta el borde y el logotipo se encoge para caber en la zona
     segura. Generado por scripts/make-brand-assets.mjs — no editar a mano. -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="${bgHex}"/>
${svgLogo(0.72)}
</svg>
`
}

// ============================================================ rasterizado
const S = 1024 // tamaño de los PNG
const SS = 4 // sub-filas por píxel (suavizado en vertical; en horizontal es exacto)

/** Convierte un trazado SVG (solo M/L/Q/Z absolutos) en polígonos ya en píxeles. */
function flatten (d, tx, ty, scale) {
  const polys = []
  let cur = null
  let px = 0; let py = 0
  let startX = 0; let startY = 0
  const P = (x, y) => [tx + x * scale, ty + y * scale]
  const re = /([MLQZ])([^MLQZ]*)/gi
  let m
  while ((m = re.exec(d))) {
    const cmd = m[1].toUpperCase()
    const n = m[2].trim().length ? m[2].trim().split(/[\s,]+/).map(Number) : []
    if (cmd === 'M') {
      if (cur && cur.length > 2) polys.push(cur)
      cur = [P(n[0], n[1])]
      px = n[0]; py = n[1]; startX = px; startY = py
    } else if (cmd === 'L') {
      cur.push(P(n[0], n[1])); px = n[0]; py = n[1]
    } else if (cmd === 'Q') {
      // Cuadrática: se parte en tramos rectos; 12 bastan al tamaño al que se
      // usa (a 1024 px cada tramo mide menos de un píxel).
      const [cx, cy, ex, ey] = n
      for (let i = 1; i <= 12; i++) {
        const t = i / 12; const u = 1 - t
        cur.push(P(u * u * px + 2 * u * t * cx + t * t * ex, u * u * py + 2 * u * t * cy + t * t * ey))
      }
      px = ex; py = ey
    } else if (cmd === 'Z') {
      if (cur) { cur.push(P(startX, startY)); polys.push(cur); cur = null }
    }
  }
  if (cur && cur.length > 2) polys.push(cur)
  return polys
}

/**
 * Cobertura (0..1) de los polígonos en cada píxel, con la regla non-zero.
 * En horizontal se mide el trozo exacto de píxel que cubre cada tramo, y en
 * vertical se toman SS muestras: sale un borde limpio sin dependencias.
 */
function coverage (polys) {
  const cov = new Float32Array(S * S)
  const edges = []
  for (const poly of polys) {
    for (let i = 0; i + 1 < poly.length; i++) {
      const [x0, y0] = poly[i]; const [x1, y1] = poly[i + 1]
      if (y0 !== y1) edges.push({ x0, y0, x1, y1, dir: y1 > y0 ? 1 : -1 })
    }
  }
  if (!edges.length) return cov
  const xs = []
  for (let row = 0; row < S * SS; row++) {
    const y = (row + 0.5) / SS
    xs.length = 0
    for (const e of edges) {
      const lo = Math.min(e.y0, e.y1); const hi = Math.max(e.y0, e.y1)
      if (y < lo || y >= hi) continue
      xs.push({ x: e.x0 + ((y - e.y0) / (e.y1 - e.y0)) * (e.x1 - e.x0), dir: e.dir })
    }
    if (xs.length < 2) continue
    xs.sort((a, b) => a.x - b.x)
    let wind = 0
    const base = Math.floor(row / SS) * S
    for (let i = 0; i + 1 < xs.length; i++) {
      wind += xs[i].dir
      if (wind === 0) continue
      let a = xs[i].x; let b = xs[i + 1].x
      if (b <= 0 || a >= S) continue
      a = Math.max(a, 0); b = Math.min(b, S)
      const p0 = Math.floor(a); const p1 = Math.floor(b - 1e-9)
      if (p0 === p1) { cov[base + p0] += (b - a) / SS; continue }
      cov[base + p0] += (p0 + 1 - a) / SS
      for (let p = p0 + 1; p < p1; p++) cov[base + p] += 1 / SS
      cov[base + p1] += (b - p1) / SS
    }
  }
  return cov
}

/** Baldosa de esquinas redondeadas, con cobertura suavizada. */
function tileCoverage () {
  const cov = new Float32Array(S * S)
  const k = S / U
  const r = TILE_R * k
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      let hits = 0
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const px = x + (sx + 0.5) / SS; const py = y + (sy + 0.5) / SS
          const dx = Math.max(r - px, px - (S - r), 0)
          const dy = Math.max(r - py, py - (S - r), 0)
          if (dx * dx + dy * dy <= r * r) hits++
        }
      }
      cov[y * S + x] = hits / (SS * SS)
    }
  }
  return cov
}

/** Pinta una capa de color sobre el búfer RGBA usando su cobertura. */
function paint (buf, cov, color) {
  for (let i = 0; i < S * S; i++) {
    const a = Math.min(cov[i], 1)
    if (a <= 0) continue
    const o = i * 4
    const dst = buf[o + 3] / 255
    const out = a + dst * (1 - a)
    for (let c = 0; c < 3; c++) {
      buf[o + c] = Math.round((color[c] * a + buf[o + c] * dst * (1 - a)) / out)
    }
    buf[o + 3] = Math.round(out * 255)
  }
}

/**
 * Dibuja el logotipo en un PNG.
 * @param scale  cuánto se encoge respecto al lienzo (1 = tal cual)
 * @param tile   si va la baldosa oscura detrás
 */
function render ({ scale, tile }) {
  const buf = Buffer.alloc(S * S * 4)
  if (tile) paint(buf, tileCoverage(), BG)
  const k = S / U
  for (const l of LOGO) {
    const s = l.s * scale * k
    const tx = (U / 2 + (l.x - U / 2) * scale) * k
    const ty = (U / 2 + (l.y - U / 2) * scale) * k
    paint(buf, coverage(flatten(l.word.d, tx, ty, s)), l.color)
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
for (const [rel, content] of Object.entries(svgs)) {
  fs.writeFileSync(path.join(ROOT, rel), content)
  console.log(rel + ' generado')
}

const pngs = [
  // Icono de la APK: la baldosa oscura con el logotipo encima.
  ['mobile/assets/icon.png', { scale: 1, tile: true }],
  // Adaptativo: Android recorta la forma y pone de fondo el color del
  // app.json, así que aquí solo va el logotipo y encogido a la zona segura.
  ['mobile/assets/adaptive-icon.png', { scale: 0.62, tile: false }],
  // Splash: el logotipo sobre el fondo del app.json.
  ['mobile/assets/splash.png', { scale: 0.78, tile: false }]
]
for (const [rel, opts] of pngs) {
  fs.writeFileSync(path.join(ROOT, rel), toPng(render(opts)))
  console.log(`${rel} generado (${S}x${S})`)
}
