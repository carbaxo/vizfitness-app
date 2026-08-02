# 💪 VizFitness

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
- **🔥 Circuitos por estaciones** — entrenamiento tipo **WOD o Hyrox en casa**:
  recorres una lista de estaciones con un tiempo fijo de trabajo, **tiempo de
  transición entre una y otra** y varias rondas. El cronómetro avisa con
  sonido y vibración en cada cambio y mantiene la pantalla encendida. Seis circuitos listos —Hyrox en
  casa, WOD exprés, Tabata y tres **con bandas elásticas, cortas y largas**—,
  con rondas y tiempos ajustables, y puedes quitar las estaciones cuyo
  material no tengas, y **ajustar el trabajo y el descanso estación por
  estación**. Cada estación enseña **la imagen del ejercicio**, y al tocarla se
  abre el GIF de la técnica. Una **voz en español** canta la cuenta atrás
  (5, 4, 3, 2, 1) y dice qué estación toca, para no tener que mirar la
  pantalla. Y lleva **música**: un ritmo
  sintetizado en el navegador (tres estilos) que acelera al trabajar y se
  calma en el descanso, o **tus propias canciones** si prefieres — se eligen
  del dispositivo y no se suben a ningún sitio.
- **🗓️ Planes de entrenamiento** — crea tu rutina semanal (días de gimnasio,
  cardio y descanso) e inicia cada sesión con un toque: los ejercicios y las
  series se precargan solos. Los ejercicios se eligen **por imagen**, no
  escribiendo el nombre, y cada uno se ve con su miniatura dentro del plan.
  Incluye **plantillas de rutinas prediseñadas**
  (cuerpo completo, torso/pierna, Push Pull Legs, fuerza + cardio) que añades
  con un clic y editas a tu gusto.
- **📚 Biblioteca de ejercicios** — más de **1.300 ejercicios con imágenes,
  animación de la técnica (GIF) e instrucciones paso a paso en español**,
  organizados por grupo muscular, buscables por nombre, músculo o equipamiento;
  más tus ejercicios personalizados. Cada ejercicio se puede marcar con una
  **estrella**: los favoritos tienen su propio filtro en la biblioteca y salen
  los primeros al elegir ejercicio en una sesión o en un plan. Datos de
  [hasaneyldrm/exercises-dataset](https://github.com/hasaneyldrm/exercises-dataset)
  (© Gym Visual); las imágenes se sirven bajo demanda desde un CDN.
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
git clone https://github.com/carbaxo/vizfitness-app.git
cd vizfitness-app
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

## 🎨 Marca y paleta

VizFitness usa **la marca de la familia Viz**, la misma construcción que
VizPlay, VizSoccer y VizLessons:

- **El icono** es una **V de dos brazos** —el izquierdo blanco, el derecho en
  un tono claro del color de marca— sobre un cuadrado redondeado con un
  degradado en diagonal. Cambia el color, no la forma.
- **El logotipo** es la palabra en letras geométricas de trazo recto, partida
  en dos colores: **VIZ** en blanco y **FITNESS** en naranja.

La geometría **se calcula, no se dibuja**: la V del icono, la V del logotipo y
las letras salen de las mismas fórmulas y con las mismas proporciones que en
las otras apps (`scripts/logo.py` de VizSoccer, portado aquí a Node). Por eso
los trazados de la V y de las letras VIZ son idénticos a los de VizSoccer,
salvo el color.

Todo sale de un único script sin dependencias — ni Pillow ni librerías de
imagen: los PNG se rasterizan y se empaquetan con `zlib`:

```bash
node scripts/make-brand-assets.mjs
```

Escribe la marca suelta (`brand/logo.svg`, `brand/logo-mark.svg`,
`brand/logo-wordmark.svg`), los iconos de la web (`public/icon.svg`,
`public/icon-maskable.svg`), los de Android
(`mobile/assets/{icon,adaptive-icon,adaptive-icon-bg,splash}.png`) y la
geometría que consumen los componentes de React (`src/lib/wordmark.ts` y
`mobile/src/lib/wordmark.ts`). **No edites nada de eso a mano**: cambia el
script y vuelve a lanzarlo.

En pantalla, la marca se pinta con `Mark`, `Wordmark` y `Logo` de
[`src/components/Wordmark.tsx`](./src/components/Wordmark.tsx) y
[`mobile/src/components/Wordmark.tsx`](./mobile/src/components/Wordmark.tsx),
que leen esa misma geometría. Así el logotipo de la cabecera y el icono del
lanzador no pueden acabar siendo distintos.

El color de marca es el naranja **`#FF6F00`**. Todo lo demás se construye
alrededor: los neutros son **cálidos** (grises con una pizca de marrón), porque
sobre un gris azulado el naranja se ve sucio, y el color de apoyo es un
**turquesa**, el complementario, que es lo que separa cardio de gimnasio de un
vistazo en las gráficas.

| Uso | Color |
| --- | --- |
| Marca / acento | `#FF6F00` |
| Degradado del icono | `#FFA31A` → `#5E2500` |
| Segundo brazo de la V | `#FFCB99` |
| Acento claro (hover, texto) | `#FFA040` |
| Acento oscuro (pulsado) | `#C25100` |
| Cardio | `#FF8A1F` |
| Gimnasio | `#2DC5C9` |
| Fondo | `#12100E` |
| Tarjetas | `#1B1714` |
| Bordes | `#332A23` |
| Texto | `#F6F2EE` |
| Texto secundario | `#A79B8D` |
| Correcto / Aviso / Error | `#3DD68C` · `#FFC53D` · `#F4685E` |

Los botones principales van con **texto oscuro sobre naranja**: el blanco sobre
`#FF6F00` no llega al contraste mínimo de accesibilidad (2,8:1), el oscuro sí
(6,8:1).

Se definen en un solo sitio por app: [`tailwind.config.ts`](./tailwind.config.ts)
en la web y [`mobile/src/theme.ts`](./mobile/src/theme.ts) en Android.

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

scripts/
└── make-brand-assets.mjs # Genera los iconos de la web y de la app Android
```

## 🗺️ Ideas para el futuro

- Comparativas y funciones sociales (retos entre amigos)
- Importación de archivos GPX / FIT (Garmin, Polar…)
- Recordatorios de entrenamiento con notificaciones push
- Modo claro y selector de idioma
