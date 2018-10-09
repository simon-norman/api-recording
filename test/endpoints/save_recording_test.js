
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const mongoose = require('mongoose');
const request = require('supertest');
const Recording = require('../../models/recording');
const setUpAppForTestingEndpoints = require('./app_setup_for_testing_endpoints');

chai.use(sinonChai);
const { expect } = chai;

const sinonSandbox = sinon.sandbox.create();


describe('Save recordings endpoint,', function () {
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
    app = await setUpAppForTestingEndpoints();
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

  context('when called with valid recordings', function () {
    it('should save the recordings successfully to the database', async function () {
      const response = await request(app)
        .post('/recordings')
        .send(mockRecordings);

      const recordingsInDb = await Recording.find({});
      const recordingsInSameFormatAsResponseBody = JSON.parse(JSON.stringify(recordingsInDb));

      expect(response.status).equals(200);
      expect(response.body).deep.equals(recordingsInSameFormatAsResponseBody);
    });

    context('but there is an unexpected database error,', function () {
      it('should return a 500 response', async function () {
        const stubbedInsertManyRecordings = sinonSandbox.stub(Recording, 'insertMany');
        stubbedInsertManyRecordings.throws();

        const response = await request(app)
          .post('/recordings')
          .send(mockRecordings);

        expect(response.status).equals(500);
      });
    });
  });

  context('should return a 422 invalid recordings response when called with invalid recordings,', async function () {
    const expectToReturnInvalidRecordingResponse = async function (
      getMockInvalidRecordings,
      reasonRecordingsInvalid,
    ) {
      it(`like ${reasonRecordingsInvalid}`, async function () {
        const mockInvalidRecordings = getMockInvalidRecordings();

        const response = await request(app)
          .post('/recordings')
          .send(mockInvalidRecordings);

        expect(response.status).equals(422);
      });
    };

    expectToReturnInvalidRecordingResponse(() => {
      mockRecordings[0].timestampRecorded = '20th Feb 2017';
    }, 'timestampRecorded set as an invalid date');

    expectToReturnInvalidRecordingResponse(() => {
      mockRecordings[0].timestampRecorded = '';
    }, 'no date specified');

    expectToReturnInvalidRecordingResponse(() => {
      mockRecordings[0].objectId = '';
    }, 'no object ID specified');
  });
});

