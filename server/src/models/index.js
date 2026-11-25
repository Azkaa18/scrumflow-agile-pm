const mongoose = require('mongoose');

const { Schema } = mongoose;
const opts = { timestamps: true };

const Member = mongoose.model(
  'Member',
  new Schema(
    {
      name: { type: String, required: true },
      email: { type: String, lowercase: true },
      role: { type: String, enum: ['Frontend', 'Backend', 'Mobile', 'QA', 'Design', 'DevOps', 'PM'], default: 'Frontend' },
      capacity: { type: Number, default: 10, min: 0 }, // story points per sprint
      color: String,
    },
    opts
  )
);

const Sprint = mongoose.model(
  'Sprint',
  new Schema(
    {
      name: { type: String, required: true },
      goal: String,
      startDate: Date,
      endDate: Date,
      status: { type: String, enum: ['planned', 'active', 'completed'], default: 'planned' },
      committedPoints: Number,
      completedPoints: Number,
    },
    opts
  )
);

const storySchema = new Schema(
    {
      key: { type: String, unique: true },
      title: { type: String, required: true, trim: true },
      description: String,
      type: { type: String, enum: ['story', 'bug', 'task', 'spike'], default: 'story' },
      acceptanceCriteria: [String],
      points: { type: Number, enum: [0, 1, 2, 3, 5, 8, 13], default: 3 },
      priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
      status: { type: String, enum: ['backlog', 'todo', 'inprogress', 'review', 'done'], default: 'backlog' },
      sprint: { type: Schema.Types.ObjectId, ref: 'Sprint' },
      assignee: { type: Schema.Types.ObjectId, ref: 'Member' },
      epic: String,
      doneAt: Date,
    },
    opts
  );

// Hooks must be registered before the model is compiled.
storySchema.pre('save', async function assignKey(next) {
  if (!this.key) this.key = `SF-${100 + (await this.constructor.countDocuments())}`;
  if (this.isModified('status') && this.status === 'done') this.doneAt = new Date();
  next();
});
storySchema.pre('findOneAndUpdate', function stampDone(next) {
  const update = this.getUpdate() || {};
  if (update.status === 'done') update.doneAt = new Date();
  next();
});

const Story = mongoose.model('Story', storySchema);

const Risk = mongoose.model(
  'Risk',
  new Schema(
    {
      title: { type: String, required: true },
      category: { type: String, enum: ['Schedule', 'Scope', 'Technical', 'Resource', 'Vendor', 'Quality'], default: 'Technical' },
      probability: { type: Number, min: 1, max: 5, required: true },
      impact: { type: Number, min: 1, max: 5, required: true },
      owner: String,
      mitigation: String,
      status: { type: String, enum: ['open', 'mitigating', 'closed'], default: 'open' },
    },
    opts
  )
);

module.exports = { Member, Sprint, Story, Risk };
