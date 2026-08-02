import type { Circuit } from "./types";

// Circuitos por estaciones, al estilo de un WOD o de Hyrox pero hechos en
// casa: una lista de estaciones que se recorren en orden, con un tiempo fijo
// entre una y otra para cambiar de sitio y de material, y varias rondas.
//
// Dos ideas guían las plantillas:
//
//  1. **Alternar tren superior e inferior** dentro de la ronda. Encadenar dos
//     estaciones de pierna hace que la segunda la limite el fallo muscular y
//     no el pulmón, que es justo lo contrario de lo que busca un circuito.
//  2. **Agrupar el material**. La transición es corta, así que las estaciones
//     que comparten banda o mancuerna van seguidas siempre que la regla
//     anterior lo permita: cambiar de anclaje cuesta más que soltar la banda.

export const CIRCUIT_TEMPLATES: Circuit[] = [
  {
    name: "Hyrox en casa",
    emoji: "🔥",
    description:
      "Ocho estaciones con carrera en el sitio entre cada una, como los 1 km de Hyrox. El trineo se sustituye por banda larga anclada: es lo que más se le parece en tracción continua.",
    transitionSec: 40,
    rounds: 2,
    roundRestSec: 180,
    stations: [
      {
        name: "Ski con banda larga",
        equipment: "banda larga",
        libraryName: "Cable straight arm pulldown",
        workSec: 60,
        note: "Banda anclada alto (marco de puerta). Tira hacia las caderas cerrando el abdomen, no solo con los brazos.",
      },
      {
        name: "Zancada búlgara",
        equipment: "peso corporal",
        libraryName: "Band single leg split squat",
        workSec: 60,
        note: "Pie de atrás en el sofá o una silla. 30 s por pierna.",
      },
      {
        name: "Arrastre con banda larga",
        equipment: "banda larga",
        libraryName: "Band one arm standing low row",
        workSec: 60,
        note: "Banda anclada baja. Camina hacia atrás remando: simula el arrastre de trineo.",
      },
      {
        name: "Burpee con salto",
        equipment: "peso corporal",
        libraryName: "Burpee",
        workSec: 45,
        note: "Ritmo constante; si te ahogas, quita el salto antes que parar.",
      },
      {
        name: "Remo con banda larga",
        equipment: "banda larga",
        libraryName: "Resistance band seated straight back row",
        workSec: 60,
        note: "Sentado, banda en los pies. Codos pegados y aprieta la espalda al final.",
      },
      {
        name: "Paseo del granjero",
        equipment: "mancuerna",
        libraryName: "Farmers walk",
        workSec: 60,
        note: "Lo más pesado que aguantes. Hombros atrás y abdomen apretado.",
      },
      {
        name: "Zancadas con mochila",
        equipment: "mochila",
        libraryName: "Walking lunge",
        workSec: 60,
        note: "Mochila cargada de libros sobre los hombros. Paso largo.",
      },
      {
        name: "Wall ball (sentadilla + press)",
        equipment: "mancuerna",
        libraryName: "Kettlebell thruster",
        workSec: 60,
        note: "Sentadilla completa y press explosivo arriba, en un solo movimiento.",
      },
    ],
  },
  {
    name: "WOD exprés · 20 minutos",
    emoji: "⚡",
    description:
      "Cinco estaciones de peso corporal, cuatro rondas y transiciones cortas. Sin material: lo único que hace falta es sitio para tumbarse.",
    transitionSec: 15,
    rounds: 4,
    roundRestSec: 90,
    stations: [
      { name: "Sentadilla al aire", equipment: "peso corporal", workSec: 40, note: "Baja hasta que el muslo pase de la paralela." },
      { name: "Flexiones", equipment: "peso corporal",
        libraryName: "Push-up", workSec: 40, note: "Si fallas, apoya las rodillas y sigue sin parar." },
      { name: "Escalador", equipment: "peso corporal",
        libraryName: "Mountain climber", workSec: 40, note: "Cadera baja, rodilla al pecho." },
      { name: "Plancha con toque de hombro", equipment: "esterilla",
        libraryName: "Shoulder tap", workSec: 40, note: "Sin balancear la cadera: pies algo separados." },
      { name: "Salto de comba o rodillas altas", equipment: "comba",
        libraryName: "Jump rope", workSec: 40, note: "Sin comba, rodillas altas al mismo ritmo." },
    ],
  },
  {
    name: "Circuito completo con bandas",
    emoji: "🎗️",
    description:
      "Ocho estaciones alternando banda larga (empujes y tirones) y banda corta (cadera y glúteo). Todo el cuerpo con lo que cabe en un cajón.",
    transitionSec: 25,
    rounds: 3,
    roundRestSec: 120,
    stations: [
      {
        name: "Jalón con banda larga",
        equipment: "banda larga",
        libraryName: "Band close-grip pulldown",
        workSec: 45,
        note: "Anclada alto. De rodillas, tira de la banda hasta el pecho.",
      },
      {
        name: "Sentadilla con banda corta",
        equipment: "banda corta",
        libraryName: "Band squat",
        workSec: 45,
        note: "Banda por encima de las rodillas. Empuja las rodillas hacia fuera todo el rato.",
      },
      {
        name: "Press de pecho con banda larga",
        equipment: "banda larga",
        libraryName: "Band bench press",
        workSec: 45,
        note: "Banda por detrás de la espalda, a la altura de las axilas.",
      },
      {
        name: "Puente de glúteo con banda corta",
        equipment: "banda corta",
        libraryName: "Resistance band hip thrusts on knees (female)",
        workSec: 45,
        note: "Banda sobre las rodillas. Aprieta arriba dos segundos.",
      },
      {
        name: "Remo con banda larga",
        equipment: "banda larga",
        libraryName: "Resistance band seated straight back row",
        workSec: 45,
        note: "Anclada a media altura. Codos rozando el costado.",
      },
      {
        name: "Paso lateral con banda corta",
        equipment: "banda corta",
        libraryName: "Monster walk",
        workSec: 45,
        note: "Banda en los tobillos, media sentadilla. Pasos laterales sin juntar los pies.",
      },
      {
        name: "Press de hombro con banda larga",
        equipment: "banda larga",
        libraryName: "Band shoulder press",
        workSec: 45,
        note: "Pisa la banda con los dos pies. No arquees la espalda.",
      },
      {
        name: "Peso muerto con banda larga",
        equipment: "banda larga",
        libraryName: "Band straight leg deadlift",
        workSec: 45,
        note: "Pisa el centro de la banda. La cadera manda; la espalda, plana.",
      },
    ],
  },
  {
    name: "Banda corta · cadera y glúteo",
    emoji: "⭕",
    description:
      "Seis estaciones con una sola mini band. Quema mucho con poquísimo material: va bien como sesión corta o como activación antes de correr.",
    transitionSec: 20,
    rounds: 3,
    roundRestSec: 75,
    stations: [
      { name: "Paso de monstruo", equipment: "banda corta",
        libraryName: "Monster walk", workSec: 40, note: "Banda en los tobillos, media sentadilla, pasos en diagonal hacia delante." },
      { name: "Almeja tumbado", equipment: "banda corta", workSec: 40, reps: "20 por lado", note: "De lado, rodillas dobladas. Abre sin girar la cadera." },
      { name: "Patada de glúteo a cuatro apoyos", equipment: "banda corta",
        libraryName: "Band bent-over hip extension", workSec: 40, reps: "15 por lado", note: "Banda entre el pie y las manos. Empuja el talón al techo." },
      { name: "Sentadilla sumo con banda", equipment: "banda corta", workSec: 40, note: "Pies anchos, banda sobre las rodillas, abre todo el rato." },
      { name: "Abducción tumbado", equipment: "banda corta",
        libraryName: "Side hip abduction", workSec: 40, reps: "20 por lado", note: "Pierna estirada, sube despacio y baja más despacio aún." },
      { name: "Puente a una pierna", equipment: "banda corta",
        libraryName: "Low glute bridge on floor", workSec: 40, reps: "12 por lado", note: "Banda sobre las rodillas. Cadera a la misma altura los dos lados." },
    ],
  },
  {
    name: "Banda larga · torso",
    emoji: "💪",
    description:
      "Seis estaciones de empuje y tirón con una banda larga anclada. Sustituye a la polea y al remo cuando no tienes gimnasio.",
    transitionSec: 25,
    rounds: 3,
    roundRestSec: 90,
    stations: [
      { name: "Remo a una mano", equipment: "banda larga",
        libraryName: "Band one arm standing low row", workSec: 45, reps: "12 por lado", note: "Anclada a media altura. Gira un poco el tronco al tirar." },
      { name: "Press de pecho", equipment: "banda larga",
        libraryName: "Band bench press", workSec: 45, note: "Banda por detrás de la espalda. Un paso adelante para tensarla más." },
      { name: "Face pull", equipment: "banda larga",
        libraryName: "Band standing rear delt row", workSec: 45, note: "Anclada alto. Lleva las manos a las orejas abriendo los codos." },
      { name: "Curl de bíceps", equipment: "banda larga",
        libraryName: "Band alternating biceps curl", workSec: 45, note: "Pisa la banda. Codos quietos pegados al cuerpo." },
      { name: "Extensión de tríceps sobre la cabeza", equipment: "banda larga",
        libraryName: "Band side triceps extension", workSec: 45, note: "Anclada baja, de espaldas al anclaje." },
      { name: "Pull-apart", equipment: "banda larga",
        libraryName: "Band reverse fly", workSec: 45, note: "Brazos estirados al frente, abre hasta tocar el pecho con la banda." },
    ],
  },
  {
    name: "Tabata · 4 estaciones",
    emoji: "⏱️",
    description:
      "El clásico 20 s a tope / 10 s de transición, ocho rondas. Veinte minutos con calentamiento, cuatro sin él, y no hay dónde esconderse.",
    transitionSec: 10,
    rounds: 8,
    roundRestSec: 60,
    stations: [
      { name: "Sentadilla con salto", equipment: "peso corporal",
        libraryName: "Jump squat", workSec: 20, note: "Aterriza suave, rodillas mirando a los pies." },
      { name: "Flexiones explosivas", equipment: "peso corporal",
        libraryName: "Clap push up", workSec: 20, note: "Si no despegan las manos, hazlas normales y rápidas." },
      { name: "Remo con banda larga", equipment: "banda larga",
        libraryName: "Resistance band seated straight back row", workSec: 20, note: "Anclada a media altura, tirones cortos y seguidos." },
      { name: "Rodillas altas", equipment: "peso corporal", workSec: 20, note: "Rodilla por encima de la cadera, brazos acompañando." },
    ],
  },
];
