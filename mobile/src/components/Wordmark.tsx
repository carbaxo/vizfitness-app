import { View, type StyleProp, type ViewStyle } from "react-native";
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from "react-native-svg";
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
} from "../lib/wordmark";

/**
 * La marca de VizFitness, con la misma construcción que VizPlay, VizSoccer y
 * VizLessons: una V de dos brazos sobre un cuadrado redondeado con degradado,
 * y el logotipo geométrico partido en dos colores (VIZ en blanco, FITNESS en
 * naranja).
 *
 * La geometría no se escribe aquí: viene de `src/lib/wordmark.ts`, que genera
 * `scripts/make-brand-assets.mjs` a la vez que los iconos, así que es la
 * misma que la del icono del lanzador y que la de la web.
 */

/** El icono: la V de dos brazos sobre la baldosa naranja. */
export function Mark({ size = 32 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${MARK_SIZE} ${MARK_SIZE}`}>
      <Defs>
        <LinearGradient id="vfMark" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={BRAND.gradientFrom} />
          <Stop offset="1" stopColor={BRAND.gradientTo} />
        </LinearGradient>
      </Defs>
      <Rect
        width={MARK_SIZE}
        height={MARK_SIZE}
        rx={MARK_RADIUS}
        fill="url(#vfMark)"
      />
      <Path d={MARK_LEFT} fill="#ffffff" />
      <Path d={MARK_RIGHT} fill={BRAND.arm} />
    </Svg>
  );
}

/** Solo el logotipo: VIZ en blanco y FITNESS en naranja. */
export default function Wordmark({ height = 22 }: { height?: number }) {
  return (
    <Svg
      width={(height * WORDMARK_WIDTH) / WORDMARK_HEIGHT}
      height={height}
      viewBox={`0 0 ${WORDMARK_WIDTH} ${WORDMARK_HEIGHT}`}
    >
      <Path d={WORDMARK_VIZ} fill="#ffffff" />
      <Path d={WORDMARK_NAME} fill={BRAND.orange} />
    </Svg>
  );
}

/** La marca completa: icono + logotipo. */
export function Logo({
  size = 32,
  style,
}: {
  size?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[{ flexDirection: "row", alignItems: "center", gap: 10 }, style]}>
      <Mark size={size} />
      <Wordmark height={size * 0.58} />
    </View>
  );
}
