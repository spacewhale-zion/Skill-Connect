
/**
 * A middleware factory that takes a Zod schema and returns
 * a middleware function to validate req.body against it.
 *
 * @param {z.ZodSchema} schema - The Zod schema to validate against.
 */
const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({
      message: 'Invalid request data.',
      errors: error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      })),
    });
  }
};

export { validate };