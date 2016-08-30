'use strict'

import leftPad from 'left-pad'

const DOC_STORE = 'ÿdocument-storeÿ'
const DOC_STORE_LENGTH = DOC_STORE.length
const META_STORE = 'ÿmeta-storeÿ'
const SEQUENCE_STORE = 'ÿby-sequenceÿ'

const forDocument = id => `${DOC_STORE}${id}`
const forMeta = id => `${META_STORE}${id}`
const forSequence = seq => `${SEQUENCE_STORE}${leftPad(seq, 16, 0)}`

const getDocumentKeys = list => list
  .filter(key => key.startsWith(DOC_STORE))
  .map(key => key.slice(DOC_STORE_LENGTH))

const toDocumentKeys = list => list.map(forDocument)

export default {
  forDocument,
  forMeta,
  forSequence,
  getDocumentKeys,
  toDocumentKeys
}
