# wav-encoder
[![Build Status](http://img.shields.io/travis/mohayonao/wav-encoder.svg?style=flat-square)](https://travis-ci.org/mohayonao/wav-encoder)
[![NPM Version](http://img.shields.io/npm/v/wav-encoder.svg?style=flat-square)](https://www.npmjs.org/package/wav-encoder)
[![Bower](http://img.shields.io/bower/v/wav-encoder.svg?style=flat-square)](http://bower.io/search/?q=wav-encoder)
[![License](http://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](http://mohayonao.mit-license.org/)

> isomorphic wav data encoder

## Installation

npm:

```
npm install wav-encoder
```

bower:

```
bower install wav-encoder
```

downloads:

- [wav-encoder.js](https://raw.githubusercontent.com/mohayonao/wav-encoder/master/build/wav-encoder.js)
- [wav-encoder.min.js](https://raw.githubusercontent.com/mohayonao/wav-encoder/master/build/wav-encoder.min.js)

## API
### WavEncoder
- `constructor([format: object])`
  - format
    - `bitDepth: number = 16`
    - `floatingPoint: boolean = false`

#### Class methods
- `canProcess(format: object): string`
- `encode(audioData: object, [format: object]): Promise<ArrayBuffer>`
  - audioData
    - `sampleRate: number`
    - `channelData: Float32Array[]`

#### Instance methods
- `canProcess(format: object): string`
- `encode(audioData: object, [format: object]): Promise<ArrayBuffer>`
  - audioData
    - `sampleRate: number`
    - `channelData: Float32Array[]`

## Usage

#### node.js

```js
var fs = require("fs");
var WavEncoder = require("wav-encoder");

var audioData = {
  sampleRate: 44100,
  channelData: [
    new Float32Array(100),
    new Float32Array(100),
  ]
};

function arrayBufferToBuffer(buffer) {
  return new Buffer(new Uint8Array(buffer));
}

WavDecoder.encode(audioData).then(function(buffer) {
  fs.writeFileSync("foobar.wav", arrayBufferToBuffer(buffer));
});
```

#### browser

```html
<script src="/path/to/wav-encoder.js"></script>
```

```js
var audioData = {
  sampleRate: 44100,
  channelData: [
    new Float32Array(100),
    new Float32Array(100),
  ]
};

function arrayBufferToBase64(buffer) {
  return btoa([].slice.call(new Uint8Array(buffer)).map(String.fromCharCode).join(""));
}

WavEncoder.encode(audioData).then(function(buffer) {
  new Audio("data:audio/wav;base64," + arrayBufferToBase64(buffer)).play();
});
```

## License
MIT
