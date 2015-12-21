# wav-encoder
[![Build Status](http://img.shields.io/travis/mohayonao/wav-encoder.svg?style=flat-square)](https://travis-ci.org/mohayonao/wav-encoder)
[![NPM Version](http://img.shields.io/npm/v/wav-encoder.svg?style=flat-square)](https://www.npmjs.org/package/wav-encoder)
[![License](http://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](http://mohayonao.mit-license.org/)

> isomorphic wav data encoder

## Installation

```
$ npm install wav-encoder
```

## API
### WavEncoder
- `constructor([format: object])`
  - format
    - `bitDepth: number = 16`
    - `floatingPoint: boolean = false`

#### Class methods
- `encode(audioData: AudioData, [format: object]): Promise<ArrayBuffer>`

#### Instance methods
- `encode(audioData: AudioData, [format: object]): Promise<ArrayBuffer>`

##### Attributes

```js
interface AudioData {
  sampleRate: number;
  channelData: Float32Array[];
}
```

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

WavDecoder.encode(audioData).then(function(buffer) {
  // buffer is an instanceof Buffer
  fs.writeFileSync("foobar.wav", buffer);
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
  // buffer is an instance of ArrayBuffer
  new Audio("data:audio/wav;base64," + arrayBufferToBase64(buffer)).play();
});
```

## License
MIT
