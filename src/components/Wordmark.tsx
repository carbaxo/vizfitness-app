import {
  BRAND,
  MARK_LEFT,
  MARK_RADIUS,
  MARK_RIGHT,
  MARK_SIZE,
  WORDMARK_HEIGHT,
  WORDMARK_NAME,
  WORDMARK_VIZ,
  WORDMARK_WIDTH,
} from "@/lib/wordmark";

/**
 * La marca de VizFitness, con la misma construcción que VizPlay, VizSoccer y
 * VizLessons: una V de dos brazos sobre un cuadrado redondeado con degradado,
 * y el logotipo geométrico partido en dos colores (VIZ en blanco, FITNESS en
 * naranja).
 *
 * La geometría no se escribe aquí: viene de `src/lib/wordmark.ts`, que genera
 * `scripts/make-brand-assets.mjs` a la vez que los iconos. Así el logotipo de
 * la barra superior y el del lanzador no pueden acabar siendo distintos.
 */

/** El icono: la V de dos brazos sobre la baldosa naranja. */
export function Mark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${MARK_SIZE} ${MARK_SIZE}`}
      aria-hidden
      className="shrink-0"
    >
      <defs>
        <linearGradient id="vf-mark-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={BRAND.gradientFrom} />
          <stop offset="1" stopColor={BRAND.gradientTo} />
        </linearGradient>
      </defs>
      <rect
        width={MARK_SIZE}
        height={MARK_SIZE}
        rx={MARK_RADIUS}
        fill="url(#vf-mark-grad)"
      />
      <path d={MARK_LEFT} fill="#ffffff" />
      <path d={MARK_RIGHT} fill={BRAND.arm} />
    </svg>
  );
}

/** Solo el logotipo: VIZ en blanco y FITNESS en naranja. */
export default function Wordmark({ height = 16 }: { height?: number }) {
  return (
    <svg
      width={(height * WORDMARK_WIDTH) / WORDMARK_HEIGHT}
      height={height}
      viewBox={`0 0 ${WORDMARK_WIDTH} ${WORDMARK_HEIGHT}`}
      role="img"
      aria-label="VizFitness"
      className="shrink-0"
    >
      <path d={WORDMARK_VIZ} fill="#ffffff" />
      <path d={WORDMARK_NAME} fill={BRAND.orange} />
    </svg>
  );
}

/** La marca completa: icono + logotipo, que es como va en la cabecera. */
export function Logo({ size = 28 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <Mark size={size} />
      <Wordmark height={size * 0.58} />
    </div>
  );
}
