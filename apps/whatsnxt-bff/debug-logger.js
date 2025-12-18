
const loggerModule = require('./config/logger');
console.log('Logger module keys:', Object.keys(loggerModule));
console.log('Has getLogger:', typeof loggerModule.getLogger);
