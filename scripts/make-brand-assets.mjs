// Genera la marca de VizFitness: SVG del logotipo, iconos de la web e
// imágenes de la app Android.
//
// La geometría se CALCULA (no se dibuja a mano) para que la V del icono, la
// del logotipo y las letras salgan con las mismas proporciones. Es el mismo
// método —y los mismos números— que usan VizPlay, VizSoccer y VizLessons,
// para que las apps se lean como una familia: una V de dos brazos sobre un
// cuadrado redondeado con degradado, y un logotipo geométrico partido en dos
// colores (VIZ en blanco, FITNESS en naranja).
//
// Puerto a JavaScript de scripts/logo.py de VizSoccer. Va en Node y sin
// dependencias: los PNG se rasterizan y se empaquetan aquí mismo con zlib,
// así que no hace falta Pillow ni ninguna librería de imagen.
//
// Uso:  node scripts/make-brand-assets.mjs
import zlib from 'node:zlib'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')

// ------------------------------------------------------------------ colores
// El naranja de marca es #FF6F00. El icono va sobre un degradado naranja: uno
// oscuro se pierde en el lanzador entre los demás. El logotipo largo va sobre
// casi negro, porque ahí el naranja necesita fondo oscuro para leerse.
const NARANJA = '#FF6F00'        // color de marca: el "FITNESS" del logotipo
// Los extremos del degradado salen de la misma proporción que en VizSoccer
// (claro ≈ marca x1.35 en el canal medio, oscuro ≈ marca x0.38). El naranja
// tiene el rojo ya a tope, así que el extremo claro se abre hacia el ámbar.
const NARANJA_CLARO = '#FFA31A'  // arranque del degradado del icono
const NARANJA_OSCURO = '#5E2500' // final del degradado del icono
const MELOCOTON = '#FFCB99'      // segundo brazo de la V sobre el degradado
const BLANCO = '#FFFFFF'
const TINTA_CLARA = '#1B120A'    // fondo del logotipo: casi negro con un punto de naranja
const TINTA_OSCURA = '#070403'

const hex = (c) => {
  const s = c.replace('#', '')
  return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16))
}

// ---------------------------------------------------------------- primitivas
const fmt = (v) => {
  const s = v.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')
  return s === '' || s === '-0' ? '0' : s
}
const polyPath = (pts) =>
  'M' + pts.map(([x, y]) => `${fmt(x)},${fmt(y)}`).join(' L') + ' Z'
const rectPts = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]]

// ---------------------------------------------------------------- la marca: V
/**
 * Dos brazos de una V con el corte superior HORIZONTAL (look geométrico).
 * El brazo derecho va en otro tono: es lo que hace que la V se lea también
 * como un vértice.
 */
function vMark (cx, top, height, width, thick) {
  const apex = [cx, top + height]
  const leftOut = [cx - width / 2, top]
  const rightOut = [cx + width / 2, top]
  // Caída vertical equivalente a desplazarse `thick` en horizontal por la
  // misma pendiente: así el vértice interior queda donde toca y el grosor es
  // uniforme.
  const slope = height / (width / 2)
  const inner = [cx, top + height - thick * slope]
  return [
    [leftOut, apex, inner, [leftOut[0] + thick, top]],
    [rightOut, apex, inner, [rightOut[0] - thick, top]]
  ]
}

// ------------------------------------------------------- letras geométricas
/** Letra de trazo recto. Solo hacen falta las de VIZFITNESS. */
function glyph (ch, x, y, w, h, s) {
  const cx = x + w / 2
  const P = []
  if (ch === 'V') {
    const slope = h / (w / 2)
    const apex = [cx, y + h]
    const inner = [cx, y + h - s * slope]
    P.push([[x, y], apex, inner, [x + s, y]])
    P.push([[x + w, y], apex, inner, [x + w - s, y]])
  } else if (ch === 'I') {
    P.push(rectPts(cx - s / 2, y, s, h))
  } else if (ch === 'Z') {
    P.push(rectPts(x, y, w, s))
    P.push(rectPts(x, y + h - s, w, s))
    P.push([[x + w - s, y + s], [x + w, y + s],
      [x + s, y + h - s], [x, y + h - s]])
  } else if (ch === 'S') {
    const medio = y + (h - s) / 2
    P.push(rectPts(x, y, w, s))                         // remate superior
    P.push(rectPts(x, medio, w, s))                     // travesaño central
    P.push(rectPts(x, y + h - s, w, s))                 // remate inferior
    P.push(rectPts(x, y, s, medio - y))                 // vertical izq. arriba
    P.push(rectPts(x + w - s, medio, s, y + h - medio)) // vertical der. abajo
  } else if (ch === 'E') {
    P.push(rectPts(x, y, s, h))
    P.push(rectPts(x, y, w * 0.9, s))
    P.push(rectPts(x, y + (h - s) / 2, w * 0.78, s))
    P.push(rectPts(x, y + h - s, w * 0.9, s))
  } else if (ch === 'F') {
    // Como la E, sin el remate inferior.
    P.push(rectPts(x, y, s, h))
    P.push(rectPts(x, y, w * 0.9, s))
    P.push(rectPts(x, y + (h - s) / 2, w * 0.78, s))
  } else if (ch === 'T') {
    P.push(rectPts(x, y, w, s))
    P.push(rectPts(cx - s / 2, y, s, h))
  } else if (ch === 'N') {
    P.push(rectPts(x, y, s, h))
    P.push(rectPts(x + w - s, y, s, h))
    // Diagonal con el mismo grosor que las astas.
    P.push([[x, y], [x + s, y], [x + w, y + h], [x + w - s, y + h]])
  } else {
    throw new Error('glifo no definido: ' + ch)
  }
  return P
}

