const express = require('express');
const crud = require('./crud');
const { protect, authorize } = require('../middleware/auth');
const { ApiError, asyncHandler } = require('../middleware/error');
const { Member, Sprint, Story, Risk } = require('../models');

const router = express.Router();
router.use(protect);
const managers = authorize('admin', 'manager');

/* Start a sprint — only one sprint can be active at a time. */
router.post(
  '/sprints/:id/start',
  managers,
  asyncHandler(async (req, res) => {
    if (await Sprint.exists({ status: 'active' })) throw new ApiError(409, 'Another sprint is already active');
    const stories = await Story.find({ sprint: req.params.id });
    await Story.updateMany({ sprint: req.params.id, status: 'backlog' }, { status: 'todo' });
    const sprint = await Sprint.findByIdAndUpdate(
      req.params.id,
      { status: 'active', committedPoints: stories.reduce((a, s) => a + s.points, 0) },
      { new: true }
    );
    if (!sprint) throw new ApiError(404, 'Sprint not found');
    res.json(sprint);
  })
);

/* Complete a sprint — unfinished stories roll back to the backlog. */
router.post(
  '/sprints/:id/complete',
  managers,
  asyncHandler(async (req, res) => {
    const stories = await Story.find({ sprint: req.params.id });
    const completedPoints = stories.filter((s) => s.status === 'done').reduce((a, s) => a + s.points, 0);
    await Story.updateMany({ sprint: req.params.id, status: { $ne: 'done' } }, { status: 'backlog', $unset: { sprint: 1 } });
    const sprint = await Sprint.findByIdAndUpdate(req.params.id, { status: 'completed', completedPoints }, { new: true });
    if (!sprint) throw new ApiError(404, 'Sprint not found');
    res.json(sprint);
  })
);

/* Velocity across completed sprints */
router.get(
  '/reports/velocity',
  asyncHandler(async (req, res) => {
    const sprints = await Sprint.find({ status: 'completed' }).sort('startDate');
    res.json(sprints.map((s) => ({ name: s.name, committed: s.committedPoints, completed: s.completedPoints })));
  })
);

router.use('/members', crud(Member, { searchFields: ['name', 'role'], writeGuard: managers }));
router.use('/sprints', crud(Sprint, { searchFields: ['name', 'goal'], writeGuard: managers }));
router.use('/stories', crud(Story, { searchFields: ['title', 'key', 'epic'] }));
router.use('/risks', crud(Risk, { searchFields: ['title', 'owner'] }));

module.exports = router;
