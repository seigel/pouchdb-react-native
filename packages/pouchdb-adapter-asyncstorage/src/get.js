'use strict'

import {
  createError,
  MISSING_DOC } from 'pouchdb-errors'
import { forDocument, forSequence } from './keys'
import { winningRev } from 'pouchdb-merge'

export default function (db, id, opts, callback) {
  db.storage.get(forDocument(id), (error, meta) => {
    if (error) {
      return callback(createError(MISSING_DOC, error.message || 'missing-read-error'))
    }
    if (meta === null) {
      return callback(createError(MISSING_DOC, 'missing-no-meta-found'))
    }

    const rev = opts.rev || winningRev(meta)
    if (!meta || (meta.deleted && !opts.rev) || !(rev in meta.rev_map)) {
      return callback(createError(MISSING_DOC, 'missing-rev-check'))
    }

    db.storage.get(forSequence(meta.rev_map[rev]), (error, doc) => {
      if (error) {
        return callback(createError(
          MISSING_DOC, error.message || 'missing-read-error'))
      }

      return callback(null, {doc, metadata: meta})
    })
  })
}
