const express = require('express');

module.exports = (getRecordingController, saveRecordingController) => {
  const router = express.Router();

  router.get('/', getRecordingController.getRecordingsBySpaceIdAndTimeframe);

  router.post('/', saveRecordingController.saveRecordings);

  return router;
};
