
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const SaveRecordingControllerFactory = require('./save_recording_controller');
const { getConfigForEnvironment } = require('../config/config');
const mongoose = require('mongoose');
const { mockRes } = require('sinon-express-mock');
const Recording = require('../models/recording');
const RecordingRoutesFactory = require('../routes/recording_routes');
const RoutesFactory = require('../routes/index');
const ServerFactory = require('../server/server.js');

chai.use(sinonChai);
const { expect } = chai;


describe('Save recording', () => {
  describe('Save recording successfully', () => {
    it('should save recording', async function () {
      const saveRecordingController = SaveRecordingControllerFactory(Recording);
      const recordingRoutes = RecordingRoutesFactory(saveRecordingController);
      // clear db
      // set up app with stubbed error handler, routes, controller, and model
      // call app
      // check saved recording returned
    });
  });
});

