'use strict'

global.Buffer = global.Buffer || require('buffer').Buffer
global.atob = global.atob || require('atob')
global.btoa = global.btoa || require('btoa')

require('blob-polyfill')

if (!process.version) process.version = 'v0.10'
process.nextTick = process.nextTick || setImmediate

const downAdapter = require('asyncstorage-down')
const pluginBase = require('./pouchdb_level_adapter')

const adapterConfig = {
  name: 'asyncstorage',
  valid: function () {
    return true
  },
  use_prefix: false
}

pluginBase(adapterConfig, downAdapter)
