'use strict'

require('babel-register')({
  presets: ['react-native'],
  ignore: name => {
    return name.indexOf('node_modules') > -1
  }
})

require('react-native-mock/mock')
require('../pouchdb-original/tests/integration/node.setup.js')
