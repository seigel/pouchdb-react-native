#!/bin/bash

PASS=(
  pouchdb-original/tests/integration/test.all_docs.js
  pouchdb-original/tests/integration/test.bulk_get.js
  pouchdb-original/tests/integration/test.constructor.js
  pouchdb-original/tests/integration/test.defaults.js
  pouchdb-original/tests/integration/test.design_docs.js
  pouchdb-original/tests/integration/test.http.js
  pouchdb-original/tests/integration/test.issue1175.js
  pouchdb-original/tests/integration/test.issue221.js
  pouchdb-original/tests/integration/test.node-websql.js
  pouchdb-original/tests/integration/test.replicationBackoff.js
  pouchdb-original/tests/integration/test.replication_events.js
  pouchdb-original/tests/integration/test.revs_diff.js
  pouchdb-original/tests/integration/test.setup_global_hooks.js
  pouchdb-original/tests/integration/test.slash_id.js
  pouchdb-original/tests/integration/test.sync_events.js
  pouchdb-original/tests/integration/test.taskqueue.js
  pouchdb-original/tests/integration/test.uuids.js
)

node_modules/.bin/mocha --timeout 5000 -r tests/setup.js ${PASS[@]}
