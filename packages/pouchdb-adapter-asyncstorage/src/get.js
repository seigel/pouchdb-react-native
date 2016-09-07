'use strict'

import {
  createError,
  MISSING_DOC } from 'pouchdb-errors'
import { forDocument, forSequence } from './keys'

export default function (db, id, opts, callback) {
  db.storage.get(forDocument(id), (error, meta) => {
    if (error || meta === null) {
      return callback(createError(
        MISSING_DOC, error.message || 'missing-read-error'))
    }

    const rev = opts.rev || (meta && meta.rev)
    if (!meta || (meta.deleted && !opts.rev) || !(rev in meta.rev_map)) {
      return callback(createError(MISSING_DOC, 'missing'))
    }

    db.storage.get(forSequence(meta.rev_map[rev]), (error, doc) => {
      if (error) {
        return callback(createError(
          MISSING_DOC, error.message || 'missing-read-error'))
      }

      callback(null, {doc, metadata: meta})
    })
  })
}
