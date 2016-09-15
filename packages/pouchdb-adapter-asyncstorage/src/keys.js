'use strict'

import leftPad from 'left-pad'

const DOC_STORE = 'ÿdocument-storeÿ'
const DOC_STORE_LENGTH = DOC_STORE.length
const META_STORE = 'ÿmeta-storeÿ'
const META_STORE_LENGTH = META_STORE.length
const ATTACHMENT_STORE = 'ÿattachment-binary-storeÿ'
const SEQUENCE_STORE = 'ÿby-sequenceÿ'
const SEQUENCE_STORE_LENGTH = SEQUENCE_STORE.length

export const forDocument = id => `${DOC_STORE}${id}`
export const forAttachment = digest => `${ATTACHMENT_STORE}${digest}`
export const forMeta = key => `${META_STORE}${key}`
export const forSequence = seq => `${SEQUENCE_STORE}${leftPad(seq, 16, 0)}`

export const sliceDocument = id => id.slice(DOC_STORE_LENGTH)
export const sliceMeta = id => id.slice(META_STORE_LENGTH)

export const toDocumentKeys = list => list.map(forDocument)
export const toMetaKeys = list => list.map(forMeta)
export const toSequenceKeys = list => list.map(forSequence)

export const getDocumentKeys = list => list
  .filter(key => key.startsWith(DOC_STORE) && !key.startsWith(`${DOC_STORE}_local`))
  .map(key => key.slice(DOC_STORE_LENGTH))

export const getSequenceKeys = list => list
  .filter(key => key.startsWith(SEQUENCE_STORE))
  .map(key => parseInt(key.slice(SEQUENCE_STORE_LENGTH), 10))
