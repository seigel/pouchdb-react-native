'use strict'

const SEPERATOR = 'ÿ'
const DOC_STORE = 'document-store'
const META_STORE = 'meta-store'

const forDocument = (id) => `${SEPERATOR}${DOC_STORE}${SEPERATOR}${id}`

export default {
  DOC_STORE,
  META_STORE,
  forDocument
}
