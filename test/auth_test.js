
const { expect } = require('chai');
const express = require('express');
const axios = require('axios');
const request = require('supertest');
const addAuthorizationToApp = require('../services/authorization/auth');

describe('Auth0 middleware', function () {
  context('when initialised with the correct config and added to the app,', function () {
    let appWithAuthorization;

    const setUpTestAppWithAuthorization = () => {
      const testApp = express();
      appWithAuthorization = addAuthorizationToApp(testApp);

      appWithAuthorization.get('/some-resource', (req, res) => {
        res.status(200).send('Success!');
      });
    };

    const overrideDefaultExpressErrorHandlerToStopLogStacktraceInTests = () => {
      appWithAuthorization.use((error, req, res, next) => {
        res.status(error.status).send();
      });
    };

    const getErrorFromRejectedPromise = async (rejectedPromise) => {
      try {
        const result = await rejectedPromise;
        return result;
      } catch (error) {
        return error;
      }
    };

    beforeEach(() => {
      setUpTestAppWithAuthorization();

      overrideDefaultExpressErrorHandlerToStopLogStacktraceInTests();
    });

    context('and then a request is made WITHOUT an access token', function () {
      it('should NOT allow the requestor to access ANY endpoints', async function () {
        const response = request(appWithAuthorization)
          .get('/some-resource')
          .send();

        const responseError = await getErrorFromRejectedPromise(response);
        expect(responseError.status).equals(401);
      });
    });

    context('and then a request is made WITH a VALID access token', function () {
      it('should allow the requestor to access ALL endpoints', async function () {
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
          .set('authorization', `${validToken.data.token_type} ${validToken.data.access_token}`)
          .send();

        expect(response.status).equals(200);
        expect(response.text).equals('Success!');
      });
    });
  });
});

