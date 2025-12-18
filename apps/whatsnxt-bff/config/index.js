/**
 * Module dependencies.
 */

const path = require('path');
const dev = require('./env/dev');
const prod = require('./env/prod');
const test = require('./env/test');
const local = require('./env/local');
const docker = require('./env/docker');
const defaults = {
  root: path.normalize(__dirname + '/..')
};

/**
 * Expose
 */

module.exports = {
  local: Object.assign({}, local, defaults),
  docker: Object.assign({}, docker, defaults),
  dev: Object.assign({}, dev, defaults),
  test: Object.assign({}, test, defaults),
  prod: Object.assign({}, prod, defaults)
}[process.env.NODE_ENV || 'local'];
