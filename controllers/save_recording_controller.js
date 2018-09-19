
module.exports = (Recording) => {
  const saveRecordingController = {};

  saveRecordingController.saveRecordings = async (request, response, next) => {
    try {
      const recordings = request.body;

      const savedRecordings = await Recording.insertMany(recordings);

      response.status(200).json(savedRecordings);
    } catch (error) {
      next(error);
    }
  };

  return saveRecordingController;
};
