
const { expect } = require('chai');
const express = require('express');
const axios = require('axios');
const request = require('supertest');
const addAuthorizationToApp = require('../services/authorization/auth');

describe('Auth0 middleware', function () {
  context('when initialised with the correct config and added to the app, and then a request is made WITHOUT a valid access token', function () {
    it('should NOT allow the requestor to access ANY endpoints', async function () {
      const testApp = express();
      const appWithAuthorization = addAuthorizationToApp(testApp);
      appWithAuthorization.get('/some-resource', (request, response) => {
        response.status(200).send('Success!');
      });

      const validToken = await axios.post(
        'https://recordings.eu.auth0.com/oauth/token',
        {
          grant_type: 'client_credentials',
          client_id: 'RLZ307GIruy1BWkURusz3xt0eL9EAAC8',
          client_secret: process.env.RECORDINGS_API_TEST_CLIENT_SECRET,
          audience: 'https://api-recording.herokuapp.com/',
        },
      );

      const response = await request(appWithAuthorization)
        .get('/some-resource')
        .send();


      expect(response.status).equals(401);
    });
  });
});

