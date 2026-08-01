import { useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { AuthRequest, makeRedirectUri } from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { useAuth } from "../context/AuthContext";
import { addWorkout, useWorkouts } from "../lib/db";
import {
  STRAVA_CLIENT_ID,
  STRAVA_DISCOVERY,
  activityToWorkout,
  disconnectStrava,
  exchangeCode,
  fetchActivities,
  getStoredTokens,
  stravaConfigured,
} from "../lib/strava";
import { colors } from "../theme";
import { Button, Card } from "../components/ui";

WebBrowser.maybeCompleteAuthSession();

export default function StravaScreen() {
  const { user } = useAuth();
  const { data: workouts } = useWorkouts();
  const [connected, setConnected] = useState(false);
  const [athleteName, setAthleteName] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const [importing, setImporting] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);

  const existingStravaIds = useMemo(
    () => new Set(workouts.filter((w) => w.stravaId).map((w) => w.stravaId)),
    [workouts]
  );

  useEffect(() => {
    getStoredTokens().then((t) => {
      setConnected(Boolean(t));
      setAthleteName(t?.athleteName);
    });
  }, []);

  const connect = async () => {
    setBusy(true);
    try {
      const redirectUri = makeRedirectUri({ scheme: "vizfitness" });
      const request = new AuthRequest({
        clientId: STRAVA_CLIENT_ID,
        scopes: ["activity:read_all"],
        redirectUri,
        responseType: "code",
        usePKCE: false,
        extraParams: { approval_prompt: "auto" },
      });
      const result = await request.promptAsync(STRAVA_DISCOVERY);
      if (result.type === "success" && result.params.code) {
        const tokens = await exchangeCode(result.params.code);
        setConnected(true);
        setAthleteName(tokens.athleteName);
      } else if (result.type === "error") {
        Alert.alert("Error", "Strava rechazó la autorización.");
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "No se pudo conectar con Strava. Revisa la configuración.");
    } finally {
      setBusy(false);
    }
  };

  const disconnect = async () => {
    await disconnectStrava();
    setConnected(false);
    setAthleteName(undefined);
    setLastResult(null);
  };

  const importActivities = async () => {
    if (!user) return;
    setImporting(true);
    setLastResult(null);
    try {
      let imported = 0;
      let skipped = 0;
      let unsupported = 0;
      // Recorremos hasta 4 páginas (200 actividades más recientes)
      for (let page = 1; page <= 4; page++) {
        const activities = await fetchActivities(50, page);
        if (activities.length === 0) break;
        for (const a of activities) {
          if (existingStravaIds.has(a.id)) {
            skipped++;
            continue;
          }
          const workout = activityToWorkout(a);
          if (!workout) {
            unsupported++;
            continue;
          }
          await addWorkout(user.uid, workout);
          existingStravaIds.add(a.id);
          imported++;
        }
        if (activities.length < 50) break;
      }
      setLastResult(
        `✅ ${imported} actividades importadas` +
          (skipped ? ` · ${skipped} ya existían` : "") +
          (unsupported ? ` · ${unsupported} sin datos` : "")
      );
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Falló la importación. ¿Sigue autorizada la app en Strava?");
    } finally {
      setImporting(false);
    }
  };

  const importedCount = workouts.filter((w) => w.stravaId).length;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 16, gap: 14 }}
    >
      <Text style={styles.title}>🔗 Importar de Strava</Text>

      {!stravaConfigured ? (
        <Card>
          <Text style={{ color: colors.warn, fontWeight: "700" }}>
            ⚠️ Strava no está configurado
          </Text>
          <Text style={styles.hint}>
            Crea una app gratuita en strava.com/settings/api y añade{" "}
            EXPO_PUBLIC_STRAVA_CLIENT_ID y EXPO_PUBLIC_STRAVA_CLIENT_SECRET al
            archivo .env (ver mobile/README.md).
          </Text>
        </Card>
      ) : !connected ? (
        <>
          <Card>
            <Text style={{ color: colors.text, fontSize: 15, lineHeight: 22 }}>
              Conecta tu cuenta de Strava para importar tus actividades —
              carreras, rutas en bici, caminatas… — con su distancia, tiempo,
              frecuencia cardiaca, desnivel y el trazado del recorrido.
            </Text>
          </Card>
          <Button
            title="Conectar con Strava"
            onPress={connect}
            loading={busy}
            style={{ backgroundColor: "#fc4c02", paddingVertical: 16 }}
          />
        </>
      ) : (
        <>
          <Card>
            <Text style={{ color: colors.accent, fontWeight: "700" }}>
              ✓ Conectado a Strava{athleteName ? ` como ${athleteName}` : ""}
            </Text>
            <Text style={styles.hint}>
              Se importan tus últimas 200 actividades como máximo por pasada. Las
              ya importadas se detectan y no se duplican.
            </Text>
            {importedCount > 0 && (
              <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 6 }}>
                {importedCount} actividades de Strava en tu cuenta
              </Text>
            )}
          </Card>

          <Button
            title="⬇️  Importar actividades"
            onPress={importActivities}
            loading={importing}
            style={{ paddingVertical: 16 }}
          />

          {lastResult && (
            <Card>
              <Text style={{ color: colors.text }}>{lastResult}</Text>
            </Card>
          )}

          <Button title="Desconectar Strava" variant="danger" onPress={disconnect} />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 22, fontWeight: "800" },
  hint: { color: colors.textFaint, fontSize: 13, lineHeight: 19, marginTop: 6 },
});
