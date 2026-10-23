import { z } from 'zod';

export function validate(schema, target = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      return next(result.error);
    }
    req[target] = result.data;
    return next();
  };
}

export function validateQuery(schema) {
  return validate(schema, 'query');
}
