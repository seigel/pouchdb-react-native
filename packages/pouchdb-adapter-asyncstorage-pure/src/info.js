'use strict'

export default function (db, api, callback) {
  callback(null, {doc_count: db.meta.doc_count, update_seq: db.meta.update_seq})
}
