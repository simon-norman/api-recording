
const router = require('express').Router();

module.exports = (recordingRoutes) => {
  router.use('/recordings', recordingRoutes);

  return router;
};

