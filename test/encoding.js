const assert = require("assert");
const encoder = require("..");

const testSpec = [
  { opts: { bitDepth:  8 }, TypedArray: Uint8Array,
    data: [ -1, -0.5, 0, 0.5, 1 ], expected: [ 0, 64, 128, 191, 255 ] },
  { opts: { bitDepth: 16 }, TypedArray: Int16Array,
    data: [ -1, -0.5, 0, 0.5, 1 ], expected: [ -32768, -16384, 0, 16384, 32767 ] },
  { opts: { bitDepth: 32 }, TypedArray: Int32Array,
    data: [ -1, -0.5, 0, 0.5, 1 ], expected: [ -2147483648, -1073741824, 0, 1073741824, 2147483647 ] },
  { opts: { bitDepth: 32, float: true }, TypedArray: Float32Array,
    data: [ -1, -0.5, 0, 0.5, 1 ], expected: [ -1, -0.5, 0, 0.5, 1 ] },
];

describe("encoding", () => {
  testSpec.forEach(({ opts, TypedArray, data, expected }) => {
    it(JSON.stringify(opts), () => {
      const audioData = {
        channelData: [ new Float32Array(data) ], sampleRate: 8000,
      };
      const encoded = encoder.encode.sync(audioData, opts);
      const actual = new TypedArray(encoded, 44);

      assert.deepEqual(actual, expected);
    });
  });
});
