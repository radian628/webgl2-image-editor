import { test } from "bun:test";
import FFT from "fft.js";

class SpectrumAnalyzer {
  buffer: Float32Array;
  sampleRate: number;
  constructor(buffer: Float32Array, sampleRate: number) {
    this.buffer = buffer;
    this.sampleRate = sampleRate;
  }

  getSpectrumAtTime(time: number) {
    const fft = new FFT(4096);
    const out = fft.createComplexArray();

    const startSample = Math.max(0, Math.floor(time * this.sampleRate));
    const endSample = startSample + fft.size;

    fft.realTransform(out, this.buffer.slice(startSample, endSample));
    fft.completeSpectrum(out);

    return new Spectrum(out as unknown as Float32Array, 4096, this.sampleRate);
  }
}

class Spectrum {
  buffer: Float32Array;
  size: number;
  sampleRate: number;

  constructor(buffer: Float32Array, size: number, sampleRate: number) {
    this.buffer = buffer;
    this.size = size;
    this.sampleRate = sampleRate;
  }

  getIndexFromFreq(freq: number) {
    return Math.min(
      this.size - 1,
      Math.max(0, Math.round(this.size / ((1 / freq) * this.sampleRate)))
    );
  }

  getAmpAtIndex(i: number) {
    const realPart = this.buffer[i * 2];
    const imaginaryPart = this.buffer[i * 2 + 1];
    return Math.hypot(realPart, imaginaryPart);
  }

  getHighestAmplitudeInFrequencyBand(lo: number, hi: number) {
    const lowestIndex = this.getIndexFromFreq(lo);
    const highestIndex = this.getIndexFromFreq(hi);

    console.log("pls work thx", lowestIndex, highestIndex);
    let highestAmp = 0;

    for (let i = lowestIndex; i < highestIndex; i++) {
      highestAmp = Math.max(highestAmp, this.getAmpAtIndex(i));
    }

    return highestAmp / this.size;
  }
  getSumOfAmplitudesInFrequencyBand(lo: number, hi: number) {
    const lowestIndex = this.getIndexFromFreq(lo);
    const highestIndex = this.getIndexFromFreq(hi);

    let amp = 0;

    for (let i = lowestIndex; i < highestIndex; i++) {
      amp += this.getAmpAtIndex(i);
    }

    return amp;
  }
}

test("please work fft", () => {
  const fft = new FFT(4096);
  const arr = new Float32Array(44100 * 10);
  const out = fft.createComplexArray();

  for (let i = 0; i < arr.length; i++) {
    const angle = (i / 44100) * Math.PI * 2;
    arr[i] = Math.cos(angle * 330.5);
    // arr[i] += i % 2 ? 0.1 : -0.1;
    // arr[i] = 0.1;
  }

  const a = new SpectrumAnalyzer(arr, 44100);

  const spectrum = a.getSpectrumAtTime(0);

  for (let i = 1; i < 20; i++) {
    let lo = i * 50;
    let hi = (i + 1) * 50;
    console.log("freq band:", lo, hi);
    console.log(spectrum.getHighestAmplitudeInFrequencyBand(lo, hi));
  }

  fft.realTransform(out, arr.slice(0, 4096));
  fft.completeSpectrum(out);

  console.log(
    out
      .map((e, i) => ({ index: i, amp: e / 4096 }))
      .filter((e) => Math.abs(e.amp) > 0.01)
      .map((e) => `index: ${e.index}, amp: ${Math.floor(100 * e.amp)}`)
      .join("\n")
  );
});
