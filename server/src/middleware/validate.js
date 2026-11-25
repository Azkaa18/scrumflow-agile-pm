const { ApiError } = require('./error');

/**
 * Tiny schema validator — keeps the API dependency-light.
 * rules: { field: { required, type, min, max, enum, email } }
 */
const validate = (rules) => (req, res, next) => {
  const errors = [];
  for (const [field, rule] of Object.entries(rules)) {
    const value = req.body[field];
    const missing = value === undefined || value === null || value === '';
    if (rule.required && missing) {
      errors.push(`${field} is required`);
      continue;
    }
    if (missing) continue;
    if (rule.type === 'number' && typeof value !== 'number') errors.push(`${field} must be a number`);
    if (rule.type === 'string' && typeof value !== 'string') errors.push(`${field} must be a string`);
    if (rule.min !== undefined && (typeof value === 'number' ? value : String(value).length) < rule.min)
      errors.push(`${field} must be at least ${rule.min}`);
    if (rule.max !== undefined && (typeof value === 'number' ? value : String(value).length) > rule.max)
      errors.push(`${field} must be at most ${rule.max}`);
    if (rule.enum && !rule.enum.includes(value)) errors.push(`${field} must be one of: ${rule.enum.join(', ')}`);
    if (rule.email && !/^\S+@\S+\.\S+$/.test(value)) errors.push(`${field} must be a valid email`);
  }
  if (errors.length) return next(new ApiError(400, errors.join(', ')));
  next();
};

module.exports = validate;
