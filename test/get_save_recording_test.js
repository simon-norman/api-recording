
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const mongoose = require('mongoose');
const request = require('supertest');
const Recording = require('../models/recording');
const startApp = require('../app_startup');

chai.use(sinonChai);
const { expect } = chai;

const sinonSandbox = sinon.sandbox.create();


describe('Recording_actions', () => {
  let app;
  let mockRecordings;

  const ensureRecordingCollectionEmpty = async () => {
    const recordings = await Recording.find({});
    if (recordings.length) {
      await Recording.collection.drop();
    }
  };

  const setUpMockRecordings = () => {
    mockRecordings = [];
    for (let i = 1; i <= 4; i += 1) {
      mockRecordings.push({
        objectId: '2',
        timestampRecorded: 1537191000001,
        longitude: 20,
        latitude: 20,
        estimatedDeviceCategory: 'Mobile phone',
        spaceIds: ['1A', '2C'],
      });
    }
  };

  before(async () => {
    app = await startApp();
  });

  beforeEach(async () => {
    setUpMockRecordings();

    await ensureRecordingCollectionEmpty();
  });

  afterEach(() => {
    sinonSandbox.restore();
  });

  after(async () => {
    await ensureRecordingCollectionEmpty();
    await mongoose.connection.close();
    process.exit();
  });

  describe('Save recordings', () => {
    it('should save the recording successfully to the database', async function () {
      const response = await request(app)
        .post('/recordings')
        .send(mockRecordings);

      const recordingsInDb = await Recording.find({});
      const recordingsInSameFormatAsResponseBody = JSON.parse(JSON.stringify(recordingsInDb));

      expect(response.status).equals(200);
      expect(response.body).deep.equals(recordingsInSameFormatAsResponseBody);
    });

    it('should return an error response if an error is thrown during save recordings', async function () {
      const stubbedInsertManyRecordings = sinonSandbox.stub(Recording, 'insertMany');
      stubbedInsertManyRecordings.throws();

      const response = await request(app)
        .post('/recordings')
        .send(mockRecordings);

      expect(response.status).equals(500);
    });
  });

  describe('Get recordings successfully', () => {
    let mockQuery;

    const setUpMockRequest = () => {
      mockQuery = {
        // difference between start and end is 30 mins
        // which is maximum allowed by controller
        startTime: '1537191000000',
        endTime: '1537191000002',
        spaceId: '1A',
      };
    };

    const loadRecordingsIntoDb = async () => {
      await Recording.insertMany(mockRecordings);
    };

    const getExpectedRecordings = async () => {
      const startTimeAsDate = new Date(parseInt(mockQuery.startTime, 10));
      const endTimeAsDate = new Date(parseInt(mockQuery.endTime, 10));

      const expectedRecordings = await Recording.find({
        spaceIds: mockQuery.spaceId,
        timestampRecorded: { $gte: startTimeAsDate, $lt: endTimeAsDate },
      });

      const recordingsInSameFormatAsResponseBody = JSON.parse(JSON.stringify(expectedRecordings));
      return recordingsInSameFormatAsResponseBody;
    };

    beforeEach(async () => {
      setUpMockRequest();
    });

    it('should retrieve recordings for a space id and timeframe, excluding any that are less than the specified start time', async function () {
      mockRecordings[0].timestampRecorded = 1537190999999;
      await loadRecordingsIntoDb();

      const response = await request(app).get('/recordings')
        .query(mockQuery);

      const expectedRecordings = await getExpectedRecordings();

      expect(response.status).equals(200);
      expect(response.body).deep.equals(expectedRecordings);
      expect(response.body.length).equals(3);
    });

    it('should exclude, when retrieving recordings, any that are greater than or equal to the specified end time', async function () {
      mockRecordings[0].timestampRecorded = 1537191000002;
      mockRecordings[1].timestampRecorded = 1537191000003;
      await loadRecordingsIntoDb();

      const response = await request(app).get('/recordings')
        .query(mockQuery);

      expect(response.status).equals(200);
      expect(response.body.length).equals(2);
    });
  });
});

