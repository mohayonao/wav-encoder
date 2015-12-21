"use strict";

const assert = require("assert");
const Encoder = require("../lib/Encoder");

let expected = new Buffer([
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
  0xff, 0x7f, 0x00, 0x40,
]);

describe("Encoder", function() {
  describe(".encode(audioData: AudioData, [format: object]): Promise<Buffer>", function() {
    it("works", function() {
      let audioData = {
        sampleRate: 44100,
        channelData: [
          new Float32Array([ -0.5, 1.5 ]),
          new Float32Array([ -1.5, 0.5 ]),
        ],
      };

      return Encoder.encode(audioData, "wav").then((buffer) => {
        let actual = buffer;

        assert.deepEqual(actual, expected);
      });
    });
  });
  describe("#encode(audioData: AudioData, [format: object]): Promise<Buffer>", function() {
    it("works", function() {
      let encoder = new Encoder();

      let audioData = {
        sampleRate: 44100,
        channelData: [
          new Float32Array([ -0.5, 1.5 ]),
          new Float32Array([ -1.5, 0.5 ]),
        ],
      };

      return encoder.encode(audioData, "wav").then((buffer) => {
        let actual = buffer;

        assert.deepEqual(actual, expected);
      });
    });
  });
});
