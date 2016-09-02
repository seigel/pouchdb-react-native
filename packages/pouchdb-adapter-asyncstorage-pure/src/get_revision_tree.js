'use strict'

import { createError, MISSING_DOC } from 'pouchdb-errors'
import keys from './keys'

export default function (db, id, opts, callback) {
  db.storage.get(keys.forDocument(id), (error, doc) => {
    if (error) {
      return callback(createError(
        MISSING_DOC, error.message || 'missing-read-error'))
    }

    if (!doc) {
      return callback(createError(MISSING_DOC, 'missing'))
    }

    callback(null, doc.rev_tree)
  })
}
