import { rect } from "root/rect.ts";
import { SpectrumAnalyzer } from "root/spectrum.ts";

await g.resize(512, 512);

const audiofile = (await g.readFile("root/32_oz_of_coffe_v2.mp3")).file!;

const audioctx = new AudioContext();

const audiobuf = await audioctx.decodeAudioData(await audiofile.arrayBuffer());

const channelCopyArray = new Float32Array();

const audiobuf2 = new AudioBuffer({
  length: audiobuf.length,
  numberOfChannels: 2,
  sampleRate: audiobuf.sampleRate,
});

// audiobuf.copyFromChannel(channelCopyArray, 0, 0);
audiobuf2.copyToChannel(audiobuf.getChannelData(0), 0, 0);
// audiobuf.copyFromChannel(channelCopyArray, 1, 0);
audiobuf2.copyToChannel(audiobuf.getChannelData(0), 1, 0);

console.log("RESET");

const audiodata = audiobuf.getChannelData(0);

const s = new SpectrumAnalyzer(audiodata, 44100);

const source = audioctx.createBufferSource();
source.buffer = audiobuf2;
source.connect(audioctx.destination);
source.start();

const soundStarted = audioctx.currentTime;

loop(async () => {
  const t = audioctx.currentTime - soundStarted;

  // clear screen
  rect(-1, -1, 1, 1, [0.0, 0.0, 0.0, 0.0]);

  const spectrum = s.getSpectrumAtTime(t);

  range(100, (r) => {
    const [freqLo, freqHi] = r.divideInterval(1, 2500);
    const amp = spectrum.getHighestAmplitudeInFrequencyBand(freqLo, freqHi);
    const [x1, x2] = r.divideInterval(-1, 1);
    const height = amp * 50;
    rect(x1, -1, x2, -1 + height, [1.0, 1.0, 0.0, 1.0]);
  });
});
