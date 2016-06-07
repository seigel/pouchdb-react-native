import './polyfill'

import CoreLevelPouch from 'pouchdb-adapter-leveldb-core'
import { extend } from 'js-extend'

const asyncstorageDown = require('asyncstorage-down')

function AsyncStoragePouch(opts, callback) {
  var _opts = extend({
    db: asyncstorageDown
  }, opts)

  CoreLevelPouch.call(this, _opts, callback)
}

AsyncStoragePouch.valid = function () {
  return true
};
AsyncStoragePouch.use_prefix = false

export default function (PouchDB) {
  PouchDB.adapter('asyncstorage', AsyncStoragePouch, true);
}
