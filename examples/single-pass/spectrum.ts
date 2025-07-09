import FFT from "root/node_modules/fft.js/lib/fft.js";

export class SpectrumAnalyzer {
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

export class Spectrum {
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
