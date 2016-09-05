'use strict'

import {
  createError,
  MISSING_DOC } from 'pouchdb-errors'
import { forDocument, forSequence } from './keys'

export default function (db, id, opts, callback) {
  db.storage.get(forDocument(id), (error, doc) => {
    if (error) {
      return callback(createError(
        MISSING_DOC, error.message || 'missing-read-error'))
    }

    const rev = opts.rev || (doc && doc.rev)
    if (!doc || (doc.deleted && !opts.rev) || !(rev in doc.rev_map)) {
      return callback(createError(MISSING_DOC, 'missing'))
    }

    db.storage.get(forSequence(doc.rev_map[rev]), (error, result) => {
      if (error) {
        return callback(createError(
          MISSING_DOC, error.message || 'missing-read-error'))
      }

      callback(null, {
        doc: result,
        metadata: doc
      })
    })
  })
}
