const notFound = (req, res, next) => {
  const err = new Error('Route Not Found');
  err.status = 404;
  next(err);
};

const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  if (process.env.NODE_ENV !== 'test') {
    console.error(`[Error] ${status}: ${message}`);
    if (status === 500) {
      console.error(err.stack);
    }
  }

  res.status(status).json({
    error: {
      status,
      message
    }
  });
};

module.exports = { notFound, errorHandler };