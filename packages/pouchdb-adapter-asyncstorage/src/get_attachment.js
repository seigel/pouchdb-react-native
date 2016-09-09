'use strict'

import { createError, MISSING_DOC } from 'pouchdb-errors'
import { forBinaryAttachment } from './keys'

export default function (db, docId, attachId, attachment, opts, callback) {
  const digest = attachment.digest
  const type = attachment.content_type

  db.storage.get(forBinaryAttachment(digest), (error, data) => {
    if (error) {
      return callback(createError(
        MISSING_DOC, error.message || 'missing-read-error'))
    }

    if (!data || !data.data) {
      return callback(null,
        opts.binary
          ? global.Buffer.alloc(0, null, type)
          : '')
    }

    callback(null,
      opts.binary
        ? global.Buffer.alloc(11, data.data, 'base64')
        : data.data
    )
  })
}