/** Logotipo en mayúsculas. Devuelve { trazos, ancho }. */
function wordmark (text, x, y, cap, gap) {
  const w = cap * 0.65
  const s = cap * 0.17
  const out = []
  let cur = x
  for (const ch of text) {
    out.push(...glyph(ch, cur, y, w, cap, s))
    cur += w + gap
  }
  return { trazos: out, ancho: cur - gap - x }
}

/** Como wordmark(), pero parte el color en `corte`. Devuelve [{pts, color}]. */
function wordmarkColores (text, corte, x, y, cap, gap, colorA, colorB) {
  const { trazos, ancho } = wordmark(text, x, y, cap, gap)
  const out = []
  let i = 0
  ;[...text].forEach((ch, k) => {
    const n = glyph(ch, 0, 0, 10, 10, 2).length
    const color = k < corte ? colorA : colorB
    for (const pts of trazos.slice(i, i + n)) out.push({ pts, color })
    i += n
  })
  return { letras: out, ancho }
}

const TEXTO = 'VIZFITNESS'
const CORTE = 3 // VIZ | FITNESS: las tres primeras en blanco
const ANCHO_CAP = TEXTO.length * 0.65 + (TEXTO.length - 1) * 0.22 // ancho / cap

// --------------------------------------------------------------------- SVG
const svg = (w, h, cuerpo, defs = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${fmt(w)} ${fmt(h)}" ` +
  `width="${fmt(w)}" height="${fmt(h)}" role="img">\n${defs}${cuerpo}\n</svg>\n`

const linearDefs = (id, c1, c2) =>
  `  <defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">\n` +
  `    <stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/>\n` +
  '  </linearGradient></defs>\n'

const pathSvg = (pts, fill) => `  <path fill="${fill}" d="${polyPath(pts)}"/>`

/** Icono cuadrado: V de dos tonos sobre el degradado naranja. */
function buildMarkSvg (size = 108, radiusRatio = 0.22, id = 'vf-mark') {
  const [izq, der] = vMark(size / 2, size * 0.315, size * 0.389, size * 0.444, size * 0.12)
  const cuerpo = [
    `  <rect width="${fmt(size)}" height="${fmt(size)}" rx="${fmt(size * radiusRatio)}" fill="url(#${id})"/>`,
    pathSvg(izq, BLANCO),
    pathSvg(der, MELOCOTON)
  ]
  return svg(size, size, cuerpo.join('\n'), linearDefs(id, NARANJA_CLARO, NARANJA_OSCURO))
}

/** Variante recortable: el degradado llega al borde y la V no crece. */
function buildMaskableSvg (size = 108, id = 'vf-maskable') {
  const [izq, der] = vMark(size / 2, size * 0.315, size * 0.389, size * 0.444, size * 0.12)
  const cuerpo = [
    `  <rect width="${fmt(size)}" height="${fmt(size)}" fill="url(#${id})"/>`,
    pathSvg(izq, BLANCO),
    pathSvg(der, MELOCOTON)
  ]
  return svg(size, size, cuerpo.join('\n'), linearDefs(id, NARANJA_CLARO, NARANJA_OSCURO))
}

/** Logotipo completo (320x180): marca + VIZ en blanco y FITNESS en naranja. */
function buildLogoSvg () {
  const BW = 320
  const BH = 180
  const MARGEN = 26
  const HUECO = 20

  const mh = 52 // alto de la V
  const mw = mh * (48 / 42) // mismas proporciones que en el icono
  const my = (BH - mh) / 2

  // El tamaño de las letras se DESPEJA del hueco disponible en vez de fijarlo
  // a ojo, y después el conjunto (marca + logotipo) se CENTRA.
  const libre = BW - 2 * MARGEN - mw - HUECO
  const cap = Math.min(libre / ANCHO_CAP, 26)
  const total = mw + HUECO + cap * ANCHO_CAP
  const x0 = (BW - total) / 2

  const [izq, der] = vMark(x0 + mw / 2, my, mh, mw, 13 * (mh / 42))
  const { letras } = wordmarkColores(TEXTO, CORTE, x0 + mw + HUECO,
    (BH - cap) / 2, cap, cap * 0.22, BLANCO, NARANJA)

  const cuerpo = [
    `  <rect width="${fmt(BW)}" height="${fmt(BH)}" rx="18" fill="url(#vf-logo)"/>`,
    pathSvg(izq, BLANCO),
    pathSvg(der, NARANJA),
    ...letras.map(({ pts, color }) => pathSvg(pts, color))
  ]
  return svg(BW, BH, cuerpo.join('\n'), linearDefs('vf-logo', TINTA_CLARA, TINTA_OSCURA))
}

/** Solo el logotipo, sobre fondo transparente. */
function buildWordmarkSvg () {
  const cap = 26
  const ancho = cap * ANCHO_CAP
  const alto = cap * 1.6
  const { letras } = wordmarkColores(TEXTO, CORTE, 0, (alto - cap) / 2,
    cap, cap * 0.22, 'currentColor', NARANJA)
  return svg(ancho, alto, letras.map(({ pts, color }) => pathSvg(pts, color)).join('\n'))
}

/**
 * Geometría del logotipo para los componentes de React (web y móvil): un `d`
 * por color, para no recalcularla en cada app ni poder desviarse de ella.
 */
function buildWordmarkData () {
  const cap = 26
  const ancho = cap * ANCHO_CAP
  const alto = cap * 1.6
  const { letras } = wordmarkColores(TEXTO, CORTE, 0, (alto - cap) / 2,
    cap, cap * 0.22, 'a', 'b')
  const d = (k) => letras.filter((l) => l.color === k).map((l) => polyPath(l.pts)).join('')
  // La misma V del icono, para que la marca de la barra superior no pueda
  // desviarse de la del lanzador.
  const M = 108
  const [izq, der] = vMark(M / 2, M * 0.315, M * 0.389, M * 0.444, M * 0.12)
  return `// Generado por scripts/make-brand-assets.mjs — no editar a mano.
//
// La marca de VizFitness como trazados: la V de dos brazos y el logotipo con
// VIZ y FITNESS por separado, para poder pintarlos de distinto color. Misma
// geometría que el icono de la app y que el resto de apps Viz.
export const WORDMARK_WIDTH = ${+ancho.toFixed(2)};
export const WORDMARK_HEIGHT = ${+alto.toFixed(2)};
export const WORDMARK_VIZ = "${d('a')}";
export const WORDMARK_NAME = "${d('b')}";

export const MARK_SIZE = ${M};
export const MARK_RADIUS = ${+(M * 0.22).toFixed(2)};
export const MARK_LEFT = "${polyPath(izq)}";
export const MARK_RIGHT = "${polyPath(der)}";

/** Colores de la marca (los mismos que usa el generador). */
export const BRAND = {
  orange: "${NARANJA}",
  gradientFrom: "${NARANJA_CLARO}",
  gradientTo: "${NARANJA_OSCURO}",
  arm: "${MELOCOTON}",
} as const;
`
}

// ============================================================ rasterizado
const S = 1024 // tamaño de los PNG
const SS = 4 // sub-filas por píxel (en horizontal la cobertura es exacta)

/**
 * Cobertura (0..1) de unos polígonos en cada píxel, con la regla non-zero.
 * En horizontal se mide el trozo exacto de píxel que cubre cada tramo y en
 * vertical se toman SS muestras: borde limpio y sin dependencias.
 */
function coverage (polys) {
  const cov = new Float32Array(S * S)
  const edges = []
  for (const poly of polys) {
    for (let i = 0; i < poly.length; i++) {
      const [x0, y0] = poly[i]
      const [x1, y1] = poly[(i + 1) % poly.length]
      if (y0 !== y1) edges.push({ x0, y0, x1, y1, dir: y1 > y0 ? 1 : -1 })
    }
  }
  if (!edges.length) return cov
  for (let row = 0; row < S * SS; row++) {
    const y = (row + 0.5) / SS
    const xs = []
    for (const e of edges) {
      if (y < Math.min(e.y0, e.y1) || y >= Math.max(e.y0, e.y1)) continue
      xs.push({ x: e.x0 + ((y - e.y0) / (e.y1 - e.y0)) * (e.x1 - e.x0), dir: e.dir })
    }
    if (xs.length < 2) continue
    xs.sort((a, b) => a.x - b.x)
    let wind = 0
    const base = Math.floor(row / SS) * S
    for (let i = 0; i + 1 < xs.length; i++) {
      wind += xs[i].dir
      if (wind === 0) continue
      let a = xs[i].x
      let b = xs[i + 1].x
      if (b <= 0 || a >= S) continue
      a = Math.max(a, 0); b = Math.min(b, S)
      const p0 = Math.floor(a)
      const p1 = Math.floor(b - 1e-9)
      if (p0 === p1) { cov[base + p0] += (b - a) / SS; continue }
      cov[base + p0] += (p0 + 1 - a) / SS
      for (let p = p0 + 1; p < p1; p++) cov[base + p] += 1 / SS
      cov[base + p1] += (b - p1) / SS
    }
  }
  return cov
}

/** Cuadrado de esquinas redondeadas (o el lienzo entero si radio = 0). */
function tileCoverage (radius) {
  const cov = new Float32Array(S * S)
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      if (radius <= 0) { cov[y * S + x] = 1; continue }
      let hits = 0
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const px = x + (sx + 0.5) / SS
          const py = y + (sy + 0.5) / SS
          const dx = Math.max(radius - px, px - (S - radius), 0)
          const dy = Math.max(radius - py, py - (S - radius), 0)
          if (dx * dx + dy * dy <= radius * radius) hits++
        }
      }
      cov[y * S + x] = hits / (SS * SS)
    }
  }
  return cov
}

