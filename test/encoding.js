const assert = require("assert");
const encoder = require("..");

const testSpec = [
  {
    opts: { bitDepth: 8 },
    TypedArray: Uint8Array,
    data: [ -1, -0.75, -0.5, 0, 0.5, 0.75, 1 ],
    expected: [ 0, 32, 64, 128, 191, 223, 255 ],
  },
  {
    opts: { bitDepth: 8, symmetric: true },
    TypedArray: Uint8Array,
    data: [ -1, -0.75, -0.5, 0, 0.5, 0.75, 1 ],
    expected: [ 0, 32, 64, 128, 192, 224, 255 ],
  },
  {
    opts: { bitDepth: 16 },
    TypedArray: Int16Array,
    data: [ -1, -0.75, -0.5, 0, 0.5, 0.75, 1 ],
    expected: [ -32768, -24576 , -16384, 0, 16384, 24575, 32767 ],
  },
  {
    opts: { bitDepth: 16, symmetric: true },
    TypedArray: Int16Array,
    data: [ -1, -0.75, -0.5, 0, 0.5, 0.75, 1 ],
    expected: [ -32768, -24576, -16384, 0, 16384, 24576, 32767 ],
  },
  {
    opts: { bitDepth: 32 },
    TypedArray: Int32Array,
    data: [ -1, -0.75, -0.5, 0, 0.5, 0.75, 1 ],
    expected: [ -2147483648, -1610612736, -1073741824, 0, 1073741824, 1610612735, 2147483647 ],
  },
  {
    opts: { bitDepth: 32, symmetric: true },
    TypedArray: Int32Array,
    data: [ -1, -0.75, -0.5, 0, 0.5, 0.75, 1 ],
    expected: [ -2147483648, -1610612736, -1073741824, 0, 1073741824, 1610612736, 2147483647 ],
  },
  {
    opts: { bitDepth: 32, float: true },
    TypedArray: Float32Array,
    data: [ -1, -0.5, 0, 0.5, 1 ],
    expected: [ -1, -0.5, 0, 0.5, 1 ],
  },
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
