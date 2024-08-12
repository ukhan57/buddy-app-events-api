// src/logger.js

const options = { level: process.env.LOG_LEVEL || 'warn' }; 

if (options.level === 'debug') {
  options.transport = {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  };
}

module.exports = require('pino')(options);



// Create and export a Pino Logger instance:
// https://getpino.io/#/docs/api?id=logger
module.exports = require('pino')(options);
