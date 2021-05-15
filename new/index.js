const { BinaryNumber } = require('./classes')
let { hashValueConstants, roundConstants } = require('../constants')

module.exports = INPUT => {
  // convert to binary
  let primaryInput = new BinaryNumber(INPUT)

  // add 1 and pad out
  primaryInput.bits.push(1)
  while (primaryInput.bits.length % 512 !== 448) primaryInput.bits.push(0)

  // add big-endian integer (length of the original input in binary)
  primaryInput.bits.concat(new BinaryNumber(new BinaryNumber(INPUT).bits.length).pad(64))

  // compression preparation
  let [a, b, c, d, e, f, g, h] = hashValueConstants.map(v => new BinaryNumber(v))

  // chunk loop
  for (let i = 0; i < primaryInput.bits.length / 512; i++) {
    let chunk = new BinaryNumber(primaryInput.bits.slice(i * 512, (i + 1) * 512))

    // create message schedule
    let w = new Array(512 / 32)
    for (let j = 0, o = 0; j < 512 / 32; ++j, o += 32) w[j] = new BinaryNumber(chunk.bits.slice(o, o + 32))
    while (w.length < 64) w.push(new BinaryNumber(0))

    for (let j = 16; j < w.length; j++) {
      const s0 = BinaryNumber.xor(w[j - 15].rotate(-7), w[j - 15].rotate(-18), w[j - 15].rotate(-3))
      const s1 = BinaryNumber.xor(w[j - 2].rotate(-17), w[j - 2].rotate(-19), w[j - 2].rotate(-10))
      w[j] = BinaryNumber.addMod32(w[j - 16], s0, w[j - 7], s1)
    }

    // compression
    for (let j = 0; j < 64; j++) {
      const s1 = BinaryNumber.xor(e.rotate(-6), e.rotate(-11), e.rotate(-25))
      const ch = BinaryNumber.xor(BinaryNumber.and(e, f), BinaryNumber.and(BinaryNumber.not(e), g))
      const temp1 = BinaryNumber.addMod32(h, s1, ch, new BinaryNumber(roundConstants[j]), w[j])
      const s0 = BinaryNumber.xor(a.rotate(-2), a.rotate(-13), a.rotate(-22))
      const maj = BinaryNumber.xor(BinaryNumber.and(a, b), BinaryNumber.and(a, c), BinaryNumber.and(b, c))
      const temp2 = BinaryNumber.addMod32(s0, maj)
      h = g
      g = f
      f = e
      e = BinaryNumber.addMod32(d, temp1)
      d = c
      c = b
      b = a
      a = BinaryNumber.addMod32(temp1, temp2)
    }

    // modify final values
    a = BinaryNumber.addMod32(a, new BinaryNumber(hashValueConstants[0]))
    b = BinaryNumber.addMod32(a, new BinaryNumber(hashValueConstants[1]))
    c = BinaryNumber.addMod32(c, new BinaryNumber(hashValueConstants[2]))
    d = BinaryNumber.addMod32(d, new BinaryNumber(hashValueConstants[3]))
    e = BinaryNumber.addMod32(e, new BinaryNumber(hashValueConstants[4]))
    f = BinaryNumber.addMod32(f, new BinaryNumber(hashValueConstants[5]))
    g = BinaryNumber.addMod32(g, new BinaryNumber(hashValueConstants[6]))
    h = BinaryNumber.addMod32(h, new BinaryNumber(hashValueConstants[7]))
  }

  function binToHex(nv) {
    let arr = nv.length % 4 ? [nv.splice(0, nv.length % 4)] : []
    while (nv.length > 0) arr.push(nv.splice(0, 4))
    return arr.map(i => parseInt(i.join(''), 2).toString(16).toUpperCase()).join('')
  }

  // concatenate final hash
  return binToHex([...a.bits, ...b.bits, ...c.bits, ...d.bits, ...e.bits, ...f.bits, ...g.bits, ...h.bits])
}