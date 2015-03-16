"use stirct";

import InlineWorker from "inline-worker";
import encoder from "./encoder-worker";

export default class Encoder {
  static canProcess(format) {
    if (typeof format === "string") {
      return /\bwav$/.test(format);
    }
    return false;
  }

  encode(audioData) {
    return new Promise((resolve) => {
      let worker = new InlineWorker(encoder, encoder.self);

      worker.onmessage = (e) => {
        if (e.data.type === "encoded") {
          resolve(e.data.buffer);
        }
      };

      let trasferable = audioData.toTransferable();

      worker.postMessage({
        type: "encode",
        audioData: trasferable
      }, trasferable.buffers);
    });
  }
}
