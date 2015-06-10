import InlineWorker from "inline-worker";
import EncoderWorker from "./EncoderWorker";

let instance = null;

export default class Encoder {
  static encode(audioData, format) {
    if (instance === null) {
      instance = new Encoder();
    }
    return instance.encode(audioData, format);
  }

  constructor(format = {}) {
    this.format = {
      floatingPoint: !!(format.floatingPoint),
      bitDepth: (format.bitDepth|0) || 16,
    };
    this._worker = new InlineWorker(EncoderWorker, EncoderWorker.self);
    this._worker.onmessage = ({ data }) => {
      let callback = this._callbacks[data.callbackId];

      if (callback) {
        if (data.type === "encoded") {
          callback.resolve(data.buffer);
        } else {
          callback.reject(new Error(data.message));
        }
      }

      this._callbacks[data.callbackId] = null;
    };
    this._callbacks = [];
  }

  encode(audioData, format) {
    if (format == null || typeof format !== "object") {
      format = this.format;
    }
    return new Promise((resolve, reject) => {
      let callbackId = this._callbacks.length;

      this._callbacks.push({ resolve, reject });

      let numberOfChannels = audioData.channelData.length;
      let length = audioData.channelData[0].length;
      let sampleRate = audioData.sampleRate;
      let buffers = audioData.channelData.map(data => data.buffer);

      audioData = { numberOfChannels, length, sampleRate, buffers };

      this._worker.postMessage({
        type: "encode", audioData, format, callbackId,
      }, audioData.buffers);
    });
  }
}
