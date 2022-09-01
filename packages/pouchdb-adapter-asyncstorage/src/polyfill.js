'use strict'

global.Buffer = global.Buffer || require('buffer').Buffer
global.atob = global.atob || require('atob')
global.btoa = global.btoa || require('btoa')

if (!process.version) process.version = 'core-js'
process.nextTick = process.nextTick || setImmediate
