pouchdb-asyncstorage-down
====

Usage
---

You should be able to just do:

    npm install --save pouchdb-asyncstorage-down

Then require it after PouchDB:

```js
const PouchDB = require('pouchdb')
require('pouchdb-async-storage')

const db = new PouchDB('mydb', {adapter: 'asyncstorage'})
```
