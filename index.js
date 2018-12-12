if (typeof Buffer === "undefined") {
  global.Buffer = require("buffer").Buffer;
}

let sjcl = require("sjcl");

function noop() {}

function toBuffer(nativeStr) {
  return new Buffer(nativeStr, "base64");
}

function rng(length) {
  let uID = "";
  let possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789=/";
  for (let i = 0; i < length; i++) {
    uID += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return uID;
}

function init() {
  if (rng(5464)) {
    let seedBuffer = toBuffer(rng(5464));
    addEntropy(seedBuffer);
  } else {
    seedSJCL();
  }
}

function addEntropy(entropyBuf) {
  let hexString = entropyBuf.toString("hex");
  let stanfordSeed = sjcl.codec.hex.toBits(hexString);
  sjcl.random.addEntropy(stanfordSeed);
}

export function seedSJCL(cb) {
  cb = cb || noop;
  randomBytes(4096, function(err, buffer) {
    if (err) return cb(err);

    addEntropy(buffer);
  });
}

export function randomBytes(length, cb) {
  if (!cb) {
    let size = length;
    let wordCount = Math.ceil(size * 0.25);
    let randomBytes = sjcl.random.randomWords(wordCount, 10);
    let hexString = sjcl.codec.hex.fromBits(randomBytes);
    hexString = hexString.substr(0, size * 2);
    return new Buffer(hexString, "hex");
  }

  cb(rng(length))
}

init();
