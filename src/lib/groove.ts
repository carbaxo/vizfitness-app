// Música para los circuitos, generada en el navegador.
//
// No son archivos: es un secuenciador con WebAudio que sintetiza bombo, caja,
// charles y bajo sobre la marcha. La razón es práctica — la web se publica
// como sitio estático en GitHub Pages y hoy pesa menos de 3 MB; un par de
// canciones en MP3 lo multiplicarían, y música con licencia no se puede
// distribuir. Así no hay archivos que descargar, funciona sin conexión y el
// ritmo puede seguir al cronómetro: acelera en el trabajo y se calma en el
// descanso, que es algo que una pista grabada no sabe hacer.
import { getAudioContext } from "./beep";

export type GrooveStyle = "pulso" | "cardio" | "calma";

export const GROOVE_STYLES: { value: GrooveStyle; label: string; hint: string }[] = [
  { value: "pulso", label: "Pulso", hint: "Cuatro por cuatro, constante" },
  { value: "cardio", label: "Cardio", hint: "Más rápido y con más caña" },
  { value: "calma", label: "Calma", hint: "Suave, para no agobiar" },
];

interface Pattern {
  bpm: number;
  /** 16 pasos por compás (semicorcheas). 1 = suena. */
  kick: number[];
  clap: number[];
  hat: number[];
  openHat: number[];
  /** Corcheas del bajo: 1 = fundamental, 2 = octava, 0 = silencio. */
  bass: number[];
  stab: boolean;
}

const P = (s: string) => [...s].map((c) => (c === "." ? 0 : Number(c) || 1));

const PATTERNS: Record<GrooveStyle, Pattern> = {
  pulso: {
    bpm: 126,
    kick: P("1...1...1...1..."),
    clap: P("....1.......1..."),
    hat: P("..1...1...1...1."),
    openHat: P("......1.......1."),
    bass: P("1.1.2.1."),
    stab: false,
  },
  cardio: {
    bpm: 142,
    kick: P("1...1..11...1..."),
    clap: P("....1.......1..."),
    hat: P("1.1.1.1.1.1.1.11"),
    openHat: P("......1.....1..."),
    bass: P("11.121.1"),
    stab: true,
  },
  calma: {
    bpm: 96,
    kick: P("1.......1......."),
    clap: P("........1......."),
    hat: P("....1.......1..."),
    openHat: P("................"),
    bass: P("1...2..."),
    stab: false,
  },
};

// Progresión de cuatro compases (La menor – Fa – Do – Sol), en MIDI del bajo
const ROOTS = [33, 29, 36, 31];
const midiToHz = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

let noiseBuffer: AudioBuffer | null = null;
function noise(ctx: AudioContext) {
  if (noiseBuffer) return noiseBuffer;
  const len = ctx.sampleRate * 0.4;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  noiseBuffer = buf;
  return buf;
}

/**
 * Secuenciador. Programa las notas por adelantado contra el reloj del
 * AudioContext —no con setInterval— porque el temporizador de JavaScript se
 * desvía y con música se nota enseguida: el `setInterval` solo decide *cuándo
 * mirar*, y lo que suena va agendado con precisión de muestra.
 */
export class Groove {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private step = 0;
  private bar = 0;
  private nextTime = 0;
  private style: GrooveStyle = "pulso";
  private vol = 0.5;
  private tempoScale = 1;

  private readonly LOOKAHEAD = 0.12; // s que se agendan por delante
  private readonly TICK = 25; // ms entre revisiones

  get playing() {
    return this.timer !== null;
  }

  setStyle(s: GrooveStyle) {
    this.style = s;
  }

  setVolume(v: number) {
    this.vol = v;
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(v, this.ctx.currentTime, 0.05);
    }
  }

  /** Baja el volumen un momento para que se oiga la voz o el aviso. */
  duck(on: boolean) {
    if (!this.master || !this.ctx) return;
    this.master.gain.setTargetAtTime(on ? this.vol * 0.25 : this.vol, this.ctx.currentTime, 0.08);
  }

  /** 1 = tempo del estilo. Se usa para calmar el ritmo en los descansos. */
  setTempoScale(k: number) {
    this.tempoScale = k;
  }

  start() {
    if (this.timer) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    this.ctx = ctx;
    if (!this.master) {
      this.master = ctx.createGain();
      this.master.gain.value = this.vol;
      this.master.connect(ctx.destination);
    }
    this.nextTime = ctx.currentTime + 0.08;
    this.timer = setInterval(() => this.schedule(), this.TICK);
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.step = 0;
    this.bar = 0;
  }

  private schedule() {
    const ctx = this.ctx;
    if (!ctx) return;
    const pat = PATTERNS[this.style];
    const stepDur = 60 / (pat.bpm * this.tempoScale) / 4; // semicorchea
    while (this.nextTime < ctx.currentTime + this.LOOKAHEAD) {
      this.playStep(this.step, this.nextTime, pat);
      this.nextTime += stepDur;
      this.step = (this.step + 1) % 16;
      if (this.step === 0) this.bar = (this.bar + 1) % 4;
    }
  }

  private playStep(i: number, t: number, pat: Pattern) {
    if (pat.kick[i]) this.kick(t);
    if (pat.clap[i]) this.clap(t);
    if (pat.openHat[i]) this.hat(t, true);
    else if (pat.hat[i]) this.hat(t, false);
    // El bajo va en corcheas: un paso de cada dos
    if (i % 2 === 0) {
      const v = pat.bass[i / 2];
      if (v) {
        const root = ROOTS[this.bar] + (v === 2 ? 12 : 0);
        this.bass(t, midiToHz(root), (60 / (pat.bpm * this.tempoScale)) * 0.45);
      }
    }
    if (pat.stab && i === 4) this.stab(t, ROOTS[this.bar] + 24);
  }

  private out() {
    return this.master!;
  }

  private kick(t: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(45, t + 0.11);
    g.gain.setValueAtTime(0.9, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    o.connect(g).connect(this.out());
    o.start(t);
    o.stop(t + 0.32);
  }

  private clap(t: number) {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = noise(ctx);
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 1700;
    bp.Q.value = 0.9;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.4, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
    src.connect(bp).connect(g).connect(this.out());
    src.start(t);
    src.stop(t + 0.16);
  }

  private hat(t: number, open: boolean) {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = noise(ctx);
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 8200;
    const g = ctx.createGain();
    const dur = open ? 0.22 : 0.04;
    g.gain.setValueAtTime(open ? 0.16 : 0.2, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(hp).connect(g).connect(this.out());
    src.start(t);
    src.stop(t + dur + 0.02);
  }

  private bass(t: number, hz: number, dur: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = "sawtooth";
    o.frequency.value = hz;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(900, t);
    lp.frequency.exponentialRampToValueAtTime(220, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.32, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(lp).connect(g).connect(this.out());
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  /** Acorde corto y filtrado, para que el estilo "cardio" no sea solo batería. */
  private stab(t: number, rootMidi: number) {
    const ctx = this.ctx!;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.12, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 1400;
    g.connect(lp).connect(this.out());
    for (const semi of [0, 3, 7]) {
      const o = ctx.createOscillator();
      o.type = "sawtooth";
      o.frequency.value = midiToHz(rootMidi + semi);
      o.connect(g);
      o.start(t);
      o.stop(t + 0.24);
    }
  }
}
