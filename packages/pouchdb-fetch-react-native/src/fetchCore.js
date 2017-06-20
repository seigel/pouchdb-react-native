'use strict';

import {
  clone,
  assign,
}  from 'pouchdb-utils';
import Promise  from 'pouchdb-promise';
import { generateErrorFromResponse }  from 'pouchdb-errors';

/* global fetch */
/* global Headers */
function wrappedFetch() {
  const wrappedPromise = {};

  const promise = new Promise(function (resolve, reject) {
    wrappedPromise.resolve = resolve;
    wrappedPromise.reject = reject;
  });

  const args = new Array(arguments.length);

  for (const i = 0; i < args.length; i++) {
    args[i] = arguments[i];
  }

  wrappedPromise.promise = promise;

  Promise.resolve().then(function () {
    return fetch.apply(null, args);
  }).then(function (response) {
    wrappedPromise.resolve(response);
  }).catch(function (error) {
    wrappedPromise.reject(error);
  });

  return wrappedPromise;
}

function fetchRequest(options, callback) {
  let wrappedPromise, timer, response;

  const headers = {}

  const fetchOptions = {
    method: options.method,
    credentials: 'include',
    headers: headers
  };

  if (options.json) {
    headers['Accept'] ='application/json';
    headers['Content-Type'] = options.headers['Content-Type'] || 'application/json';
  }

  if (options.body &&
      options.processData &&
      typeof options.body !== 'string') {
    fetchOptions.body = JSON.stringify(options.body);
  } else if ('body' in options) {
    fetchOptions.body = options.body;
  } else {
    fetchOptions.body = null;
  }

  Object.keys(options.headers).forEach(function (key) {
    if (options.headers.hasOwnProperty(key)) {
      headers[key] = options.headers[key];
    }
  });

  wrappedPromise = wrappedFetch(options.url, fetchOptions);

  if (options.timeout > 0) {
    timer = setTimeout(function () {
      wrappedPromise.reject(new Error('Load timeout for resource: ' +
        options.url));
    }, options.timeout);
  }

  wrappedPromise.promise.then(function (fetchResponse) {
    response = {
      statusCode: fetchResponse.status
    };

    if (options.timeout > 0) {
      clearTimeout(timer);
    }

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return options.binary ? fetchResponse.blob() : fetchResponse.text();
    }

    return fetchResponse.json();
  }).then(function (result) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      callback(null, response, result);
    } else {
      result.status = response.statusCode;
      callback(result);
    }
  }).catch(function (error) {
    if (!error) {
      // this happens when the listener is canceled
      error = new Error('canceled');
    }
    callback(error);
  });

  return {abort: wrappedPromise.reject};
}

// the blob already has a type; do nothing
const res = function () {};

function defaultBody() {
  return '';
}

function fetchCore(options, callback) {

  options = clone(options);

  const defaultOptions = {
    method : "GET",
    headers: {},
    json: true,
    processData: true,
    timeout: 10000,
    cache: false
  };

  options = {...defaultOptions, ...options } //assign(defaultOptions, options);

  function onSuccess(obj, resp, cb) {
    if (!options.binary && options.json && typeof obj === 'string') {
      /* istanbul ignore next */
      try {
        obj = JSON.parse(obj);
      } catch (e) {
        // Probably a malformed JSON from server
        return cb(e);
      }
    }
    if (Array.isArray(obj)) {
      obj = obj.map(function (v) {
        if (v.error || v.missing) {
          return generateErrorFromResponse(v);
        } else {
          return v;
        }
      });
    }
    if (options.binary) {
      res(obj, resp);
    }
    cb(null, obj, resp);
  }

  if (options.json) {
    if (!options.binary) {
      options.headers.Accept = 'application/json';
    }
    options.headers['Content-Type'] = options.headers['Content-Type'] ||
      'application/json';
  }

  if (options.binary) {
    options.encoding = null;
    options.json = false;
  }

  if (!options.processData) {
    options.json = false;
  }

  return fetchRequest(options, function (err, response, body) {

    if (err) {
      return callback(generateErrorFromResponse(err));
    }

    let error;
    const content_type = response.headers && response.headers['content-type'];
    let data = body || defaultBody();

    // CouchDB doesn't always return the right content-type for JSON data, so
    // we check for ^{ and }$ (ignoring leading/trailing whitespace)
    if (!options.binary && (options.json || !options.processData) &&
        typeof data !== 'object' &&
        (/json/.test(content_type) ||
         (/^[\s]*\{/.test(data) && /\}[\s]*$/.test(data)))) {
      try {
        data = JSON.parse(data.toString());
      } catch (e) {}
    }

    if (response.statusCode >= 200 && response.statusCode < 300) {
      onSuccess(data, response, callback);
    } else {
      error = generateErrorFromResponse(data);
      error.status = response.statusCode;
      callback(error);
    }
  });
}

export default fetchCore;
