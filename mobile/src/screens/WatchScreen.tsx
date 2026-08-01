import { useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text } from "react-native";
import { useAuth } from "../context/AuthContext";
import { addWorkout, useWorkouts } from "../lib/db";
import {
  connectHealthConnect,
  healthConnectModuleAvailable,
  readWorkoutsFromHealthConnect,
} from "../lib/healthconnect";
import { colors } from "../theme";
import { Button, Card } from "../components/ui";

export default function WatchScreen() {
  const { user } = useAuth();
  const { data: workouts } = useWorkouts();
  const [connected, setConnected] = useState(false);
  const [busy, setBusy] = useState(false);
  const [importing, setImporting] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);

  const moduleOk = healthConnectModuleAvailable();

  const existingIds = useMemo(
    () =>
      new Set(
        workouts
          .map((w) => w.healthConnectId)
          .filter((id): id is string => Boolean(id))
      ),
    [workouts]
  );

  const connect = async () => {
    setBusy(true);
    try {
      const status = await connectHealthConnect();
      if (status === "ok") {
        setConnected(true);
      } else if (status === "unavailable") {
        Alert.alert(
          "Health Connect no disponible",
          "Instala o actualiza la app «Salud Conectada» (Health Connect) desde Google Play. En Android 14+ ya viene integrada en Ajustes."
        );
      }
    } finally {
      setBusy(false);
    }
  };

  const importSessions = async () => {
    if (!user) return;
    setImporting(true);
    setLastResult(null);
    try {
      const result = await readWorkoutsFromHealthConnect(existingIds);
      for (const w of result.imported) {
        await addWorkout(user.uid, w);
      }
      setLastResult(
        `✅ ${result.imported.length} entrenamientos importados` +
          (result.skippedExisting ? ` · ${result.skippedExisting} ya existían` : "") +
          (result.skippedUnsupported
            ? ` · ${result.skippedUnsupported} sin datos útiles`
            : "")
      );
    } catch (e) {
      console.error(e);
      Alert.alert(
        "Error",
        "No se pudieron leer los entrenamientos. ¿Concediste los permisos en Health Connect?"
      );
    } finally {
      setImporting(false);
    }
  };

  const fromWatch = workouts.filter((w) => w.healthConnectId).length;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 16, gap: 14 }}
    >
      <Text style={styles.title}>⌚ Reloj / pulsera</Text>

      <Card>
        <Text style={{ color: colors.text, fontSize: 15, lineHeight: 22 }}>
          Importa los entrenamientos de tu reloj o pulsera (Xiaomi, Amazfit,
          Samsung, Garmin…) a través de <Text style={{ fontWeight: "700" }}>Health Connect</Text>,
          el puente oficial de Android: distancia, tiempo, pulsaciones,
          calorías y la ruta cuando el reloj la registró.
        </Text>
      </Card>

      <Card>
        <Text style={{ color: colors.text, fontWeight: "700", marginBottom: 6 }}>
          Preparación (una sola vez, con reloj Xiaomi)
        </Text>
        <Text style={styles.step}>
          1. En <Text style={{ fontWeight: "700" }}>Mi Fitness</Text>: Perfil →
          Ajustes → Health Connect y activa la sincronización de ejercicio.
        </Text>
        <Text style={styles.step}>
          2. Sal a correr con el reloj y sincroniza Mi Fitness como siempre.
        </Text>
        <Text style={styles.step}>
          3. Vuelve aquí, conecta y pulsa importar. Las sesiones ya importadas
          no se duplican.
        </Text>
      </Card>

      {!moduleOk ? (
        <Card>
          <Text style={{ color: colors.warn, fontWeight: "700" }}>
            ⚠️ Disponible solo en la APK
          </Text>
          <Text style={styles.hint}>
            Health Connect usa un módulo nativo que no existe en Expo Go.
            Genera la APK (eas build) o usa `expo run:android` y esta pestaña
            funcionará.
          </Text>
        </Card>
      ) : !connected ? (
        <Button
          title="Conectar con Health Connect"
          onPress={connect}
          loading={busy}
          style={{ paddingVertical: 16 }}
        />
      ) : (
        <>
          <Card>
            <Text style={{ color: colors.accent, fontWeight: "700" }}>
              ✓ Conectado a Health Connect
            </Text>
            <Text style={styles.hint}>
              Se importan las sesiones de los últimos 90 días (máx. 60 por
              pasada).
            </Text>
            {fromWatch > 0 && (
              <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 6 }}>
                {fromWatch} entrenamientos del reloj en tu cuenta
              </Text>
            )}
          </Card>
          <Button
            title="⬇️  Importar del reloj"
            onPress={importSessions}
            loading={importing}
            style={{ paddingVertical: 16 }}
          />
          {lastResult && (
            <Card>
              <Text style={{ color: colors.text }}>{lastResult}</Text>
            </Card>
          )}
        </>
      )}

      <Card>
        <Text style={{ color: colors.text, fontWeight: "700", marginBottom: 6 }}>
          💡 Alternativa: vía Strava
        </Text>
        <Text style={{ color: colors.textMuted, fontSize: 13, lineHeight: 19 }}>
          Mi Fitness también puede enlazarse con Strava (Perfil → Ajustes →
          Vincular cuentas). Tus carreras subirán solas a Strava y podrás
          importarlas desde la pestaña 🔗 Strava. Usa una sola de las dos vías
          para no duplicar actividades.
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 22, fontWeight: "800" },
  step: { color: colors.textMuted, fontSize: 13, lineHeight: 20, marginTop: 4 },
  hint: { color: colors.textFaint, fontSize: 13, lineHeight: 19, marginTop: 6 },
});
