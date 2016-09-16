'use strict'

import { createError, MISSING_DOC } from 'pouchdb-errors'
import { forDocument } from './keys'

export default function (db, id, callback) {
  db.storage.get(forDocument(id), (error, doc) => {
    if (error) {
      return callback(createError(
        MISSING_DOC, error.message || 'missing-read-error'))
    }

    if (!doc) {
      return callback(createError(MISSING_DOC, 'missing-rev-tree'))
    }

    callback(null, doc.rev_tree)
  })
}
