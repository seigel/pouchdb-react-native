'use strict'

const DOC_STORE = 'ÿdocument-storeÿ'
const META_STORE = 'ÿmeta-storeÿ'

const forDocument = (id) => `${DOC_STORE}${id}`
const forMeta = (id) => `${META_STORE}${id}`

export default {
  forDocument,
  forMeta
}
