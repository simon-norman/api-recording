
const { wireUpApp } = require('./dependency_injection/app_wiring');
const { getConfigForEnvironment } = require('./config/config.js');
const LoggerFactory = require('./services/error_handling/logger/logger.js');
const mongoose = require('mongoose');

let config;
let promiseToLoadApp;

const connectToDatabase = () =>
  mongoose.connect(config.recordingDatabase.uri, { useNewUrlParser: true });

const startApp = async () => {
  try {
    config = getConfigForEnvironment(process.env.NODE_ENV);

    await connectToDatabase();

    const diContainer = wireUpApp();

    return diContainer.getDependency('server');
  } catch (error) {
    throw error;
  }
};

const { wrapperToHandleUnhandledExceptions } = LoggerFactory(process.env.NODE_ENV);
wrapperToHandleUnhandledExceptions(() => {
  promiseToLoadApp = startApp();
});

module.exports = promiseToLoadApp;
