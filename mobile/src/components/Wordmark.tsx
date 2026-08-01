import { Text, type StyleProp, type TextStyle } from "react-native";
import { colors } from "../theme";

/**
 * El logotipo: **VIZ** en blanco y **FITNESS** en el naranja de marca, en
 * mayúsculas, muy grueso y con la letra apretada. Misma construcción que el
 * logotipo de VizPlay, cambiando la palabra y el color de acento.
 *
 * Va en un único sitio para que ninguna pantalla pueda pintarlo distinto.
 */
export default function Wordmark({
  size = 30,
  style,
}: {
  size?: number;
  style?: StyleProp<TextStyle>;
}) {
  return (
    <Text
      style={[
        { fontSize: size, fontWeight: "800", letterSpacing: -0.5, color: "#ffffff" },
        style,
      ]}
    >
      VIZ<Text style={{ color: colors.accent }}>FITNESS</Text>
    </Text>
  );
}
