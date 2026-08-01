import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import type { ReactNode } from "react";
import { colors } from "../theme";

export function Card({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  disabled,
  loading,
  style,
}: {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.btn,
        variant === "primary" && styles.btnPrimary,
        variant === "secondary" && styles.btnSecondary,
        variant === "danger" && styles.btnDanger,
        (disabled || loading) && { opacity: 0.4 },
        pressed && { opacity: 0.75 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? colors.bg : colors.text} />
      ) : (
        <Text
          style={[
            styles.btnText,
            variant === "primary" ? { color: colors.bg } : { color: colors.text },
            variant === "danger" && { color: colors.danger },
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

export function Stat({
  label,
  value,
  color = colors.accent,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <View style={{ alignItems: "center", flex: 1 }}>
      <Text style={{ color: colors.textMuted, fontSize: 11, textTransform: "uppercase", fontWeight: "600" }}>
        {label}
      </Text>
      <Text style={{ color, fontSize: 22, fontWeight: "800", marginTop: 2 }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  btn: {
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPrimary: { backgroundColor: colors.accent },
  btnSecondary: {
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  btnDanger: {
    backgroundColor: "rgba(244,104,94,0.10)",
    borderWidth: 1,
    borderColor: "rgba(244,104,94,0.45)",
  },
  btnText: { fontWeight: "700", fontSize: 15 },
});
