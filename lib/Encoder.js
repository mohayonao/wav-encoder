const InlineWorker = require("inline-worker");
const EncoderWorker = require("./EncoderWorker");

var instance = null;

function Encoder(format) {
  var _this = this;

  format = format || {};

  this.format = {
    floatingPoint: !!(format.floatingPoint),
    bitDepth: (format.bitDepth|0) || 16,
  };
  this._worker = new InlineWorker(EncoderWorker, EncoderWorker.self);
  this._worker.onmessage = function(e) {
    var data = e.data;
    var callback = _this._callbacks[data.callbackId];

    if (callback) {
      if (data.type === "encoded") {
        callback.resolve(data.buffer);
      } else {
        callback.reject(new Error(data.message));
      }
    }

    _this._callbacks[data.callbackId] = null;
  };
  this._callbacks = [];
}

Encoder.encode = function encode(audioData, format) {
  if (instance === null) {
    instance = new Encoder();
  }
  return instance.encode(audioData, format);
};

Encoder.prototype.encode = function encode(audioData, format) {
  var _this = this;

  if (format == null || typeof format !== "object") {
    format = this.format;
  }
  return new Promise(function(resolve, reject) {
    var callbackId = _this._callbacks.length;
    var numberOfChannels = audioData.channelData.length;
    var length = audioData.channelData[0].length;
    var sampleRate = audioData.sampleRate;
    var buffers = audioData.channelData.map(function(data) {
      return data.buffer;
    });

    _this._callbacks.push({ resolve: resolve, reject: reject });

    audioData = {
      numberOfChannels: numberOfChannels,
      length: length,
      sampleRate: sampleRate,
      buffers: buffers
    };

    _this._worker.postMessage({
      type: "encode", audioData: audioData, format: format, callbackId: callbackId,
    }, audioData.buffers);
  });
};

module.exports = Encoder;
