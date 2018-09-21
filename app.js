
const startApp = require('./app_startup');
const RavenWrapperFactory = require('raven-wrapper');
const { getConfigForEnvironment } = require('./config/config.js');

const errorLoggingConfig = getConfigForEnvironment(process.env.NODE_ENV).errorLogging;
errorLoggingConfig.environment = process.env.NODE_ENV;

const { wrapperToHandleUnhandledExceptions } = RavenWrapperFactory(errorLoggingConfig);
wrapperToHandleUnhandledExceptions(() => {
  startApp();
});

