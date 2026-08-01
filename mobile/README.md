# 📱 VizFitness — App Android

App nativa de Android (React Native + Expo) que comparte cuenta y datos con
la versión web: inicias sesión con la misma cuenta de Google y todo se
sincroniza en tiempo real vía Firestore.

## ✨ Qué hace la app

- **🛰️ Cardio con GPS en vivo, también en segundo plano** — graba tu ruta
  mientras corres o pedaleas: distancia, tiempo y ritmo en directo, con
  filtrado de señal (descarta lecturas imprecisas y saltos de GPS),
  pausa/reanudación y trazado del recorrido. La grabación **sigue funcionando
  con la pantalla apagada o la app minimizada** gracias a un servicio en
  primer plano de Android (verás una notificación persistente durante la
  actividad), y la sesión se restaura intacta si Android llega a matar la
  app. Al guardar, la actividad aparece al instante en la web.

  Incluye **autopausa opcional** (interruptor en la pantalla de GPS, la
  preferencia se recuerda): si te paras más de 5 segundos —un semáforo, un
  descanso— el cronómetro se pausa solo y se reanuda al detectar movimiento,
  con histéresis de velocidad para no oscilar. El tiempo parado no cuenta
  para el ritmo.

  > Para grabar con la pantalla apagada, Android pedirá el permiso de
  > ubicación **«Permitir siempre»**. Si solo concedes «mientras se usa», la
  > app lo detecta y graba únicamente con la app en pantalla.
- **⌚ Importación desde tu reloj o pulsera (Health Connect)** — Xiaomi,
  Amazfit, Samsung, Garmin… Cualquier reloj cuya app sincronice con Health
  Connect (el puente oficial de salud de Android). Se importan las sesiones
  de ejercicio con distancia, tiempo, pulsaciones medias, calorías y la ruta
  GPS cuando el reloj la registró, deduplicadas por su ID de sesión.

  **Con un reloj Xiaomi**: en la app **Mi Fitness**, ve a Perfil → Ajustes →
  Health Connect y activa la sincronización de ejercicio. Después, en la
  pestaña ⌚ Reloj de esta app: conectar → conceder permisos → importar.
  (Alternativa: vincula Mi Fitness con Strava y usa la pestaña Strava; usa
  solo una de las dos vías para no duplicar.)

  > Health Connect requiere Android 8+ y la app «Salud Conectada» de Google
  > Play (integrada en el sistema desde Android 14). Funciona en la APK /
  > dev build, no en Expo Go.

- **🔗 Importación desde Strava (API oficial)** — ⚠️ desde el 30 de junio de
  2026 Strava exige una suscripción de pago activa para usar su API; sin
  ella, usa la importación GPX de la web (Perfil → Importar archivos GPX) o
  la vía del reloj, que cubren lo mismo gratis. Si tienes suscripción:
  conecta tu cuenta con OAuth
  e importa hasta tus últimas 200 actividades con distancia, tiempo,
  frecuencia cardiaca, desnivel y el trazado de la ruta. Las actividades ya
  importadas se detectan por su ID y no se duplican. Los tokens se guardan
  cifrados en el dispositivo (SecureStore) y se refrescan solos al caducar.
- **🗺️ Mapas reales** — las rutas (grabadas o importadas) se muestran sobre
  un mapa de OpenStreetMap, sin claves de API ni servicios de pago. El zoom
  se ajusta solo para encuadrar el recorrido y el mapa también se ve en vivo
  mientras grabas.
- **🏠 Inicio** — resumen semanal/mensual y tus últimos entrenamientos
  (también los registrados desde la web), con vista de la ruta en el mapa.
- **👤 Perfil** — cuenta, estadísticas y cierre de sesión.

El registro detallado de gimnasio, los planes, las gráficas y los objetivos
viven en la web (que también puedes instalar como PWA); esta app se centra en
lo que solo un móvil puede hacer: GPS e importación cómoda.

## 🚀 Puesta en marcha

> ⚠️ **La app cambió de identificador**: antes era `com.rcv.tracker` y ahora es
> `com.viz.fitness` (y el esquema de enlaces pasó de `rcvtracker` a
> `vizfitness`). Para Android es una app **nueva**, así que:
>
> - hay que **desinstalar** la versión anterior antes de instalar la nueva;
> - hay que crear un **cliente OAuth de Android nuevo** en Google Cloud con el
>   paquete `com.viz.fitness` y la misma SHA-1, y actualizar el secreto
>   `GOOGLE_ANDROID_CLIENT_ID` (si no, el botón de Google no funcionará);
> - hay que cambiar el "Authorization Callback Domain" de la app de Strava a
>   `vizfitness`.
>
> Los datos no se pierden: viven en Firestore ligados a la cuenta de Google, y
> el proyecto de Firebase es el mismo.

### 1. Variables de entorno

```bash
cd mobile
npm install
cp .env.example .env
```

Rellena en `.env`:

