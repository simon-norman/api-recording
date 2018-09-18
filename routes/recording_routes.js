const express = require('express');

module.exports = (recordingController) => {
  const router = express.Router();

  router.get('/recordings/', recordingController.getRecordingsBySpaceIdAndTimeframe);

  return router;
};
