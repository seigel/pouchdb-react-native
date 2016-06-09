![PouchDB Logo](https://pouchdb.com/static/img/mark.svg)
![React Native Logo](http://facebook.github.io/react-native/img/opengraph.png?2)
pouchdb-react-native
======

PouchDB, the ReactNative-only edition. A preset representing the PouchDB code that runs in ReactNative, without any of the code required to run it in Node.js.

The `pouchdb-react-native` preset contains the version of PouchDB that is designed for ReactNative. In particular, it ships with the AsyncStorage adapters as its default adapters. It also contains the replication, HTTP, and map/reduce plugins.

Use this preset if you only want to use PouchDB in ReactNative,
and don't want to use it in Node.js. (E.g. to avoid installing LevelDB.)

### Usage

```bash
npm install pouchdb-react-native --save
```

```js
import PouchDB from 'pouchdb-react-native'
const db = new PouchDB('mydb')
```

### Sample App
there is a small example app:
https://github.com/stockulus/pouchdb-asyncstorage-down/tree/master/example

```bash
npm install && npm run ios
```
pouchdb-adapter-localstorage
======

PouchDB adapter using AsyncStorage as its data store. Designed to run in ReactNative. Its adapter name is `'asyncstorage'`.

### Usage

```bash
npm install pouchdb-adapter-asyncstorage --save
```

```js
PouchDB.plugin(require('pouchdb-adapter-asyncstorage').default)
var db = new PouchDB('mydb', {adapter: 'asyncstorage'})
```

---
Feedback welcome:
Twitter: [@stockulus](https://twitter.com/stockulus)
