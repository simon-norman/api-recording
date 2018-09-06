
const config = {
  development: {
    recordingDatabase: {
      uri: 'mongodb://localhost:27017/test_recording_database',
    },
  },

  test: {
    recordingDatabase: {
      uri: process.env.RECORDING_DATABASE_URI,
    },
  },

  qa: {
    recordingDatabase: {
      uri: process.env.RECORDING_DATABASE_URI,
    },
  },

  production: {
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
