const test = require("ava");
const { readFile, readAudioData, deepEqual, deepCloseTo } = require("./_util");
const encoder = require("..");

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
