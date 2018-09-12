
const { expect } = require('chai');
const Raven = require('raven');
const sinon = require('sinon');

describe('logger', () => {
  let logException;
  let wrapperToHandleUnhandledExceptions;
  let mockError;
  let consoleLogSpy;
  let stubbedRavenCaptureException;

  before(() => {
    const mockErrorMessage = 'mock error message';
    mockError = new Error(mockErrorMessage);
    consoleLogSpy = sinon.spy(console, 'log');
    stubbedRavenCaptureException = sinon.stub(Raven, 'captureException');
  });

  beforeEach(() => {
    consoleLogSpy.resetHistory();
    stubbedRavenCaptureException.resetHistory();
  });

  describe('logging and error handling in production', () => {
    before(() => {
      process.env.NODE_ENV = 'production';
      ({ logException } = require('./logger.js'));
    });

    after(() => {
      process.env.NODE_ENV = 'development';
      delete (require.cache[require.resolve('./logger.js')]);
    });

    it('should log exceptions with Raven when in production', async function () {
      mockError = new Error('error');
      logException(mockError);

      expect(stubbedRavenCaptureException.calledOnceWithExactly(mockError)).to.equal(true);
    });
  });

  describe('logging and error handling in development', () => {
    before(() => {
      process.env.NODE_ENV = 'development';
      ({ logException, wrapperToHandleUnhandledExceptions } = require('./logger.js'));
    });

    it('should log any unhandled exceptions to the console when NOT in production', function () {
      wrapperToHandleUnhandledExceptions(() => {
        throw mockError;
      });

      expect(consoleLogSpy.calledOnceWithExactly(mockError)).to.equal(true);
    });

    it('should log exception stack to the console when NOT in production', function () {
      logException(mockError);

      expect(consoleLogSpy.calledOnceWithExactly(mockError.stack)).to.equal(true);
    });
  });
});

