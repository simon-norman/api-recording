
const { expect } = require('chai');
const mongoose = require('mongoose');
const { getConfigForEnvironment } = require('../config/config.js');
const DeviceInfo = require('./device_info');

describe('device_info', () => {
  let config;
  let mockDeviceInfo;

  const ensureDeviceInfoCollectionEmpty = async () => {
    const deviceInfos = await DeviceInfo.find({});
    if (deviceInfos.length) {
      await DeviceInfo.collection.drop();
    }
  };

  const doesSaveDeviceInfoThrowError = async () => {
    const deviceInfoBeforeSave = new DeviceInfo(mockDeviceInfo);
    try {
      await deviceInfoBeforeSave.save();
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
    await ensureDeviceInfoCollectionEmpty();

    mockDeviceInfo = {
      oui: '2',
      wifiChipManufacturer: 'Chip manufacturer',
      estimatedDeviceCategory: 'Mobile phone',
    };
  });

  after(async () => {
    await ensureDeviceInfoCollectionEmpty();
    await mongoose.connection.close();
  });

  it('should save device info when validation is successful', async function () {
    const deviceInfo = new DeviceInfo(mockDeviceInfo);
    const savedDeviceInfo = await deviceInfo.save();

    expect(savedDeviceInfo.oui).to.equal(mockDeviceInfo.oui);
    expect(savedDeviceInfo.wifiChipManufacturer).to.equal(mockDeviceInfo.wifiChipManufacturer);
    expect(savedDeviceInfo.estimatedDeviceCategory)
      .to.equal(mockDeviceInfo.estimatedDeviceCategory);
  });

  it('should reject save if oui not provided', async function () {
    mockDeviceInfo.oui = '';
    const wasErrorThrown = await doesSaveDeviceInfoThrowError();

    expect(wasErrorThrown).to.equal(true);
  });

  it('should reject save if wifi chip manufacturer not provided', async function () {
    mockDeviceInfo.wifiChipManufacturer = '';
    const wasErrorThrown = await doesSaveDeviceInfoThrowError();

    expect(wasErrorThrown).to.equal(true);
  });

  it('should reject save if estimated device category is not provided', async function () {
    mockDeviceInfo.estimatedDeviceCategory = '';
    const wasErrorThrown = await doesSaveDeviceInfoThrowError();

    expect(wasErrorThrown).to.equal(true);
  });

  it('should reject save if estimated device category is not a valid selection', async function () {
    mockDeviceInfo.estimatedDeviceCategory = 'some device category';
    const wasErrorThrown = await doesSaveDeviceInfoThrowError();

    expect(wasErrorThrown).to.equal(true);
  });
});

