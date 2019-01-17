
const { wireUpApp } = require('./dependency_injection/app_wiring');
const { getConfigForEnvironment } = require('./config/config.js');
const mongoose = require('mongoose');

let config;

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

module.exports = startApp;
