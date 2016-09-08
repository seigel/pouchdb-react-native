'use strict'

import { btoa, readAsBinaryString } from 'pouchdb-binary-utils'
import { createError, MISSING_DOC } from 'pouchdb-errors'
import { forDocument, forSequence, forBinaryAttachment } from './keys'

export default function (db, docId, attachId, attachment, opts, callback) {
  db.storage.get(forDocument(docId), (error, meta) => {
    if (error) {
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
      const digest = rev._attachments[attachId].digest

      db.storage.get(forBinaryAttachment(digest), (error, attachment) => {
        if (error) {
          return callback(createError(
            MISSING_DOC, error.message || 'missing-attachment-read-error'))
        }

        if (opts.binary) {
          return callback(null, attachment)
        }

        readAsBinaryString(attachment, binString => {
          callback(null, btoa(binString))
        })
      })
    })
  })
}
