const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

module.exports = (routes, webServerConfig, requestsErrorHandler, addAuthorizationToApp) => {
  let server = express();

  server = addAuthorizationToApp(server);
  server.use(cors());

  server.use(bodyParser.json({ limit: '50mb' }));
  server.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

  server.use('/', routes);

  server.use(requestsErrorHandler);

  server.listen(webServerConfig.port);

  return server;
};
