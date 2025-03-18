/* eslint-disable func-names */
/* eslint-disable no-param-reassign */
/* eslint-disable no-prototype-builtins */
const http = require('http');
const https = require('https');

// set the time (in seconds) for connection to be alive
const keepAliveTimeout = 30000;

if (http.globalAgent && http.globalAgent.hasOwnProperty('keepAlive')) {
  http.globalAgent.keepAlive = true;
  https.globalAgent.keepAlive = true;
  http.globalAgent.keepAliveMsecs = keepAliveTimeout;
  https.globalAgent.keepAliveMsecs = keepAliveTimeout;
} else {
  const agent = new http.Agent({
    keepAlive: true,
    keepAliveMsecs: keepAliveTimeout,
  });

  const secureAgent = new https.Agent({
    keepAlive: true,
    keepAliveMsecs: keepAliveTimeout,
  });

  const httpRequest = http.request;
  const httpsRequest = https.request;

  http.request = function (options, callback) {
    if (options.protocol === 'https:') {
      options.agent = secureAgent;
      return httpsRequest(options, callback);
    }

    options.agent = agent;
    return httpRequest(options, callback);
  };
}
