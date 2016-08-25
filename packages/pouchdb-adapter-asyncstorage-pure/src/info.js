'use strict'

export default function (db, callback) {
  callback(null, {doc_count: db.meta.doc_count, update_seq: db.meta.update_seq})
}
