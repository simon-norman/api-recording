const express = require('express');

module.exports = (getRecordingController) => {
  const router = express.Router();

  router.get('/', getRecordingController.getRecordingsBySpaceIdAndTimeframe);

  return router;
};
