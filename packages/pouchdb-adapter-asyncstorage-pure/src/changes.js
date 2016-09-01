'use strict'

import { uuid } from 'pouchdb-utils'

export default function (db, api, opts) {
  const continuous = opts.continuous

  if (continuous) {
    const id = db.opts.name + ':' + uuid()
    db.changes.addListener(db.opts.name, id, api, opts)
    db.changes.notify(db.opts.name)
    return {
      cancel () {
        db.changes.removeListener(db.opts.name, id)
      }
    }
  }
}
