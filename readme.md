pouchdb-asyncstorage-down
====

Adds an async storage Adapter to the PouchDB + Polifills core-js the PouchDB is running in reacti-native

Usage
---

You should be able to just do:

    npm install --save pouchdb-asyncstorage-down

Then require it after PouchDB:

```js
const PouchDB = require('pouchdb')
require('pouchdb-asyncstorage-down')

const db = new PouchDB('mydb', {adapter: 'asyncstorage'})
```
