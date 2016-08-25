import { isLocalId, winningRev } from 'pouchdb-merge'
import { obj as through } from 'through2'

var UPDATE_SEQ_KEY = '_local_last_update_seq'
var DOC_COUNT_KEY = '_local_doc_count'
var UUID_KEY = '_local_uuid'

function formatSeq (n) {
  return ('0000000000000000' + n).slice(-16)
}

var localAndMetaStores = function (db, stores, callback) {
  var batches = []
  stores.bySeqStore.get(UUID_KEY, function (err, value) {
    if (err) {
      // no uuid key, so don't need to migrate;
      return callback()
    }
    batches.push({
      key: UUID_KEY,
      value: value,
      prefix: stores.metaStore,
      type: 'put',
      valueEncoding: 'json'
    })
    batches.push({
      key: UUID_KEY,
      prefix: stores.bySeqStore,
      type: 'del'
    })
    stores.bySeqStore.get(DOC_COUNT_KEY, function (err, value) {
      if (err) {
        return callback(err)
      }

      if (value) {
        // if no doc count key,
        // just skip
        // we can live with this
        batches.push({
          key: DOC_COUNT_KEY,
          value: value,
          prefix: stores.metaStore,
          type: 'put',
          valueEncoding: 'json'
        })
        batches.push({
          key: DOC_COUNT_KEY,
          prefix: stores.bySeqStore,
          type: 'del'
        })
      }
      stores.bySeqStore.get(UPDATE_SEQ_KEY, function (err, value) {
        if (err) {
          return callback(err)
        }

        if (value) {
          // if no UPDATE_SEQ_KEY
          // just skip
          // we've gone to far to stop.
          batches.push({
            key: UPDATE_SEQ_KEY,
            value: value,
            prefix: stores.metaStore,
            type: 'put',
            valueEncoding: 'json'
          })
          batches.push({
            key: UPDATE_SEQ_KEY,
            prefix: stores.bySeqStore,
            type: 'del'
          })
        }
        var deletedSeqs = {}
        stores.docStore.createReadStream({
          startKey: '_',
          endKey: '_\xFF'
        }).pipe(through(function (ch, _, next) {
          if (!isLocalId(ch.key)) {
            return next()
          }
          batches.push({
            key: ch.key,
            prefix: stores.docStore,
            type: 'del'
          })
          var winner = winningRev(ch.value)
          Object.keys(ch.value.rev_map).forEach(function (key) {
            if (key !== 'winner') {
              this.push(formatSeq(ch.value.rev_map[key]))
            }
          }, this)
          var winningSeq = ch.value.rev_map[winner]
          stores.bySeqStore.get(formatSeq(winningSeq), function (err, value) {
            if (!err) {
              batches.push({
                key: ch.key,
                value: value,
                prefix: stores.localStore,
                type: 'put',
                valueEncoding: 'json'
              })
            }
            next()
          })
        })).pipe(through(function (seq, _, next) {
          /* istanbul ignore if */
          if (deletedSeqs[seq]) {
            return next()
          }
          deletedSeqs[seq] = true
          stores.bySeqStore.get(seq, function (err, resp) {
            /* istanbul ignore if */
            if (err || !isLocalId(resp._id)) {
              return next()
            }
            batches.push({
              key: seq,
              prefix: stores.bySeqStore,
              type: 'del'
            })
            next()
          })
        }, function () {
          db.batch(batches, callback)
        }))
      })
    })
  })
}

var toSublevel = function (name, db, callback) {
  process.nextTick(function () {
    callback()
  })
}

export default {
  toSublevel: toSublevel,
  localAndMetaStores: localAndMetaStores
}
