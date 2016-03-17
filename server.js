#!/usr/bin/env node
process.env.NODE_CONFIG_DIR = require('path').resolve(__dirname, 'config');

require('./lib/ServerInvoker.js');