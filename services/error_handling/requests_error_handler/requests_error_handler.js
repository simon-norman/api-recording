

const requestsErrorHandler = ((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    error: {
      message: err.stack,
    },
  });
});

module.exports = requestsErrorHandler;
