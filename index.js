const oldFn = require('./old')
const newFn = require('./new')

const { performance } = require('perf_hooks')

const PHRASE = 'adbdoybwdoaydboaydbaowydbaowduanwodjwadaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'

const s1 = performance.now()
const or = []
for (var i = 0; i < 100; i++) or.push(oldFn(String(PHRASE ?? i)))
const s2 = performance.now()

const s3 = performance.now()
const nr = []
for (var i = 0; i < 100; i++) nr.push(newFn(String(PHRASE ?? i)))
const s4 = performance.now()

console.log((s2 - s1) / 100 + 'ms (old)', (s4 - s3) / 100 + 'ms (new)', (s2 - s1) / (s4 - s3) * 100 + '% faster')