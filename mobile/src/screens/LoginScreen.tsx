import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme";
import { Button, Card } from "../components/ui";
import Wordmark from "../components/Wordmark";

export default function LoginScreen() {
  const { signInWithGoogle, configured, canSignIn } = useAuth();
  const [busy, setBusy] = useState(false);

  const handleSignIn = async () => {
    setBusy(true);
    try {
      await signInWithGoogle();
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      // El usuario cerró el selector de cuenta: no es un error
      if (!/cancel/i.test(message)) {
        Alert.alert("No se pudo iniciar sesión", message);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 56 }}>💪</Text>
      <Wordmark style={styles.title} />
      <Text style={styles.subtitle}>
        Cardio con GPS en vivo, gimnasio, planes de entrenamiento e importación
        de Strava. Tus datos, sincronizados con la web y todos tus dispositivos.
      </Text>

      {configured && canSignIn ? (
        <Button
          title="Continuar con Google"
          onPress={handleSignIn}
          loading={busy}
          style={{ marginTop: 28, alignSelf: "stretch", paddingVertical: 16 }}
        />
      ) : (
        <Card style={{ marginTop: 28 }}>
          <Text style={{ color: colors.warn, fontWeight: "700" }}>
            ⚠️ Falta configuración
          </Text>
          <Text style={styles.hint}>
            Copia mobile/.env.example como mobile/.env y rellena las claves de
            Firebase y los IDs de cliente de Google. La guía completa está en
            mobile/README.md.
          </Text>
        </Card>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
  },
  title: { marginTop: 10 },
  subtitle: {
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 12,
    lineHeight: 21,
  },
  hint: { color: colors.textFaint, fontSize: 13, lineHeight: 19, marginTop: 6 },
});
