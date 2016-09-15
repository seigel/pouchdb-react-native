#!/bin/bash

for test in pouchdb-original/tests/integration/test.*.js;
do
  node_modules/.bin/mocha --timeout 5000 -r tests/setup.js $test &> /dev/null

  if [[ $? == 0 ]]; then
    echo $test
  fi
done
