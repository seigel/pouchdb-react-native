pouchdb-asyncstorage-down
====

Adds an async storage Adapter to the PouchDB + Polifills core-js that PouchDB with leveldown Adapter is running in reacti-native

Usage
---

You should be able to just do:

    npm install pouchdb-asyncstorage-down --save

Then require it after PouchDB:

```js
const PouchDB = require('pouchdb')
require('pouchdb-asyncstorage-down')

const db = new PouchDB('mydb', {adapter: 'asyncstorage'})

// or import style

import PouchDB from 'pouchdb'
import 'pouchdb-asyncstorage-down'

const db = new PouchDB('mydb', {adapter: 'asyncstorage'})
```

Tests
---
Currently done manually by me, not sure how to easy simulate a running IOS / Android device

Contact
---
Feedback welcome:
Twitter: @stockulus
