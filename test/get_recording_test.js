
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const { getConfigForEnvironment } = require('../config/config');
const GetRecordingControllerFactory = require('../controllers/get_recording_controller');
const Recording = require('../models/recording');
const GetRecordingRoutesFactory = require('../routes/recording_routes');
const ServerFactory = require('../server/server');
const mongoose = require('mongoose');
const request = require('supertest');

chai.use(sinonChai);
const { expect } = chai;


describe('Recording_actions', () => {
  let mockRequest;

  describe('Get recordings successfully', () => {
    let recordingsData;
    let server;
    let config;

    const setUpRecordingEndpoints = () => {
      const getRecordingController = GetRecordingControllerFactory(Recording);
      const recordingRoutes = GetRecordingRoutesFactory(getRecordingController);
      server = ServerFactory(recordingRoutes, config.webServer, sinon.stub());
    };

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

      setUpRecordingEndpoints();
    });

    beforeEach(async () => {
      resetRecordingsData();

      setUpMockRequest();

      await ensureRecordingCollectionEmpty();
    });

    after(async () => {
      await ensureRecordingCollectionEmpty();
      await mongoose.connection.close();
      process.exit();
    });

    it('should retrieve recordings for a space id and timeframe, excluding any that are less than the specified start time', async function () {
      recordingsData[0].timestampRecorded = 1537190999999;
      await loadRecordingsIntoDb();

      const response = await request(server).get('/recordings')
        .query(mockRequest.query);

      const expectedRecordings = await getExpectedRecordings();

      expect(response.status).equals(200);
      expect(response.body).deep.equals(expectedRecordings);
      expect(response.body.length).equals(3);
    });

    it('should exclude, when retrieving recordings, any that are greater than or equal to the specified end time', async function () {
      recordingsData[0].timestampRecorded = 1537191000002;
      recordingsData[1].timestampRecorded = 1537191000003;
      await loadRecordingsIntoDb();

      const response = await request(server).get('/recordings')
        .query(mockRequest.query);

      expect(response.status).equals(200);
      expect(response.body.length).equals(2);
    });
  });
});

