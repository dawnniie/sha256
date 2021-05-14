const util = require('./util')
const { performance } = require('perf_hooks')
let { hashValueConstants, roundConstants } = require('./constants')

const INPUT = 'test'

console.log('INPUT >>', INPUT)
const start = performance.now()

// convert to binary
let primaryInput = util.stringToBinary(INPUT)

// add 1 and pad out
primaryInput = primaryInput + '1'
while (primaryInput.length % 512 !== 448) primaryInput += '0'

// add big-endian integer (length of the original input in binary)
primaryInput += util.pad(util.toBinary(util.stringToBinary(INPUT).length), 64)

// compression preparation
let [a, b, c, d, e, f, g, h] = hashValueConstants.map(v => util.toBinary(v, 32))

// chunk loop
for (let i = 0; i < primaryInput.length / 512; i++) {
  let chunk = primaryInput.substring(i * 512, (i + 1) * 512)

  // create message schedule
  let w = new Array(512 / 32)
  for (let j = 0, o = 0; j < 512 / 32; ++j, o += 32) w[j] = chunk.substr(o, 32)
  while (w.length < 64) w.push('0'.repeat(32))

  for (let j = 16; j < w.length; j++) {
    const s0 = util.bc('xor', util.binaryRotate(w[j - 15], -7), util.binaryRotate(w[j - 15], -18), util.binaryShift(w[j - 15], -3))
    const s1 = util.bc('xor', util.binaryRotate(w[j - 2], -17), util.binaryRotate(w[j - 2], -19), util.binaryShift(w[j - 2], -10))
    w[j] = util.addMod32(w[j - 16], s0, w[j - 7], s1)
  }

  // compression
  for (let j = 0; j < 64; j++) {
    const s1 = util.bc('xor', util.binaryRotate(e, -6), util.binaryRotate(e, -11), util.binaryRotate(e, -25))
    const ch = util.bc('xor', util.bc('and', e, f), util.bc('and', util.bc('not', e), g))
    const temp1 = util.addMod32(h, s1, ch, roundConstants[j], w[j])
    const s0 = util.bc('xor', util.binaryRotate(a, -2), util.binaryRotate(a, -13), util.binaryRotate(a, -22))
    const maj = util.bc('xor', util.bc('and', a, b), util.bc('and', a, c), util.bc('and', b, c))
    const temp2 = util.addMod32(s0, maj)
    h = g
    g = f
    f = e
    e = util.addMod32(d, temp1)
    d = c
    c = b
    b = a
    a = util.addMod32(temp1, temp2)
  }

  // modify final values
  a = util.addMod32(a, hashValueConstants[0])
  b = util.addMod32(a, hashValueConstants[1])
  c = util.addMod32(c, hashValueConstants[2])
  d = util.addMod32(d, hashValueConstants[3])
  e = util.addMod32(e, hashValueConstants[4])
  f = util.addMod32(f, hashValueConstants[5])
  g = util.addMod32(g, hashValueConstants[6])
  h = util.addMod32(h, hashValueConstants[7])
}

// concatenate final hash
const digest = util.binToHex(a + b + c + d + e + f + g + h)
console.log('SHA256 DIGEST >>', digest)
console.log('TIME >>', Math.round((performance.now() - start) * 1000) / 1000 + 'ms')