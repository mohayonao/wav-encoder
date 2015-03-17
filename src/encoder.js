"use stirct";

import InlineWorker from "inline-worker";
import encoder from "./encoder-worker";

export default class Encoder {
  encode(audioData, format = {}) {
    return new Promise((resolve) => {
      let worker = new InlineWorker(encoder, encoder.self);

      worker.onmessage = (e) => {
        if (e.data.type === "encoded") {
          resolve(e.data.buffer);
        }
      };

      let numberOfChannels = audioData.channelData.length;
      let length = audioData.channelData[0].length;
      let sampleRate = audioData.sampleRate;
      let buffers = audioData.channelData.map(data => data.buffer);
      let trasferable = { numberOfChannels, length, sampleRate, buffers };

      worker.postMessage({
        type: "encode",
        audioData: trasferable,
        format: format
      }, trasferable.buffers);
    });
  }
}
