
const router = require('express').Router();

module.exports = (recordingRoutes) => {
  router.use(recordingRoutes);

  return router;
};

