var fs = require('fs')

var PATH = './node_modules/pouchdb-binary-utils/package.json'
var packageContent
try {
  packageContent = JSON.parse(fs.readFileSync(PATH))
} catch (e) {
  PATH = '../pouchdb-binary-utils/package.json'
  packageContent = JSON.parse(fs.readFileSync(PATH))
}

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
