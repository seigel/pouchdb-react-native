'use strict'

import { forAttachment } from './keys'

export default function (db, dataDocs, {binaryAttachments}, callback) {
  const attachmentKeys = dataDocs.reduce((res, data) => {
    data && data._attachments && Object.keys(data._attachments).forEach(key => {
      res.push(forAttachment(data._attachments[key].digest))
    })
    return res
  }, [])

  db.storage.multiGet(attachmentKeys, (error, attachments) => {
    if (error) return callback(error)

    const attachmentObj = attachments.reduce(
      (res, attachment) => {
        if (attachment) res[attachment.digest] = attachment
        return res
      }, {})

    dataDocs.forEach(doc => {
      doc && doc._attachments && Object.keys(doc._attachments).forEach(key => {
        const newAttachment = attachmentObj[doc._attachments[key].digest]
        if (newAttachment) {
          doc._attachments[key] = newAttachment
          if (binaryAttachments) {
            doc._attachments[key].data = doc._attachments[key].data
              ? global.Buffer.from(doc._attachments[key].data, 'base64')
              : global.Buffer.alloc(0)
            doc._attachments[key].data.type = doc._attachments[key].content_type
          }
        }
      })
    })

    callback()
  })
}
