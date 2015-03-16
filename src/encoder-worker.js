"use strict";
/* jshint esnext: false */

/**
  CAUTION!!!!
  This file is used in WebWorker.
  So, must write with ES5, not use ES6.
  You need attention not to be traspiled by babel.
*/

var self = {};

function encoder() {
  self.onmessage = function(e) {
    switch (e.data.type) {
      case "encode":
        self.encode(e.data.audioData).then(function(buffer) {
          self.postMessage({
            type: "encoded",
            buffer: buffer
          }, [ buffer ]);
        }).catch(function(err) {
          self.postMessage({
            type: "error",
            message: err.message
          });
        });
        break;
    }
  };

  self.encode = function(audioData) {
    return new Promise(function(resolve) {
      var numberOfChannels = audioData.numberOfChannels;
      var sampleRate = audioData.sampleRate;
      var length = audioData.length * numberOfChannels * 2;
      var writer = new BufferWriter(44 + length);

      writer.writeString("RIFF"); // RIFF header
      writer.writeUint32(writer.length - 8); // file length
      writer.writeString("WAVE"); // RIFF Type

      writer.writeString("fmt "); // format chunk identifier
      writer.writeUint32(16);     // format chunk length
      writer.writeUint16(1);      // format (PCM)
      writer.writeUint16(numberOfChannels); // number of channels
      writer.writeUint32(sampleRate);       // sample rate
      writer.writeUint32(sampleRate * numberOfChannels * 2); // byte rate
      writer.writeUint16(numberOfChannels * 2); // block size
      writer.writeUint16(16); // bits per sample

      writer.writeString("data"); // data chunk identifier
      writer.writeUint32(length); // data chunk length

      var channelData = audioData.buffers.map(function(buffer) {
        return new Float32Array(buffer);
      });

      writer.writePCM(channelData);

      resolve(writer.toArrayBuffer());
    });
  };

  function BufferWriter(length) {
    this.buffer = new ArrayBuffer(length);
    this.view = new DataView(this.buffer);
    this.length = length;
    this.pos = 0;
  }

  BufferWriter.prototype.writeUint8 = function(data) {
    this.view.setUint8(this.pos, data);
    this.pos += 1;
  };

  BufferWriter.prototype.writeUint16 = function(data) {
    this.view.setUint16(this.pos, data, true);
    this.pos += 2;
  };

  BufferWriter.prototype.writeUint32 = function(data) {
    this.view.setUint32(this.pos, data, true);
    this.pos += 4;
  };

  BufferWriter.prototype.writeString = function(data) {
    for (var i = 0; i < data.length; i++) {
      this.writeUint8(data.charCodeAt(i));
    }
  };

  BufferWriter.prototype.writePCM = function(channelData) {
    var length = channelData[0].length;
    var numberOfChannels = channelData.length;

    for (var i = 0; i < length; i++) {
      for (var ch = 0; ch < numberOfChannels; ch++) {
        var x = channelData[ch][i];

        x = Math.max(-32768, Math.min(x * 32768, 32767))|0;

        this.view.setUint16(this.pos, x, true);
        this.pos += 2;
      }
    }
  };

  BufferWriter.prototype.toArrayBuffer = function() {
    return this.buffer;
  };

  self.BufferWriter = BufferWriter;
}

encoder.self = encoder.util = self;

module.exports = encoder;
