'use strict'

module.exports = {
  name: 'asyncstorage',
  valid: function () {
    if (typeof React === 'undefined') {
      try {
        const React = require('react-native')
        return React.hasOwnProperty('AsyncStorage')
      } catch (error) {
      }

      return false
    }
  },
  use_prefix: true
}
