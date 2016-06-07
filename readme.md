*** New Version ***

with the new sub-packages in PouchDB 5.4.0 there is a new structure.

Adapter
====
https://github.com/stockulus/pouchdb-asyncstorage-down/tree/master/packages/pouchdb-adapter-asyncstorage
https://www.npmjs.com/package/pouchdb-adapter-asyncstorage

Bundle
====

https://github.com/stockulus/pouchdb-asyncstorage-down/tree/master/packages/pouchdb-react-native
https://www.npmjs.com/package/pouchdb-react-native

For details on PouchDB sub-packages, see the [Custom Builds documentation](http://pouchdb.com/custom.html).

*** Old Readme ***

pouchdb-asyncstorage-down
====

Adds an async storage Adapter to the PouchDB + Polifills core-js that PouchDB with leveldown Adapter is running with react-native

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

Sample App
---
there is a small example app:
https://github.com/stockulus/pouchdb-asyncstorage-down/tree/master/example

Tests
---
Currently done manually by me, not sure how to easy simulate a running IOS / Android device

Currently working on getting tests running, but a little struggling in running react-native as node tests

Contact
---
Feedback welcome:
Twitter: @stockulus
