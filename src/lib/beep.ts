// Avisos sonoros y hápticos de los temporizadores.
//
// El AudioContext se crea una sola vez y perezosamente: los navegadores solo
// dejan arrancarlo dentro de un gesto del usuario, así que la primera llamada
// tiene que venir de un botón (en los circuitos, el de "Empezar").

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  try {
    if (!ctx) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctor) return null;
      ctx = new Ctor();
    }
    // Android suspende el contexto al volver de segundo plano
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/** Pitido corto. `freq` más alta = más urgente. */
export function beep(freq = 880, ms = 180, volume = 0.3) {
  const c = audio();
  if (!c) return;
  try {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.frequency.value = freq;
    osc.type = "sine";
    // Rampa a cero al final: un corte seco suena a chasquido
    gain.gain.setValueAtTime(volume, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + ms / 1000);
    osc.connect(gain).connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + ms / 1000);
  } catch {
    // sin sonido disponible
  }
}

export function vibrate(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    // el navegador no vibra
  }
}

/** Cuenta atrás: un tic por segundo en los últimos segundos. */
export function tick() {
  beep(660, 90, 0.22);
}

// ------------------------------------------------------------------- voz
// La cuenta atrás cantada usa la síntesis de voz del navegador: no hace falta
// grabar nada ni descargar audio, y va en español. Si el dispositivo no la
// tiene, el llamante se queda con el pitido.

export const speechAvailable = () =>
  typeof window !== "undefined" && "speechSynthesis" in window;

/** Dice algo en voz alta, cortando lo que estuviera diciendo. */
export function say(text: string, { rate = 1.15, volume = 1 } = {}) {
  if (!speechAvailable()) return false;
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "es-ES";
    u.rate = rate;
    u.volume = volume;
    // Cancelar lo anterior: en una cuenta atrás vale más el número de ahora
    // que terminar de decir el de hace un segundo.
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
    return true;
  } catch {
    return false;
  }
}

/**
 * Canta un segundo de la cuenta atrás. Devuelve false si no ha podido hablar,
 * para que el llamante haga sonar el pitido en su lugar.
 */
export function sayCount(sec: number) {
  return say(sec === 0 ? "¡Ya!" : String(sec), { rate: 1.3 });
}

/** Cambio de estación: dos pitidos altos y una vibración corta. */
export function goSignal() {
  beep(1046, 160, 0.32);
  setTimeout(() => beep(1318, 220, 0.32), 170);
  vibrate([120, 60, 160]);
}

/** Fin del circuito. */
export function finishSignal() {
  [0, 200, 400].forEach((d, i) => setTimeout(() => beep(880 + i * 220, 260, 0.32), d));
  vibrate([200, 100, 200, 100, 320]);
}
