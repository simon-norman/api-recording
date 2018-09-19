
const startApp = require('./app_startup');
const LoggerFactory = require('./services/error_handling/logger/logger.js');


const { wrapperToHandleUnhandledExceptions } = LoggerFactory(process.env.NODE_ENV);
wrapperToHandleUnhandledExceptions(() => {
  startApp();
});

