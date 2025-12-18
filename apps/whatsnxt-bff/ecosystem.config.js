require('dotenv').config();
const dotenv = require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` })

module.exports = {
  apps: [
    {
      name: 'backend-app',
      script: 'server.js',

      // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
      instances: 2,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    }
  ]
};
