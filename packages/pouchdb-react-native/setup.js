'use strict'

const fs = require('fs')
const path = require('path')
const globby = require('globby')

const root = path.resolve(__dirname, '..')
const PATHS = globby.sync('**/pouchdb-binary-utils/package.json', { cwd: root })

for (const p of PATHS) {
  const PATH = path.join(root, p)
  const packageContent = JSON.parse(fs.readFileSync(PATH))

  packageContent['react-native'] = {
    './lib/index.js': './lib/index.js',
    './src/base64.js': './src/base64.js',
    './src/base64StringToBlobOrBuffer.js': './src/base64StringToBlobOrBuffer.js',
    './src/blob.js': './src/blob.js',
    './src/binaryStringToBlobOrBuffer.js': './src/binaryStringToBlobOrBuffer.js',
    './src/blobOrBufferToBase64.js': './src/blobOrBufferToBase64.js',
    './src/blobOrBufferToBinaryString.js': './src/blobOrBufferToBinaryString.js',
    './src/typedBuffer.js': './src/typedBuffer.js'
  }

  fs.writeFileSync(PATH, JSON.stringify(packageContent, null, '  ') + '\n', 'utf8')
}
