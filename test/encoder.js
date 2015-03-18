"use strict";

import assert from "power-assert";
import AudioData from "audiodata";
import Encoder from "../src/encoder";

let expected = new Uint8Array([
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

describe("Encoder", () => {
  describe(".canProcess(format: stirng): boolean", () => {
    it("works", () => {
      assert(Encoder.canProcess("wav") === true);
      assert(Encoder.canProcess("mp3") === false);
      assert(Encoder.canProcess({ type: "wav" }) === true);
      assert(Encoder.canProcess({ type: "mp3" }) === false);
    });
  });
  describe("#canProcess(format: stirng): boolean", () => {
    it("works", () => {
      let encoder = new Encoder();

      assert(encoder.canProcess("wav") === true);
      assert(encoder.canProcess("mp3") === false);
      assert(encoder.canProcess({ type: "wav" }) === true);
      assert(encoder.canProcess({ type: "mp3" }) === false);
    });
  });
  describe("#encode(audioData: AudioData): Promise<ArrayBuffer>", () => {
    it("works", () => {
      let encoder = new Encoder();

      let audioData = {
        sampleRate: 44100,
        channelData: [
          new Float32Array([ -0.5, 1.5 ]),
          new Float32Array([ -1.5, 0.5 ]),
        ]
      };

      return encoder.encode(audioData).then((buffer) => {
        let actual = new Uint8Array(buffer);

        assert.deepEqual(actual, expected);
      });
    });
  });
});
describe("AudioData", () => {
  describe(".encode(audioData: AudioData): Promise<ArrayBuffer>", () => {
    it("works", () => {
      AudioData.install(Encoder);

      let audioData = new AudioData(2, 2, 44100);

      audioData.channelData[0].set([ -0.5, 1.5 ]);
      audioData.channelData[1].set([ -1.5, 0.5 ]);

      return AudioData.encode(audioData).then((buffer) => {
        let actual = new Uint8Array(buffer);

        assert.deepEqual(actual, expected);
      });
    });
  });
});
