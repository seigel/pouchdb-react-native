![Logo](https://raw.githubusercontent.com/stockulus/pouchdb-react-native/master/static/pouchdb-react-native.png)

[![bitHound Overall Score](https://www.bithound.io/github/stockulus/pouchdb-react-native/badges/score.svg)](https://www.bithound.io/github/stockulus/pouchdb-react-native) [![npm Package](https://img.shields.io/npm/dm/pouchdb-react-native.svg)](https://www.npmjs.com/package/pouchdb-react-native) [![travis-ci.org](https://travis-ci.org/stockulus/pouchdb-react-native.svg)](https://travis-ci.org/stockulus/pouchdb-react-native) [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/) [![license](https://img.shields.io/npm/l/pouchdb-react-native.svg?maxAge=2592000)](https://opensource.org/licenses/MIT)

pouchdb-react-native
======

PouchDB, the ReactNative-only edition. A preset representing the PouchDB code that runs in ReactNative.

The `pouchdb-react-native` preset contains the version of PouchDB that is designed for ReactNative. In particular, it ships with the AsyncStorage adapters as its default adapters. It also contains the replication, HTTP, and map/reduce plugins.

### Usage

```bash
npm install pouchdb-react-native --save
```

```js
import PouchDB from 'pouchdb-react-native'
const db = new PouchDB('mydb')

// use PouchDB
db.get('4711')
  .then(doc => console.log(doc))

```
For full API documentation and guides on PouchDB, see [PouchDB.com](http://pouchdb.com/).

### Sample App
there is a small example app:
https://github.com/stockulus/pouchdb-react-native/tree/master/example

pouchdb-adapter-asyncstorage
======

PouchDB adapter using AsyncStorage as its data store. Designed to run in ReactNative. Its adapter name is `'asyncstorage'`.

### Usage

```bash
npm install pouchdb-adapter-asyncstorage --save
```

```js
import PouchDB from 'pouchdb-core'
PouchDB.plugin(require('pouchdb-adapter-asyncstorage').default)
const db = new PouchDB('mydb', {adapter: 'asyncstorage'})

// use PouchDB
db.get('4711')
  .then(doc => console.log(doc))

```

development
======
```bash
git clone https://github.com/stockulus/pouchdb-react-native.git
cd pouchdb-react-native
npm install
npm test
cd example
npm run ios

```

---
[![Twitter URL](https://img.shields.io/twitter/url/http/shields.io.svg?style=social&maxAge=2592000)](https://twitter.com/stockulus) [![GitHub stars](https://img.shields.io/github/stars/stockulus/pouchdb-react-native.svg?style=social&label=Star)](https://github.com/stockulus/pouchdb-react-native)
