const test = require("ava");
const { readFile, readAudioData, deepEqual, deepCloseTo } = require("./_util");
const encoder = require("..");

test("works", t => {
  const expected = new Uint8Array([
    0x52, 0x49, 0x46, 0x46, // "RIFF"
    0x2c, 0x00, 0x00, 0x00, // file size
    0x57, 0x41, 0x56, 0x45, // "WAVE"
    0x66, 0x6d, 0x74, 0x20, // "fmt "
    0x10, 0x00, 0x00, 0x00, // 16bit
    0x01, 0x00, 0x02, 0x00, // stereo
    0x44, 0xac, 0x00, 0x00, // 44.1kHz
    0x10, 0xb1, 0x02, 0x00, // data speed
    0x04, 0x00, 0x10, 0x00, // block size, bit/sample
    0x64, 0x61, 0x74, 0x61, // "data"
    0x08, 0x00, 0x00, 0x00, // data size
    0x00, 0xc0, 0x00, 0x80,
    0xff, 0x7f, 0xff, 0x3f,
  ]);

  const audioData = {
    sampleRate: 44100,
    channelData: [
      new Float32Array([ -0.5, 1.5 ]),
      new Float32Array([ -1.5, 0.5 ]),
    ],
  };

  return encoder.encode(audioData, "wav").then((buffer) => {
    const actual = new Uint8Array(buffer);

    t.ok(deepEqual(actual, expected));
  });
});

const testSpec = [
  { opts: { bitDepth:  8 }, delta: 1e-1, filename: "amen_pcm8.wav" },
  { opts: { bitDepth: 16 }, delta: 1e-4, filename: "amen_pcm16.wav" },
  { opts: { bitDepth: 24 }, delta: 1e-6, filename: "amen_pcm24.wav" },
  { opts: { bitDepth: 32 }, delta: 1e-8, filename: "amen_pcm32.wav" },
  { opts: { float:  true }, delta: 0.00, filename: "amen_pcm32f.wav" }
];

test("encoding", async t => {
  const audioData = await readAudioData("./fixtures/amen.dat");

  return Promise.all(testSpec.map(async spec => {
    const actual = new Uint8Array(await encoder.encode(audioData, spec.opts));
    const expected = new Uint8Array((await readFile(`./fixtures/${ spec.filename }`)).buffer);

    t.ok(deepEqual(actual, expected));
  }));
});
