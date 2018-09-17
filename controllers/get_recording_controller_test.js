
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const GetRecordingControllerFactory = require('./get_recording_controller');
const { getConfigForEnvironment } = require('../config/config.js');
const Recording = require('../models/recording');
const mongoose = require('mongoose');
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

  describe('Get recordings successfully', () => {
    let getRecordingController;
    let mockResponse;
    let config;

    const ensureRecordingCollectionEmpty = async () => {
      const recordings = await Recording.find({});
      if (recordings.length) {
        await Recording.collection.drop();
      }
    };

    const getPromiseToLoadSingleMockRecordingIntoDb = async () => {
      const mockRecording = new Recording({
        objectId: '2',
        timestampRecorded: 1537191000001,
        longitude: 20,
        latitude: 20,
        estimatedDeviceCategory: 'Mobile phone',
        spaceIds: ['1A', '2C'],
      });
      return mockRecording.save();
    };

    const loadMockRecordingsIntoDb = async () => {
      const promisesToLoadRecordings = [];
      for (let i = 1; i <= 3; i += 1) {
        const promise = getPromiseToLoadSingleMockRecordingIntoDb();
        promisesToLoadRecordings.push(promise);
      }
      await Promise.all(promisesToLoadRecordings);
    };

    const getExpectedRecordings = () => {
      const startTimeAsDate = new Date(parseInt(mockRequest.query.startTime, 10));
      const endTimeAsDate = new Date(parseInt(mockRequest.query.endTime, 10));
      return Recording.find({
        spaceIds: mockRequest.query.spaceId,
        timestampRecorded: { $gte: startTimeAsDate, $lt: endTimeAsDate },
      });
    };

    before(async () => {
      config = getConfigForEnvironment(process.env.NODE_ENV);
      await mongoose.connect(config.recordingDatabase.uri, { useNewUrlParser: true });

      await ensureRecordingCollectionEmpty();
      await loadMockRecordingsIntoDb();

      getRecordingController = GetRecordingControllerFactory(Recording);

      setUpMockRequest();
      mockResponse = mockRes();
    });

    after(async () => {
      await ensureRecordingCollectionEmpty();
      await mongoose.connection.close();
    });

    it('should retrieve all recordings for a specified space id and timeframe', async function () {
      const expectedRecordings = await getExpectedRecordings();
      await getRecordingController
        .getRecordingsBySpaceIdAndTimeframe(mockRequest, mockResponse);

      expect(mockResponse.status).always.have.been.calledOnceWithExactly(200);
      expect(mockResponse.json.args[0][0]).deep.equals(expectedRecordings);
    });
  });

  describe('Validation and error handling when getting recordings', () => {
    let mockRecordings;
    let stubbedFindRecordings;
    let mockRecordingModel;
    let getRecordingController;
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

      getRecordingController = GetRecordingControllerFactory(mockRecordingModel);

      setUpMockRequest();

      mockResponse = mockRes();

      nextSpy = sinon.spy();
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

    it('should pass 422 status code and error via Next to error handler if timeframe is more than 30 mins', async function () {
      mockRequest.query.startTime = 1536305399999;

      await getRecordingController
        .getRecordingsBySpaceIdAndTimeframe(mockRequest, mockResponse, nextSpy);

      expect(nextSpy.firstCall.args[0].status).to.equal(422);
      expect(nextSpy.firstCall.args[0].message).to.equal('Timeframe is invalid as it is more than 30 minutes');
    });

    it('should pass 422 status code and error via Next to error handler if start time is not passed', async function () {
      mockRequest.query.startTime = '';

      await getRecordingController
        .getRecordingsBySpaceIdAndTimeframe(mockRequest, mockResponse, nextSpy);

      expect(nextSpy.firstCall.args[0].status).to.equal(422);
      expect(nextSpy.firstCall.args[0].message).to.equal('No start time passed to get recordings');
    });

    it('should pass 422 status code and error via Next to error handler if end time is not passed', async function () {
      mockRequest.query.endTime = '';

      await getRecordingController
        .getRecordingsBySpaceIdAndTimeframe(mockRequest, mockResponse, nextSpy);

      expect(nextSpy.firstCall.args[0].status).to.equal(422);
      expect(nextSpy.firstCall.args[0].message).to.equal('No end time passed to get recordings');
    });

    it('should pass 422 status code and error via Next to error handler if space Id is not passed', async function () {
      mockRequest.query.spaceId = '';

      await getRecordingController
        .getRecordingsBySpaceIdAndTimeframe(mockRequest, mockResponse, nextSpy);

      expect(nextSpy.firstCall.args[0].status).to.equal(422);
      expect(nextSpy.firstCall.args[0].message).to.equal('No space Id passed to get recordings');
    });
  });
});

