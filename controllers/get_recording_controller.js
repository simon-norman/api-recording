

module.exports = (Recording) => {
  const getRecordingController = {};

  const checkSpaceIdTimeframeValuesValid = (params) => {
    const spaceIdTimeframeUndefinedErrors = [];
    if (!params.startTime) {
      spaceIdTimeframeUndefinedErrors.push('No start time passed to get recordings');
    }

    if (!params.endTime) {
      spaceIdTimeframeUndefinedErrors.push('No end time passed to get recordings');
    }

    if (!params.spaceId) {
      spaceIdTimeframeUndefinedErrors.push('No space Id passed to get recordings');
    }

    if (spaceIdTimeframeUndefinedErrors.length) {
      const error = new Error(spaceIdTimeframeUndefinedErrors.join('; '));
      error.status = 422;
      throw error;
    }
  };

  const checkTimeframeLessThan30Mins = (params) => {
    if ((params.endTime - params.startTime) > 1800000) {
      const error = new Error('Timeframe is invalid as it is more than 30 minutes');
      error.status = 422;
      throw error;
    }
  };

  const checkSpaceIdAndTimeframeParams = (params) => {
    checkSpaceIdTimeframeValuesValid(params);

    checkTimeframeLessThan30Mins(params);
  };

  getRecordingController.getRecordingsBySpaceIdAndTimeframe = async (request, response, next) => {
    try {
      checkSpaceIdAndTimeframeParams(request.params);
      const recordings = await Recording.find({
        spaceId: request.params.spaceId,
        timestampRecorded: { $gte: request.params.startTime, $lt: request.params.endTime },
      });

      if (recordings.length) {
        response.status(200).json(recordings);
      } else {
        const error = new Error('Recordings not found');
        error.status = 404;
        next(error);
      }
    } catch (error) {
      next(error);
    }
  };

  return getRecordingController;
};
