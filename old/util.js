module.exports = {}

module.exports.pad = (input, size, digit = '0') => {
  while (input.startsWith(digit) && input.length > size) input = input.slice(1)
  if (input.length > size) throw new Error('Invalid input to padding function')
  return digit.repeat(size - input.length) + input
}

module.exports.stringToBinary = (input, sep = '') => Array.from(input).map(c => module.exports.toBinary(c.charCodeAt(), 8)).join(sep)

module.exports.toBinary = (value, pad = 32) => module.exports.pad(value.toString(2), pad)

module.exports.arrayRotate = (arr, count) => {
  count -= arr.length * Math.floor(count / arr.length)
  arr.push.apply(arr, arr.splice(0, count))
  return arr
}

module.exports.binaryRotate = (string, count) => module.exports.arrayRotate(string.split(''), count).join('')

module.exports.binaryShift = (string, count) => {
  if (count === 0) return string
  if (count > 0) return string + '0'.repeat(count)
  if (count < 0) return '0'.repeat(Math.abs(count)) + string.substring(0, string.length - Math.abs(count))
}

module.exports.bc = (type, ...nums) => {
  const maxlen = Math.max(...nums.map(n => n.length))
  nums = nums.map(n => module.exports.pad(n, maxlen))
  let ret = ''
  for (var i = 0; i < maxlen; i++) {
    const truevals = nums.filter(n => n[i] === '1').length
    if (type === 'xor') ret += ((truevals - 1) % 2 === 0) ? '1' : '0'
    else if (type === 'and') ret += (truevals === nums.length) ? '1' : '0'
    else if (type === 'not') ret += (truevals >= 1) ? '0' : '1'
    else throw new Error('Invalid binary calculation type')
  }
  return ret
}

module.exports.addMod32 = (...nums) => {
  return module.exports.toBinary(nums.map(n => typeof n === 'string' ? parseInt(n, 2) : n).reduce((t, n) => t + n, 0) % Math.pow(2, 32))
}

module.exports.binToHex = value => {
  const nv = value.split('')
  let arr = nv.length % 4 ? [nv.splice(0, nv.length % 4)[0]] : []
  while (nv.length > 0) arr.push(nv.splice(0, 4))
  return arr.map(i => parseInt(i.join(''), 2).toString(16).toUpperCase()).join('')
}