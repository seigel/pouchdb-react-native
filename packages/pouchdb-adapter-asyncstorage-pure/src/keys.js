'use strict'

import leftPad from 'left-pad'

const DOC_STORE = 'ÿdocument-storeÿ'
const DOC_STORE_LENGTH = DOC_STORE.length
const META_STORE = 'ÿmeta-storeÿ'
const SEQUENCE_STORE = 'ÿby-sequenceÿ'

export const forDocument = id => `${DOC_STORE}${id}`
export const forMeta = id => `${META_STORE}${id}`
export const forSequence = seq => `${SEQUENCE_STORE}${leftPad(seq, 16, 0)}`

export const toDocumentKeys = list => list.map(forDocument)

export const getDocumentKeys = list => list
  .filter(key => key.startsWith(DOC_STORE))
  .map(key => key.slice(DOC_STORE_LENGTH))
