
const config = {
  development: {
    webServer: {
      port: 3000,
    },
    recordingDatabase: {
      uri: 'mongodb://localhost:27017/tracking_app_dev',
    },
  },

  test: {
    webServer: {
      port: process.env.PORT,
    },
    recordingDatabase: {
      uri: process.env.RECORDING_DATABASE_URI,
    },
  },

  qa: {
    webServer: {
      port: process.env.PORT,
    },
    recordingDatabase: {
      uri: process.env.RECORDING_DATABASE_URI,
    },
  },

  production: {
    webServer: {
      port: process.env.PORT,
    },
    recordingDatabase: {
      uri: process.env.RECORDING_DATABASE_URI,
    },
  },
};

const getConfigForEnvironment = (environment) => {
  if (config[environment]) {
    return config[environment];
  }
  throw new Error(`Environment titled ${environment} was not found`);
};

module.exports = { getConfigForEnvironment };
