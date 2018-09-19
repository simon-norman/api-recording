
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const RecordingControllerFactory = require('../controllers/get_recording_controller');
const { mockRes } = require('sinon-express-mock');

chai.use(sinonChai);
const { expect } = chai;


describe('Recording_controller', () => {
  let mockRequest;

  const setUpMockRequest = () => {
    mockRequest = {
      query: {
        // difference between start and end is 30 mins
        // which is maximum allowed by controller
        startTime: '1537191000000',
        endTime: '1537191000002',
        spaceId: '1A',
      },
    };
  };

  describe('Validation and error handling when getting recordings', () => {
    let mockRecordings;
    let stubbedFindRecordings;
    let mockRecordingModel;
    let recordingController;
    let mockResponse;
    let nextSpy;

    const setUpMockRecordingModel = () => {
      mockRecordings = ['Recording 1', 'Recording 2'];
      stubbedFindRecordings = sinon.stub();
      stubbedFindRecordings.returns(Promise.resolve(mockRecordings));
      mockRecordingModel = {
        find: stubbedFindRecordings,
      };
    };

    beforeEach(async () => {
      setUpMockRecordingModel();

      recordingController = RecordingControllerFactory(mockRecordingModel);

      setUpMockRequest();

      mockResponse = mockRes();

      nextSpy = sinon.spy();
    });

    it('should pass 404 error via Next to error handler if no recordings found', async function () {
      stubbedFindRecordings.returns(Promise.resolve([]));
      await recordingController
        .getRecordingsBySpaceIdAndTimeframe(mockRequest, mockResponse, nextSpy);

      expect(nextSpy.firstCall.args[0].status).to.equal(404);
      expect(nextSpy.firstCall.args[0].message).to.equal('Recordings not found');
    });

    it('should pass error via Next to error handler if error thrown during find', async function () {
      const errorDuringFind = new Error();
      stubbedFindRecordings.returns(Promise.reject(errorDuringFind));

      await recordingController
        .getRecordingsBySpaceIdAndTimeframe(mockRequest, mockResponse, nextSpy);

      expect(nextSpy.firstCall.args[0]).to.be.an.instanceof(Error);
    });

    it('should pass 422 status code and error via Next to error handler if timeframe is more than 30 mins', async function () {
      mockRequest.query.startTime = 1536305399999;

      await recordingController
        .getRecordingsBySpaceIdAndTimeframe(mockRequest, mockResponse, nextSpy);

      expect(nextSpy.firstCall.args[0].status).to.equal(422);
      expect(nextSpy.firstCall.args[0].message).to.equal('Timeframe is invalid as it is more than 30 minutes');
    });

    it('should pass 422 status code and error via Next to error handler if start time is not passed', async function () {
      mockRequest.query.startTime = '';

      await recordingController
        .getRecordingsBySpaceIdAndTimeframe(mockRequest, mockResponse, nextSpy);

      expect(nextSpy.firstCall.args[0].status).to.equal(422);
      expect(nextSpy.firstCall.args[0].message).to.equal('No start time passed to get recordings');
    });

    it('should pass 422 status code and error via Next to error handler if end time is not passed', async function () {
      mockRequest.query.endTime = '';

      await recordingController
        .getRecordingsBySpaceIdAndTimeframe(mockRequest, mockResponse, nextSpy);

      expect(nextSpy.firstCall.args[0].status).to.equal(422);
      expect(nextSpy.firstCall.args[0].message).to.equal('No end time passed to get recordings');
    });

    it('should pass 422 status code and error via Next to error handler if space Id is not passed', async function () {
      mockRequest.query.spaceId = '';

      await recordingController
        .getRecordingsBySpaceIdAndTimeframe(mockRequest, mockResponse, nextSpy);

      expect(nextSpy.firstCall.args[0].status).to.equal(422);
      expect(nextSpy.firstCall.args[0].message).to.equal('No space Id passed to get recordings');
    });
  });
});