/** Pinta una capa sobre el búfer RGBA. `color` puede ser [c1, c2] (degradado). */
function paint (buf, cov, color) {
  const grad = Array.isArray(color[0])
  const [a, b] = grad ? color : [color, color]
  for (let i = 0; i < S * S; i++) {
    const alpha = Math.min(cov[i], 1)
    if (alpha <= 0) continue
    // Degradado en diagonal, igual que el `linearGradient` de los SVG
    const t = grad ? ((i % S) + Math.floor(i / S)) / (2 * (S - 1)) : 0
    const o = i * 4
    const dst = buf[o + 3] / 255
    const out = alpha + dst * (1 - alpha)
    for (let c = 0; c < 3; c++) {
      const src = a[c] + (b[c] - a[c]) * t
      buf[o + c] = Math.round((src * alpha + buf[o + c] * dst * (1 - alpha)) / out)
    }
    buf[o + 3] = Math.round(out * 255)
  }
}

/**
 * Dibuja un icono.
 * @param tile   'redondeado' | 'sangre' | null (sin fondo)
 * @param k      cuánto crece la V (1 = proporciones del icono adaptativo)
 * @param glifo  si se pinta la V
 */
function render ({ tile, k = 1, glifo = true }) {
  const buf = Buffer.alloc(S * S * 4)
  if (tile) {
    paint(buf, tileCoverage(tile === 'redondeado' ? S * 0.22 : 0),
      [hex(NARANJA_CLARO), hex(NARANJA_OSCURO)])
  }
  if (glifo) {
    const [izq, der] = vMark(S / 2, S * (0.5 - 0.185 * k), S * 0.389 * k,
      S * 0.444 * k, S * 0.12 * k)
    paint(buf, coverage([izq]), hex(BLANCO))
    paint(buf, coverage([der]), hex(MELOCOTON))
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
fs.mkdirSync(path.join(ROOT, 'brand'), { recursive: true })

const textos = {
  // La marca, para documentación y para quien la necesite suelta
  'brand/logo.svg': buildLogoSvg(),
  'brand/logo-mark.svg': buildMarkSvg(),
  'brand/logo-wordmark.svg': buildWordmarkSvg(),
  // Iconos de la web / PWA
  'public/icon.svg': buildMarkSvg(),
  'public/icon-maskable.svg': buildMaskableSvg(),
  // Geometría del logotipo para los componentes de React
  'src/lib/wordmark.ts': buildWordmarkData(),
  'mobile/src/lib/wordmark.ts': buildWordmarkData()
}
for (const [rel, contenido] of Object.entries(textos)) {
  fs.writeFileSync(path.join(ROOT, rel), contenido)
  console.log(rel + ' generado')
}

const pngs = [
  // Icono de la APK: cuadrado redondeado, la V puede crecer.
  ['mobile/assets/icon.png', { tile: 'redondeado', k: 1.22 }],
  // Adaptativo: Android recorta hasta el 80 %, así que la V se queda en las
  // proporciones del icono adaptativo y el fondo va en su propia capa.
  ['mobile/assets/adaptive-icon.png', { tile: null, k: 1 }],
  ['mobile/assets/adaptive-icon-bg.png', { tile: 'sangre', glifo: false }],
  // Splash: la marca entera sobre el fondo oscuro del app.json.
  ['mobile/assets/splash.png', { tile: 'redondeado', k: 1.22 }]
]
for (const [rel, opts] of pngs) {
  fs.writeFileSync(path.join(ROOT, rel), toPng(render(opts)))
  console.log(`${rel} generado (${S}x${S})`)
}
