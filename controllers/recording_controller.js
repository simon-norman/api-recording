

module.exports = (Recording) => {
  const getRecordingController = {};

  const checkSpaceIdTimeframeValuesValid = (query) => {
    const spaceIdTimeframeUndefinedErrors = [];
    if (!query.startTime) {
      spaceIdTimeframeUndefinedErrors.push('No start time passed to get recordings');
    }

    if (!query.endTime) {
      spaceIdTimeframeUndefinedErrors.push('No end time passed to get recordings');
    }

    if (!query.spaceId) {
      spaceIdTimeframeUndefinedErrors.push('No space Id passed to get recordings');
    }

    if (spaceIdTimeframeUndefinedErrors.length) {
      const error = new Error(spaceIdTimeframeUndefinedErrors.join('; '));
      error.status = 422;
      throw error;
    }
  };

  const checkTimeframeLessThan30Mins = (query) => {
    if ((query.endTime - query.startTime) > 1800000) {
      const error = new Error('Timeframe is invalid as it is more than 30 minutes');
      error.status = 422;
      throw error;
    }
  };

  const checkSpaceIdAndTimeframeQueryValues = (query) => {
    checkSpaceIdTimeframeValuesValid(query);

    checkTimeframeLessThan30Mins(query);
  };

  const getTimestampRecordedQuery = (query) => {
    const startTimeAsDate = new Date(parseInt(query.startTime, 10));
    const endTimeAsDate = new Date(parseInt(query.endTime, 10));

    return { $gte: startTimeAsDate, $lt: endTimeAsDate };
  };

  getRecordingController.getRecordingsBySpaceIdAndTimeframe = async (request, response, next) => {
    try {
      const { query } = request;
      checkSpaceIdAndTimeframeQueryValues(query);

      const timestampRecordedQuery = getTimestampRecordedQuery(query);

      const recordings = await Recording.find({
        spaceIds: query.spaceId,
        timestampRecorded: timestampRecordedQuery,
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
