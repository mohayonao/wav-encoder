"use strict";

function encode(audioData, opts) {
  opts = opts || {};

  return new Promise(function(resolve, reject) {
    audioData = toAudioData(audioData);

    if (audioData === null) {
      return reject(new TypeError("Invalid AudioData"));
    }

    var floatingPoint = !!(opts.floatingPoint || opts.float);
    var bitDepth = floatingPoint ? 32 : ((opts.bitDepth|0) || 16);
    var bytes = bitDepth >> 3;
    var length = audioData.length * audioData.numberOfChannels * bytes;
    var dataView = new DataView(new Uint8Array(44 + length).buffer);
    var writer = createWriter(dataView);

    var format = {
      formatId: floatingPoint ? 0x0003 : 0x0001,
      floatingPoint: floatingPoint,
      numberOfChannels: audioData.numberOfChannels,
      sampleRate: audioData.sampleRate,
      bitDepth: bitDepth
    };

    writeHeader(writer, format, dataView.buffer.byteLength - 8);

    var err = writeData(writer, format, length, audioData);

    if (err instanceof Error) {
      return reject(err);
    }

    resolve(dataView.buffer);
  });
}

function toAudioData(data) {
  var audioData = {};

  if (typeof data.sampleRate !== "number") {
    return null;
  }
  if (!Array.isArray(data.channelData)) {
    return null;
  }
  if (!(data.channelData[0] instanceof Float32Array)) {
    return null;
  }

  audioData.numberOfChannels = data.channelData.length;
  audioData.length = data.channelData[0].length|0;
  audioData.sampleRate = data.sampleRate|0;
  audioData.channelData = data.channelData;

  return audioData;
}

function writeHeader(writer, format, length) {
  var bytes = format.bitDepth >> 3;

  writer.string("RIFF");
  writer.uint32(length);
  writer.string("WAVE");

  writer.string("fmt ");
  writer.uint32(16);
  writer.uint16(format.floatingPoint ? 0x0003 : 0x0001);
  writer.uint16(format.numberOfChannels);
  writer.uint32(format.sampleRate);
  writer.uint32(format.sampleRate * format.numberOfChannels * bytes);
  writer.uint16(format.numberOfChannels * bytes);
  writer.uint16(format.bitDepth);
}

function writeData(writer, format, length, audioData) {
  var bitDepth = format.bitDepth;
  var floatingPoint = format.floatingPoint ? "f" : "";
  var methodName = "pcm" + bitDepth + floatingPoint;

  if (!writer[methodName]) {
    return new TypeError("Not supported bit depth: " + bitDepth);
  }

  var write = writer[methodName].bind(writer);
  var numberOfChannels = format.numberOfChannels;
  var channelData = audioData.channelData;

  writer.string("data");
  writer.uint32(length);

  for (var i = 0, imax = audioData.length; i < imax; i++) {
    for (var ch = 0; ch < numberOfChannels; ch++) {
      write(channelData[ch][i]);
    }
  }
}

function createWriter(dataView) {
  var pos = 0;

  return {
    int16: function(value) {
      dataView.setInt16(pos, value, true);
      pos += 2;
    },
    uint16: function(value) {
      dataView.setUint16(pos, value, true);
      pos += 2;
    },
    uint32: function(value) {
      dataView.setUint32(pos, value, true);
      pos += 4;
    },
    string: function(value) {
      for (var i = 0, imax = value.length; i < imax; i++) {
        dataView.setUint8(pos++, value.charCodeAt(i));
      }
    },
    pcm8: function(value) {
      value = Math.max(-1, Math.min(value, +1));
      value = (value * 0.5 + 0.5) * 255;
      dataView.setUint8(pos, value|0, true);
      pos += 1;
    },
    pcm16: function(value) {
      value = Math.max(-1, Math.min(value, +1));
      value = value < 0 ? value * 32768 : value * 32767;
      dataView.setInt16(pos, value|0, true);
      pos += 2;
    },
    pcm24: function(value) {
      value = Math.max(-1, Math.min(value, +1));
      value = value < 0 ? 0x1000000 + value * 8388608 : value * 8388607;
      value = value|0;

      var x0 = (value >>  0) & 0xFF;
      var x1 = (value >>  8) & 0xFF;
      var x2 = (value >> 16) & 0xFF;

      dataView.setUint8(pos + 0, x0);
      dataView.setUint8(pos + 1, x1);
      dataView.setUint8(pos + 2, x2);
      pos += 3;
    },
    pcm32: function(value) {
      value = Math.max(-1, Math.min(value, +1));
      value = value < 0 ? value * 2147483648 : value * 2147483647;
      dataView.setInt32(pos, value|0, true);
      pos += 4;
    },
    pcm32f: function(value) {
      dataView.setFloat32(pos, value, true);
      pos += 4;
    }
  };
}

module.exports.encode = encode;
