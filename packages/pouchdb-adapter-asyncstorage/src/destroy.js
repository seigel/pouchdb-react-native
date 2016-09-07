'use strict'

import { close as closeDatabase } from './databases'
import AsyncStorageCore from './asyncstorage_core'

export default function (db, opts, callback) {
  AsyncStorageCore.destroy(db.opts.name, error => {
    if (error) callback(error)

    closeDatabase(db.opts.name)
    callback()
  })
}
