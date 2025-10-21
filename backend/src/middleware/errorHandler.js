export const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Not Found - ${req.originalUrl}`));
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  const message = err.message || 'Server Error';
  const payload = {
    message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  };
  res.status(statusCode).json(payload);
};
