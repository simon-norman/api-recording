
const DependencyNotFoundError = require('../../services/error_handling/errors/DependencyNotFoundError');
const DependencyAlreadyRegisteredError = require('../../services/error_handling/errors/DependencyAlreadyRegisteredError');
const DiContainerStampFactory = require('../../dependency_injection/di_container');
const DiContainerInclStampsStampFactory = require('../../dependency_injection/di_container_incl_stamps');
const Recording = require('../../models/recording');
const SaveRecordingControllerFactory = require('../../controllers/save_recording_controller');
const GetRecordingControllerFactory = require('../../controllers/get_recording_controller');
const RecordingRoutesFactory = require('../../routes/recording_routes');
const RoutesFactory = require('../../routes/index');
const requestsErrorHandler = require('../../services/error_handling/requests_error_handler/requests_error_handler');
const { getConfigForEnvironment } = require('../../config/config.js');
const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');

let diContainer;
let registerDependency;
let registerDependencyFromFactory;

const getFunctionsFromDiContainer = () => {
  ({
    registerDependency,
    registerDependencyFromFactory,
  } = diContainer);

  registerDependency = registerDependency.bind(diContainer);
  registerDependencyFromFactory = registerDependencyFromFactory.bind(diContainer);
};

const setUpDiContainer = () => {
  const DiContainerStamp = DiContainerStampFactory(
    DependencyNotFoundError,
    DependencyAlreadyRegisteredError,
  );
  const DiContainerInclStampsStamp = DiContainerInclStampsStampFactory(DiContainerStamp);

  diContainer = DiContainerInclStampsStamp();
  getFunctionsFromDiContainer();
};

const registerRecordingRoutes = () => {
  registerDependency('Recording', Recording);

  registerDependencyFromFactory('saveRecordingController', SaveRecordingControllerFactory);
  registerDependencyFromFactory('getRecordingController', GetRecordingControllerFactory);

  registerDependencyFromFactory('recordingRoutes', RecordingRoutesFactory);
};

const registerRoutes = () => {
  registerRecordingRoutes();

  registerDependencyFromFactory('routes', RoutesFactory);
};

const wireUpApp = () => {
  setUpDiContainer();

  registerRoutes();
};

const connectToDatabase = () => {
  const config = getConfigForEnvironment(process.env.NODE_ENV);
  return mongoose.connect(config.recordingDatabase.uri, { useNewUrlParser: true });
};

const setUpAppForTestingEndpoints = async () => {
  wireUpApp();

  await connectToDatabase();

  const app = express();
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

  const routes = diContainer.getDependency('routes');
  app.use('/', routes);

  app.use(requestsErrorHandler);

  app.listen(3000);
  return app;
};

module.exports = setUpAppForTestingEndpoints;
