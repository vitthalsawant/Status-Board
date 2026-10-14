const ApiError = require('../utils/ApiError');

const validate = (schema, source = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[source], {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
  });

  if (error) {
    const errors = error.details.map((detail) => ({
      field: detail.path.join('.') || source,
      message: detail.message.replace(/"/g, ''),
    }));
    return next(new ApiError(400, 'Validation failed', errors));
  }

  req[source] = value;
  next();
};

module.exports = validate;
