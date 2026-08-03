export type WodCue = "countdown" | "work" | "rest" | "finish";

export class WodAudioEngine {
  private context: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private cueGain: GainNode | null = null;
  private beatTimer: number | null = null;
  private beat = 0;

  async unlock() {
    if (!this.context) {
      this.context = new AudioContext();
      this.musicGain = this.context.createGain();
      this.cueGain = this.context.createGain();
      this.musicGain.gain.value = 0.11;
      this.cueGain.gain.value = 0.7;
      this.musicGain.connect(this.context.destination);
      this.cueGain.connect(this.context.destination);
    }
    if (this.context.state === "suspended") await this.context.resume();
  }

  async startMusic() {
    await this.unlock();
    if (this.beatTimer !== null) return;
    this.playBeat();
    this.beatTimer = window.setInterval(() => this.playBeat(), 250);
  }

  stopMusic() {
    if (this.beatTimer !== null) window.clearInterval(this.beatTimer);
    this.beatTimer = null;
  }

  async cue(type: WodCue) {
    await this.unlock();
    if (!this.context || !this.cueGain) return;
    const now = this.context.currentTime;
    if (type === "countdown") this.tone(880, now, 0.09, this.cueGain, "sine");
    if (type === "work") {
      this.tone(880, now, 0.12, this.cueGain, "sine");
      this.tone(1320, now + 0.14, 0.18, this.cueGain, "sine");
    }
    if (type === "rest") {
      this.tone(660, now, 0.14, this.cueGain, "sine");
      this.tone(440, now + 0.16, 0.22, this.cueGain, "sine");
    }
    if (type === "finish") {
      [784, 988, 1318].forEach((frequency, index) => this.tone(frequency, now + index * 0.16, 0.22, this.cueGain!, "sine"));
    }
  }

  async dispose() {
    this.stopMusic();
    if (this.context) await this.context.close();
    this.context = null;
  }

  private playBeat() {
    if (!this.context || !this.musicGain) return;
    const now = this.context.currentTime;
    const step = this.beat % 16;
    if (step % 4 === 0) this.kick(now);
    if (step % 2 === 1) this.tone(step % 4 === 1 ? 1500 : 1900, now, 0.035, this.musicGain, "square", 0.035);
    if (step % 4 === 0) this.tone(step < 8 ? 55 : 65.4, now + 0.02, 0.2, this.musicGain, "sawtooth", 0.07);
    this.beat += 1;
  }

  private kick(time: number) {
    if (!this.context || !this.musicGain) return;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(130, time);
    oscillator.frequency.exponentialRampToValueAtTime(48, time + 0.12);
    gain.gain.setValueAtTime(0.75, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.16);
    oscillator.connect(gain).connect(this.musicGain);
    oscillator.start(time);
    oscillator.stop(time + 0.17);
  }

  private tone(frequency: number, time: number, duration: number, output: GainNode, type: OscillatorType, volume = 0.18) {
    if (!this.context) return;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
    oscillator.connect(gain).connect(output);
    oscillator.start(time);
    oscillator.stop(time + duration + 0.02);
  }
}
