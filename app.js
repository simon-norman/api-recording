
const { wireUpApp } = require('./dependency_injection/app_wiring');
const { getConfigForEnvironment } = require('./config/config.js');
const LoggerFactory = require('./services/error_handling/logger/logger.js');
const mongoose = require('mongoose');

let app;
let config;

const connectToDatabase = () =>
  mongoose.connect(config.recordingDatabase.uri, { useNewUrlParser: true });

const startApp = async () => {
  try {
    wireUpApp();

    config = getConfigForEnvironment(process.env.NODE_ENV);

    await connectToDatabase();
  } catch (error) {
    console.log(error);
  }
};

const { wrapperToHandleUnhandledExceptions } = LoggerFactory(process.env.NODE_ENV);
wrapperToHandleUnhandledExceptions(() => {
  startApp();
});

module.exports = app;
