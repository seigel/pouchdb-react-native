'use strict'

const DOC_STORE = 'ÿdocument-storeÿ'
const DOC_STORE_LENGTH = DOC_STORE.length
const META_STORE = 'ÿmeta-storeÿ'

const forDocument = id => `${DOC_STORE}${id}`
const forMeta = id => `${META_STORE}${id}`
const toDocuments = list => {
  return list
    .filter(key => key.startsWith(DOC_STORE))
    .map(key => key.slice(DOC_STORE_LENGTH))
}

export default {
  forDocument,
  forMeta,
  toDocuments
}
