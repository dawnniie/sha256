class BinaryNumber {
  constructor(input) {
    this.bits = BinaryNumber[(typeof input) + 'ToBits'](input)
  }

  rotate(n) {
    let bits = this.bits.slice(0)
    n -= bits.length * Math.floor(n / bits.length)
    bits.push.apply(bits, bits.splice(0, n))
    return new BinaryNumber(bits)
  }

  shift(n) {
    let bits = this.bits.slice(0)
    if (n > 0) bits = bits.concat(Array(n).fill(0))
    if (n < 1) bits = Array(Math.abs(n)).fill(0).concat(bits.slice(0, bits.length - Math.abs(n)))
    return new BinaryNumber(bits)
  }

  pad(n) {
    let bits = this.bits.slice(0)
    while (bits.length < n) bits = [0, ...bits]
    return new BinaryNumber(bits)
  }

  toDecimal() {
    return this.bits.reduce((t, n, i) => t + (n ? Math.pow(2, i) : 0), 0)
  }

  toString() {
    return this.bits.join('')
  }

  static addMod32(...nums) {
    return new BinaryNumber(nums.map(n => n.toDecimal()).reduce((t, n) => t + n, 0) % Math.pow(2, 32))
  }

  static and(...nums) {
    return BinaryNumber.calculate(nums, col => !col.find(n => !n))
  }

  static not(...nums) {
    return BinaryNumber.calculate(nums, col => !col[0])
  }

  static xor(...nums) {
    return BinaryNumber.calculate(nums, col => col.filter(n => n).length % 2 === 0)
  }

  static calculate(nums, compare) {
    const maxlen = Math.max(...nums.map(n => n.length))
    const ret = []
    for (var i = 0; i < maxlen; i++) {
      const column = nums.map(n => n[i - (maxlen - n.length)]).filter(n => n)
      ret.push(compare(column) ? 1 : 0)
    }
    return new BinaryNumber(ret)
  }

  static objectToBits(obj) {
    return obj
  }

  static numberToBits(num) {
    let ret = []
    while (num >= 1) {
      ret.unshift(Math.floor(num % 2))
      num = num / 2
    }
    return ret
  }

  static stringToBits(str) {
    return Array.from(str).map(c => {
      let subbits = BinaryNumber.numberToBits(c.charCodeAt())
      if (subbits.length < 8) subbits = Array(8 - subbits.length).fill(0).concat(subbits)
      return subbits
    }).reduce((t, n) => t.concat(n), [])
  }
}

module.exports = { BinaryNumber }