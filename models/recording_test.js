
const { expect } = require('chai');
const mongoose = require('mongoose');
const { getConfigForEnvironment } = require('../config/config.js');
const Recording = require('./recording.js');

describe('recording', () => {
  let config;
  let mockRecording;

  const ensureRecordingCollectionEmpty = async () => {
    const recordings = await Recording.find({});
    if (recordings.length) {
      Recording.collection.drop();
    }
  };

  const doesSaveRecordingThrowError = async (recording) => {
    try {
      await recording.save();
      return false;
    } catch (error) {
      return true;
    }
  };

  before(async () => {
    config = getConfigForEnvironment(process.env.NODE_ENV);
    await mongoose.connect(config.recordingDatabase.uri, { useNewUrlParser: true });
  });

  beforeEach(async () => {
    await ensureRecordingCollectionEmpty();

    mockRecording = {
      objectId: '2',
      timestampRecorded: Date.now(),
      longitude: 20,
      latitude: 20,
      estimatedDeviceCategory: 'Mobile phone',
      spaceIds: ['3', '4'],
    };
  });

  after(async () => {
    await ensureRecordingCollectionEmpty();
    await mongoose.connection.close();
  });

  it('should save recording when validation is successful', async function () {
    const recording = new Recording(mockRecording);
    const savedRecording = await recording.save();

    expect(savedRecording.objectId).to.equal(mockRecording.objectId);
    expect(savedRecording.timestampRecorded.getTime()).to.equal(mockRecording.timestampRecorded);
    expect(savedRecording.longitude).to.equal(mockRecording.longitude);
    expect(savedRecording.latitude).to.equal(mockRecording.latitude);
    expect(savedRecording.estimatedDeviceCategory).to.equal(mockRecording.estimatedDeviceCategory);
    expect(savedRecording.spaceIds[0]).to.equal(mockRecording.spaceIds[0]);
    expect(savedRecording.spaceIds[1]).to.equal(mockRecording.spaceIds[1]);
  });

  it('should reject save if timestamp not provided', async function () {
    mockRecording.timestampRecorded = '';
    const recording = new Recording(mockRecording);

    const wasErrorThrown = await doesSaveRecordingThrowError(recording);

    expect(wasErrorThrown).to.equal(true);
  });

  it('should reject save if timestamp not a valid date', async function () {
    mockRecording.timestampRecorded = 'not a valid date';
    const recording = new Recording(mockRecording);

    const wasErrorThrown = await doesSaveRecordingThrowError(recording);

    expect(wasErrorThrown).to.equal(true);
  });

  it('should reject save if objectId not provided', async function () {
    mockRecording.objectId = '';
    const recording = new Recording(mockRecording);

    const wasErrorThrown = await doesSaveRecordingThrowError(recording);

    expect(wasErrorThrown).to.equal(true);
  });
});

