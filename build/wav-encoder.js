(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.WavEncoder = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
  self.onmessage = function (e) {
    switch (e.data.type) {
      case "encode":
        self.encode(e.data.audioData).then(function (buffer) {
          self.postMessage({
            type: "encoded",
            buffer: buffer
          }, [buffer]);
        })["catch"](function (err) {
          self.postMessage({
            type: "error",
            message: err.message
          });
        });
        break;
    }
  };

  self.encode = function (audioData) {
    return new Promise(function (resolve) {
      var numberOfChannels = audioData.numberOfChannels;
      var sampleRate = audioData.sampleRate;
      var length = audioData.length * numberOfChannels * 2;
      var writer = new BufferWriter(44 + length);

      writer.writeString("RIFF"); // RIFF header
      writer.writeUint32(writer.length - 8); // file length
      writer.writeString("WAVE"); // RIFF Type

      writer.writeString("fmt "); // format chunk identifier
      writer.writeUint32(16); // format chunk length
      writer.writeUint16(1); // format (PCM)
      writer.writeUint16(numberOfChannels); // number of channels
      writer.writeUint32(sampleRate); // sample rate
      writer.writeUint32(sampleRate * numberOfChannels * 2); // byte rate
      writer.writeUint16(numberOfChannels * 2); // block size
      writer.writeUint16(16); // bits per sample

      writer.writeString("data"); // data chunk identifier
      writer.writeUint32(length); // data chunk length

      var channelData = audioData.buffers.map(function (buffer) {
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

  BufferWriter.prototype.writeUint8 = function (data) {
    this.view.setUint8(this.pos, data);
    this.pos += 1;
  };

  BufferWriter.prototype.writeUint16 = function (data) {
    this.view.setUint16(this.pos, data, true);
    this.pos += 2;
  };

  BufferWriter.prototype.writeUint32 = function (data) {
    this.view.setUint32(this.pos, data, true);
    this.pos += 4;
  };

  BufferWriter.prototype.writeString = function (data) {
    for (var i = 0; i < data.length; i++) {
      this.writeUint8(data.charCodeAt(i));
    }
  };

  BufferWriter.prototype.writePCM = function (channelData) {
    var length = channelData[0].length;
    var numberOfChannels = channelData.length;

    for (var i = 0; i < length; i++) {
      for (var ch = 0; ch < numberOfChannels; ch++) {
        var x = channelData[ch][i];

        x = Math.max(-32768, Math.min(x * 32768, 32767)) | 0;

        this.view.setUint16(this.pos, x, true);
        this.pos += 2;
      }
    }
  };

  BufferWriter.prototype.toArrayBuffer = function () {
    return this.buffer;
  };

  self.BufferWriter = BufferWriter;
}

encoder.self = encoder.util = self;

module.exports = encoder;
},{}],2:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

"use stirct";

var InlineWorker = _interopRequire(require("inline-worker"));

var encoder = _interopRequire(require("./encoder-worker"));

var Encoder = (function () {
  function Encoder() {
    _classCallCheck(this, Encoder);
  }

  _createClass(Encoder, {
    encode: {
      value: function encode(audioData) {
        return new Promise(function (resolve) {
          var worker = new InlineWorker(encoder, encoder.self);

          worker.onmessage = function (e) {
            if (e.data.type === "encoded") {
              resolve(e.data.buffer);
            }
          };

          var trasferable = audioData.toTransferable();

          worker.postMessage({
            type: "encode",
            audioData: trasferable
          }, trasferable.buffers);
        });
      }
    }
  }, {
    canProcess: {
      value: function canProcess(format) {
        if (typeof format === "string") {
          return /\bwav$/.test(format);
        }
        return false;
      }
    }
  });

  return Encoder;
})();

module.exports = Encoder;
},{"./encoder-worker":1,"inline-worker":4}],3:[function(require,module,exports){
"use strict";

module.exports = require("./encoder");
},{"./encoder":2}],4:[function(require,module,exports){
"use strict";

module.exports = require("./inline-worker");
},{"./inline-worker":5}],5:[function(require,module,exports){
(function (global){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var WORKER_ENABLED = !!(global === global.window && global.URL && global.Blob && global.Worker);

var InlineWorker = (function () {
  function InlineWorker(func, self) {
    var _this = this;

    _classCallCheck(this, InlineWorker);

    if (WORKER_ENABLED) {
      var functionBody = func.toString().trim().match(/^function\s*\w*\s*\([\w\s,]*\)\s*{([\w\W]*?)}$/)[1];
      var url = global.URL.createObjectURL(new global.Blob([functionBody], { type: "text/javascript" }));

      return new global.Worker(url);
    }

    this.self = self;
    this.self.postMessage = function (data) {
      setTimeout(function () {
        _this.onmessage({ data: data });
      }, 0);
    };

    setTimeout(function () {
      func.call(self);
    }, 0);
  }

  _createClass(InlineWorker, {
    postMessage: {
      value: function postMessage(data) {
        var _this = this;

        setTimeout(function () {
          _this.self.onmessage({ data: data });
        }, 0);
      }
    }
  });

  return InlineWorker;
})();

module.exports = InlineWorker;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[3])(3)
});