1. **Firebase**: los mismos 6 valores que usa la web (README raíz, paso 2),
   con prefijo `EXPO_PUBLIC_FIREBASE_*`.
2. **Google Sign-In**: en
   [Google Cloud Console → Credenciales](https://console.cloud.google.com/apis/credentials)
   (el proyecto se llama igual que tu proyecto de Firebase):
   - `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`: el cliente OAuth de tipo **Web** que
     Firebase creó automáticamente al habilitar Google en Authentication.
   - `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`: crea un cliente OAuth de tipo
     **Android** con el paquete `com.viz.fitness` y la huella **SHA-1** de tu
     keystore (`cd android && ./gradlew signingReport`, o la que te da EAS).
3. **Strava**: crea una app gratuita en
   [strava.com/settings/api](https://www.strava.com/settings/api) y copia
   `EXPO_PUBLIC_STRAVA_CLIENT_ID` y `EXPO_PUBLIC_STRAVA_CLIENT_SECRET`. En
   "Authorization Callback Domain" pon `vizfitness` (el esquema de la app).

### 2. Ejecutar en desarrollo

```bash
npx expo run:android        # con un emulador o móvil por USB
```

### 3. Generar la APK

**Opción A — GitHub Actions (recomendada, sin instalar nada):** el
repositorio incluye el workflow
[`.github/workflows/android-apk.yml`](../.github/workflows/android-apk.yml)
que compila la APK en GitHub.

1. En GitHub: **Settings → Secrets and variables → Actions** y crea los
   secretos `GOOGLE_ANDROID_CLIENT_ID`, `STRAVA_CLIENT_ID`,
   `STRAVA_CLIENT_SECRET` y `ANDROID_KEYSTORE_BASE64`. (La configuración
   de Firebase y el ID de cliente web de Google del proyecto
   `rcv-tracker` ya van incluidos en el código; sus secretos solo hacen
   falta para apuntar a otro proyecto.)
2. Pestaña **Actions → Compilar APK de Android → Run workflow**.
3. Al terminar, descarga la APK desde **Artifacts** e instálala en el móvil.

La primera ejecución genera además el **keystore de firma** y muestra su
**SHA-1** en el resumen del run: esa huella es la que debes registrar en el
cliente OAuth de Android de Google (paso 1.2). Guarda el keystore como
secreto `ANDROID_KEYSTORE_BASE64` (instrucciones en el propio resumen) para
que todas las APKs futuras se firmen igual.

**Opción B — [EAS Build](https://docs.expo.dev/build/setup/)** (compila en
la nube de Expo, no necesitas Android Studio):

```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview   # genera una APK instalable
```

**Opción C — local**, si tienes el SDK de Android:

```bash
npx expo prebuild -p android
cd android && ./gradlew assembleRelease
# APK en android/app/build/outputs/apk/release/
```

> **Importante:** el inicio de sesión con Google en la APK requiere que el
> cliente OAuth de Android tenga la SHA-1 del keystore con el que se firma
> esa APK (EAS te la muestra con `eas credentials`).

## 🧱 Estructura

```
mobile/
├── App.tsx                  # Navegación por pestañas + proveedor de sesión
├── src/
│   ├── context/AuthContext.tsx   # Google Sign-In → Firebase (misma cuenta que la web)
│   ├── lib/
│   │   ├── firebase.ts      # Firebase con persistencia de sesión en el dispositivo
│   │   ├── db.ts            # Firestore en tiempo real (users/{uid}/workouts)
│   │   ├── strava.ts        # OAuth + API de Strava, refresco de tokens, mapeo
│   │   ├── geo.ts           # Haversine, decodificador de polylines, ritmo
│   │   └── types.ts         # Modelo de datos compartido con la web
│   ├── screens/             # Inicio, GPS, Strava, Perfil, Login
│   ├── components/          # RouteTrace (SVG), UI base, logotipo
│   └── theme.ts             # Paleta de VizFitness (la misma que la web)
├── assets/                  # Iconos de la app (ver abajo)
└── app.json                 # Config Expo (permisos de ubicación, esquema OAuth)
```

## 🎨 Iconos

El icono es la **marca de la familia Viz**: la V de dos brazos sobre el
cuadrado redondeado con degradado, igual que VizPlay, VizSoccer y VizLessons,
pero en naranja.

Los PNG de `assets/` no se dibujan a mano: los genera, junto con los iconos de
la web, un único script sin dependencias en la raíz del repositorio:

```bash
node ../scripts/make-brand-assets.mjs
```

Produce `icon.png` (la baldosa con la V), `adaptive-icon.png` y
`adaptive-icon-bg.png` (las dos capas del icono adaptativo: la V encogida a la
zona segura y el degradado a sangre, que es lo que permite que el icono
adaptativo lleve degradado y no un color plano) y `splash.png`. Ver el apartado
de marca del [README raíz](../README.md#-marca-y-paleta).
