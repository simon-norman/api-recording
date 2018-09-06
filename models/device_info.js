const mongoose = require('mongoose');

const { Schema } = mongoose;

const DeviceInfoSchema = new Schema({
  oui: { type: String, required: true },
  wifiChipManufacturer: { type: String, required: true },
  estimatedDeviceCategory: { type: String, enum: ['PC / Laptop', 'Mobile phone'], required: false },
});

const DeviceInfo = mongoose.model('DeviceInfo', DeviceInfoSchema);

module.exports = DeviceInfo;
