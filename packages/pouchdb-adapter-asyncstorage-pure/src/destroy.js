'use strict'

import { close as closeDatabase } from './databases'

export default function (db, api, opts, callback) {
  db.storage.destroy(db.internalName, error => {
    if (error) callback(error)

    closeDatabase(db.dbOpts.name)
    callback()
  })
}
