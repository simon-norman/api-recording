
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const { getConfigForEnvironment } = require('../config/config');
const RecordingControllerFactory = require('../controllers/recording_controller');
const Recording = require('../models/recording');
const RecordingRoutesFactory = require('../routes/recording_routes');
const ServerFactory = require('../server/server.js');
const mongoose = require('mongoose');
const request = require('supertest');

chai.use(sinonChai);
const { expect } = chai;


describe('Recording_controller', () => {
  let mockRequest;

  describe('Get recordings successfully', () => {
    let recordingsData;
    let server;
    let config;

    const ensureRecordingCollectionEmpty = async () => {
      const recordings = await Recording.find({});
      if (recordings.length) {
        await Recording.collection.drop();
      }
    };

    const resetRecordingsData = () => {
      recordingsData = [];
      for (let i = 1; i <= 4; i += 1) {
        recordingsData.push({
          objectId: '2',
          timestampRecorded: 1537191000001,
          longitude: 20,
          latitude: 20,
          estimatedDeviceCategory: 'Mobile phone',
          spaceIds: ['1A', '2C'],
        });
      }
    };

    const setUpRecordingEndpoints = () => {
      const recordingController = RecordingControllerFactory(Recording);
      const recordingRoutes = RecordingRoutesFactory(recordingController);
      server = ServerFactory(recordingRoutes, config.webServer, sinon.stub());
    };

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

    const loadRecordingsIntoDb = async () => {
      await Recording.insertMany(recordingsData);
    };

    const getExpectedRecordings = async () => {
      const startTimeAsDate = new Date(parseInt(mockRequest.query.startTime, 10));
      const endTimeAsDate = new Date(parseInt(mockRequest.query.endTime, 10));

      const expectedRecordings = await Recording.find({
        spaceIds: mockRequest.query.spaceId,
        timestampRecorded: { $gte: startTimeAsDate, $lt: endTimeAsDate },
      });

      const recordingsInSameFormatAsResponseBody = JSON.parse(JSON.stringify(expectedRecordings));
      return recordingsInSameFormatAsResponseBody;
    };

    before(async () => {
      config = getConfigForEnvironment(process.env.NODE_ENV);
      await mongoose.connect(config.recordingDatabase.uri, { useNewUrlParser: true });
    });

    beforeEach(async () => {
      resetRecordingsData();

      setUpRecordingEndpoints();

      setUpMockRequest();

      await ensureRecordingCollectionEmpty();
    });

    after(async () => {
      await ensureRecordingCollectionEmpty();
      await mongoose.connection.close();
    });

    it('should retrieve all recordings for a specified space id and timeframe', async function () {
      await loadRecordingsIntoDb();

      const response = await request(server).get('/recordings')
        .query(mockRequest.query);

      const expectedRecordings = await getExpectedRecordings();

      expect(response.status).equals(200);
      expect(response.body).deep.equals(expectedRecordings);
    });
  });
});

