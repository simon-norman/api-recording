
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const GetRecordingControllerFactory = require('./get_recording_controller');
const { mockRes } = require('sinon-express-mock');

chai.use(sinonChai);
const { expect } = chai;


describe('Recording_controller', () => {
  describe('Get recordings', () => {
    let mockRecordings;
    let stubbedFindRecordings;
    let mockRecordingModel;
    let getRecordingController;
    let mockRequest;
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

    const setUpMockRequest = () => {
      mockRequest = {
        params: {
          // difference between start and end is 1 hour
          // which is maximum allowed by controller
          startTime: 1536249600,
          endTime: 1536253200,
          spaceId: '1A',
        },
      };
    };

    beforeEach(() => {
      setUpMockRecordingModel();

      getRecordingController = GetRecordingControllerFactory(mockRecordingModel);

      setUpMockRequest();

      mockResponse = mockRes();

      nextSpy = sinon.spy();
    });

    it('should retrieve all recordings for a specified space id and timeframe', async function () {
      await getRecordingController
        .getRecordingsBySpaceIdAndTimeframe(mockRequest, mockResponse);

      expect(stubbedFindRecordings).always.have.been.calledOnceWithExactly({
        spaceId: mockRequest.params.spaceId,
        timestampRecorded:
        {
          $gte: mockRequest.params.startTime,
          $lt: mockRequest.params.endTime,
        },
      });
      expect(mockResponse.status).always.have.been.calledOnceWithExactly(200);
      expect(mockResponse.json).always.have.been.calledOnceWithExactly(mockRecordings);
    });

    it('should pass 404 error via Next to error handler if no recordings found', async function () {
      stubbedFindRecordings.returns(Promise.resolve([]));
      await getRecordingController
        .getRecordingsBySpaceIdAndTimeframe(mockRequest, mockResponse, nextSpy);

      expect(nextSpy.firstCall.args[0].status).to.equal(404);
      expect(nextSpy.firstCall.args[0].message).to.equal('Recordings not found');
    });

    it('should pass error via Next to error handler if error thrown during find', async function () {
      const errorDuringFind = new Error();
      stubbedFindRecordings.returns(Promise.reject(errorDuringFind));

      await getRecordingController
        .getRecordingsBySpaceIdAndTimeframe(mockRequest, mockResponse, nextSpy);

      expect(nextSpy.firstCall.args[0]).to.be.an.instanceof(Error);
    });

    it('should pass 402 status code and error via Next to error handler if timeframe is more than 60 mins', async function () {
      mockRequest.params.startTime = 1536249599;

      await getRecordingController
        .getRecordingsBySpaceIdAndTimeframe(mockRequest, mockResponse, nextSpy);

      expect(nextSpy.firstCall.args[0].status).to.equal(422);
      expect(nextSpy.firstCall.args[0].message).to.equal('Timeframe is invalid as it is more than 60 minutes');
    });
  });
});

