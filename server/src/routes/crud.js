const express = require('express');
const { ApiError, asyncHandler } = require('../middleware/error');

/**
 * Generic REST router for a Mongoose model.
 *  GET    /         list (supports ?q=search&sort=-createdAt&limit=50&<field>=<value>)
 *  GET    /:id      read
 *  POST   /         create
 *  PUT    /:id      update
 *  DELETE /:id      delete
 */
module.exports = function crud(Model, { searchFields = [], populate = '', writeGuard } = {}) {
  const router = express.Router();
  const paths = Object.keys(Model.schema.paths);

  router.get(
    '/',
    asyncHandler(async (req, res) => {
      const { q, sort = '-createdAt', limit = 200, ...rest } = req.query;
      const filter = {};
      for (const [key, value] of Object.entries(rest)) if (paths.includes(key)) filter[key] = value;
      if (q && searchFields.length) {
        const rx = new RegExp(String(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        filter.$or = searchFields.map((f) => ({ [f]: rx }));
      }
      const items = await Model.find(filter).sort(sort).limit(Math.min(Number(limit) || 200, 1000)).populate(populate);
      res.json(items);
    })
  );

  router.get(
    '/:id',
    asyncHandler(async (req, res) => {
      const item = await Model.findById(req.params.id).populate(populate);
      if (!item) throw new ApiError(404, `${Model.modelName} not found`);
      res.json(item);
    })
  );

  const guard = writeGuard || ((req, res, next) => next());

  router.post(
    '/',
    guard,
    asyncHandler(async (req, res) => {
      const item = await Model.create({ ...req.body, createdBy: req.user?._id });
      res.status(201).json(item);
    })
  );

  router.put(
    '/:id',
    guard,
    asyncHandler(async (req, res) => {
      const item = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      if (!item) throw new ApiError(404, `${Model.modelName} not found`);
      res.json(item);
    })
  );

  router.delete(
    '/:id',
    guard,
    asyncHandler(async (req, res) => {
      const item = await Model.findByIdAndDelete(req.params.id);
      if (!item) throw new ApiError(404, `${Model.modelName} not found`);
      res.json({ message: `${Model.modelName} deleted`, _id: item._id });
    })
  );

  return router;
};
