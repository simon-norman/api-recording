
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const mongoose = require('mongoose');
const request = require('supertest');
const Recording = require('../models/recording');
const promiseToLoadApp = require('../app.js');

chai.use(sinonChai);
const { expect } = chai;


describe('Recording_actions', () => {
  describe('Save recordings', () => {
    let mockRecordings;
    let app;

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

    const ensureRecordingCollectionEmpty = async () => {
      const recordings = await Recording.find({});
      if (recordings.length) {
        await Recording.collection.drop();
      }
    };

    before(async () => {
      app = await promiseToLoadApp;
    });

    beforeEach(async () => {
      setUpMockRecordings();

      await ensureRecordingCollectionEmpty();
    });

    after(async () => {
      await ensureRecordingCollectionEmpty();
      await mongoose.connection.close();
      process.exit();
    });

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
      const stubbedInsertManyRecordings = sinon.stub(Recording, 'insertMany');
      stubbedInsertManyRecordings.throws();

      const response = await request(app)
        .post('/recordings')
        .send(mockRecordings);

      expect(response.status).equals(500);
    });
  });
});

