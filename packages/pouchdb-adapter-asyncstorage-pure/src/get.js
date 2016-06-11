'use strict'

import { createError, MISSING_DOC } from 'pouchdb-errors'
import keys from './keys'

export default function (db, id, opts, callback) {
  db.storage.get(keys.forDocument(id), (error, doc) => {
    if (error) {
      return callback(createError(
        MISSING_DOC, error.message || 'missing-read-error'))
    }

    const rev = opts.rev || (doc && doc.rev)
    if (!doc || (doc.deleted && !opts.rev) || !(rev in doc.revs)) {
      return callback(createError(MISSING_DOC, 'missing'))
    }

    const result = doc.revs[rev].data
    result._id = doc.id
    result._rev = rev

    callback(null, {
      doc: result,
      metadata: doc
    })
  })
}
