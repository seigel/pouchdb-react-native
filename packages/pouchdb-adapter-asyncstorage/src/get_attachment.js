'use strict'

import { createError, MISSING_DOC } from 'pouchdb-errors'
import { forAttachment } from './keys'

export default function (db, docId, attachId, attachment, opts, callback) {
  const digest = attachment.digest
  const type = attachment.content_type

  db.storage.get(forAttachment(digest), (error, data) => {
    if (error) {
      return callback(createError(
        MISSING_DOC, error.message || 'missing-read-error'))
    }

    if (!data || !data.data) {
      return callback(null,
        opts.binary
          ? getEmptyBuffer(type)
          : '')
    }

    callback(null,
      opts.binary
        ? getBuffer(data.data, type)
        : data.data
    )
  })
}

const getEmptyBuffer = type => {
  const buffer = global.Buffer.alloc(0, null, type)
  buffer.type = type
  return buffer
}

const getBuffer = (base64Data, type) => {
  const buffer = global.Buffer.from(base64Data, 'base64')
  buffer.type = type
  return buffer
}
