
const config = {
  development: {
    webServer: {
      port: 3000,
    },
    recordingDatabase: {
      uri: 'mongodb://localhost:27017/tracking_app_dev',
    },
    errorLogging: {
      environment: '',
      ravenConfig: {
        dsn: process.env.RAVEN_DSN,
        options: {
          captureUnhandledRejections: true,
        },
      },
    },
  },

  test: {
    webServer: {
      port: process.env.PORT,
    },
    recordingDatabase: {
      uri: process.env.RECORDING_DATABASE_URI,
    },
    errorLogging: {
      environment: '',
      ravenConfig: {
        dsn: process.env.RAVEN_DSN,
        options: {
          captureUnhandledRejections: true,
        },
      },
    },
  },

  qa: {
    webServer: {
      port: process.env.PORT,
    },
    recordingDatabase: {
      uri: process.env.RECORDING_DATABASE_URI,
    },
    errorLogging: {
      environment: '',
      ravenConfig: {
        dsn: process.env.RAVEN_DSN,
        options: {
          captureUnhandledRejections: true,
        },
      },
    },
  },

  production: {
    webServer: {
      port: process.env.PORT,
    },
    recordingDatabase: {
      uri: process.env.RECORDING_DATABASE_URI,
    },
    errorLogging: {
      environment: '',
      ravenConfig: {
        dsn: process.env.RAVEN_DSN,
        options: {
          captureUnhandledRejections: true,
        },
      },
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
