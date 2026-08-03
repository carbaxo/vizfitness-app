# VizFitness

Aplicación de seguimiento de entrenamiento estilo Strava, pero completa:
**cardio + gimnasio + planes de entrenamiento**, con inicio de sesión con
Google y sincronización automática de tus datos entre todos tus dispositivos.

El proyecto tiene dos aplicaciones que comparten cuenta y datos:

- **Web (PWA)** — este directorio. Toda la funcionalidad: gimnasio, planes,
  gráficas, récords, objetivos…
- **📱 App Android** — [`mobile/`](./mobile). Nativa (React Native + Expo),
  con **rutas GPS en vivo** para cardio (también con la pantalla apagada,
  mediante un servicio en segundo plano), **importación desde Strava** vía
  su API oficial e **importación desde tu reloj o pulsera** (Xiaomi, Amazfit,
  Samsung, Garmin…) vía Health Connect. Ver
  [mobile/README.md](./mobile/README.md).

## ✨ Funcionalidades

- **🔐 Inicio de sesión con Google** — un clic y dentro; sin contraseñas.
- **☁️ Sincronización entre dispositivos** — tus datos viven en Firestore y se
  actualizan en tiempo real en el móvil, la tablet y el ordenador. Funciona
  también sin conexión y sincroniza al volver la red.
- **🏃 Cardio** — registra carrera, bici, natación, senderismo, remo y más,
  con distancia, duración, ritmo medio calculado automáticamente, frecuencia
  cardiaca, desnivel y calorías.
- **🏋️ Gimnasio** — sesión en vivo con cronómetro, series con peso y
  repeticiones, temporizador de descanso con aviso sonoro y vibración, y
  volumen total de la sesión.
- **🗓️ Planes de entrenamiento** — crea tu rutina semanal (días de gimnasio,
  cardio y descanso) e inicia cada sesión con un toque: los ejercicios y las
  series se precargan solos.
- **📚 Biblioteca de ejercicios** — más de 40 ejercicios organizados por grupo
  muscular con notas de técnica, más tus ejercicios personalizados.
- **📈 Progreso** — gráficas de volumen semanal, evolución de peso y 1RM
  estimado por ejercicio, y kilómetros de cardio.
- **🗺️ Rutas sobre mapa real** — las actividades con GPS (grabadas con la
  app Android o importadas) muestran su recorrido sobre un mapa de
  OpenStreetMap, sin claves de API.
- **📁 Importación de archivos GPX** — en Perfil: sube uno o varios `.gpx`
  (exportación gratuita de Strava, Garmin, cualquier reloj) y se importan
  con ruta, distancia, tiempo, pulsaciones y desnivel, sin duplicados. No
  requiere la API de Strava (que desde junio de 2026 exige suscripción).
- **🏆 Récords personales** — tus mejores marcas se detectan automáticamente.
- **🎯 Objetivos** — metas de distancia mensual, sesiones semanales, peso en
  un ejercicio o peso corporal, con barra de progreso en el panel.
- **⚖️ Peso corporal** — registro diario con historial.
- **🧮 Calculadora de 1RM** — estima tu repetición máxima (fórmula de Epley).
- **📦 Exportación de datos** — descarga todos tus datos en JSON cuando quieras.
- **📱 PWA** — instálala en el móvil desde el navegador ("Añadir a pantalla de
  inicio") y úsala como una app nativa.
- **🌙 Interfaz oscura en español**, pensada para usarse con una mano en el
  gimnasio.

## 🚀 Puesta en marcha

### 1. Requisitos

- Node.js 18 o superior
- Una cuenta de Google (gratuita) para Firebase

### 2. Crear el proyecto de Firebase (5 minutos)

1. Entra en [console.firebase.google.com](https://console.firebase.google.com)
   y pulsa **Añadir proyecto** (el plan gratuito Spark es suficiente).
2. En el proyecto, ve a **Compilación → Authentication → Comenzar** y, en la
   pestaña **Sign-in method**, habilita **Google**.
3. Ve a **Compilación → Firestore Database → Crear base de datos** (modo
   producción, la región que prefieras).
4. En la pestaña **Reglas** de Firestore, pega el contenido del archivo
   [`firestore.rules`](./firestore.rules) de este repositorio y publica. Esto
   garantiza que cada usuario solo pueda leer y escribir sus propios datos.
5. Ve a **Configuración del proyecto (⚙️) → General → Tus apps → Web (`</>`)**,
   registra la app y copia el objeto de configuración.

### 3. Configurar y arrancar la aplicación

```bash
git clone https://github.com/carbaxo/rcv_tracker.git
cd rcv_tracker
npm install
npm run dev
```

> La configuración del proyecto Firebase `rcv-tracker` ya va incluida en
> `src/lib/firebase.ts` (son identificadores públicos; la seguridad la ponen
> las reglas de Firestore). Si quieres usar otro proyecto de Firebase, copia
> `.env.example` como `.env.local` y pon ahí tus claves: tienen prioridad
> sobre las incluidas.

Abre [http://localhost:3000](http://localhost:3000) e inicia sesión con Google.

> **Nota:** para usar la app desde otros dispositivos, añade tu dominio de
> despliegue en Firebase: **Authentication → Settings → Authorized domains**.

### 4. Desplegar (opcional, gratis)

La forma más sencilla es [Vercel](https://vercel.com):

1. Importa el repositorio en Vercel.
2. Añade las 6 variables `NEXT_PUBLIC_FIREBASE_*` en **Settings →
   Environment Variables**.
3. Despliega y añade el dominio `*.vercel.app` a los dominios autorizados de
   Firebase Authentication.

También funciona en Netlify, Firebase Hosting o cualquier plataforma que
soporte Next.js.

## 🧱 Tecnologías

| Capa | Tecnología |
| --- | --- |
| Framework | [Next.js 14](https://nextjs.org) (App Router) + React 18 + TypeScript |
| Estilos | [Tailwind CSS](https://tailwindcss.com) |
| Autenticación | Firebase Authentication (Google) |
| Base de datos | Cloud Firestore con caché local persistente (offline + tiempo real) |
| Gráficas | [Recharts](https://recharts.org) |

## 📂 Estructura

```
src/
├── app/                  # Rutas (App Router)
│   ├── page.tsx          # Panel de inicio: resumen, racha, gráficas
│   ├── entrenar/         # Sesión de gimnasio en vivo + registro de cardio
│   ├── ejercicios/       # Biblioteca de ejercicios + personalizados
│   ├── planes/           # Planes de entrenamiento semanales
│   ├── progreso/         # Gráficas, récords, objetivos, calculadora 1RM
│   ├── historial/        # Historial completo con filtros
│   └── perfil/           # Cuenta, peso corporal, exportación de datos
├── components/           # Componentes de interfaz
├── context/              # Contexto de autenticación
└── lib/                  # Firebase, acceso a datos, estadísticas, tipos
```

## 🗺️ Ideas para el futuro

- Comparativas y funciones sociales (retos entre amigos)
- Importación de archivos GPX / FIT (Garmin, Polar…)
- Recordatorios de entrenamiento con notificaciones push
- Modo claro y selector de idioma
