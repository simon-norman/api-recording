
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const SaveRecordingControllerFactory = require('./save_recording_controller');
const { getConfigForEnvironment } = require('../config/config');
const mongoose = require('mongoose');
const { mockRes } = require('sinon-express-mock');

chai.use(sinonChai);
const { expect } = chai;


describe('Save recording', () => {
  describe('Save recording successfully', () => {
    it('should save recording', async function () {
      // clear db
      // set up app with stubbed error handler, routes, controller, and model
      // call app
      // check saved recording returned
    });
  });
});

