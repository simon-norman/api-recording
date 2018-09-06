

module.exports = (Recording) => {
  const getRecordingController = {};

  checkSpaceIdAndTimeframeParams = () => {

  };

  getRecordingController.getRecordingsBySpaceIdAndTimeframe = async (request, response, next) => {
    try {
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
    } catch (err) {
      const error = new Error(err.message);
      next(error);
    }
  };

  return getRecordingController;
};
