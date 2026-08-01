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
